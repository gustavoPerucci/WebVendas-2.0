# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from cadastros.fornecedores.models import Fornecedores
from cadastros.fornecedores.forms import FormCadastroFornecedores
import traceback
from django.http import HttpResponse, HttpResponseRedirect, QueryDict
import json
from functions.views import deserialize_form
from cadastros.usuarios.models import Usuarios
from functions import msg
from functions.views import NORMALIZAR
from django.contrib import messages


@login_required
def cadastrar_fornecedor(request):
    fornecedor_id = request.POST.get('id')
    pessoa = request.POST.get('pessoa')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []

    if fornecedor_id != '0':
        fornecedor = Fornecedores.objects.get(id=int(fornecedor_id))

    else:
        fornecedor = None

    if request.method == 'POST':
        form = deserialize_form(request.POST.get('form'))
        form = FormCadastroFornecedores(form, instance=fornecedor)

        if form.is_valid():
            registro = form.save(commit=False)
            registro.nome_razao_social = NORMALIZAR(registro.nome_razao_social)
            registro.nome_fantasia = NORMALIZAR(registro.nome_fantasia)
            registro.sobre_nome = NORMALIZAR(registro.sobre_nome)
            if not fornecedor_id != '0':
                registro.empresa = usuario.empresa
                registro.pessoa = pessoa
                titulo_mensagem = 'SALVANDO REGISTRO . . .'
                mensagem = 'O registro foi salvo com sucesso !!!'

            else:
                titulo_mensagem = 'ALTERANDO REGISTRO . . .'
                mensagem = 'O registro foi alterado com sucesso !!!'

            registro.save()

            sucesso['success'] = True
            sucesso['mensagem'] = mensagem
            sucesso['id'] = registro.id
            sucesso['titulo'] = titulo_mensagem
            retorno = json.dumps(sucesso)

        else:

            for error in form.errors:
                erro += {error}

            titulo_mensagem = 'ERRO NA VALIDAÇÃO DOS DADOS . . .'
            mensagem = '''O formulário apresentou erros no seu preenchimento.
                       Corrija os campos listados em vermelho e tente novamente. . .'''

            retorno = json.dumps({
                'titulo': titulo_mensagem,
                'mensagem': mensagem,
                'erro': erro,
            })
    return HttpResponse(retorno, content_type="application/json")


@login_required
def cadastro_fornecedores(request, pessoa_fisica=None, pessoa_juridica=None):
    usuario = Usuarios.objects.get(usuario=request.user.id)

    if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
        messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
        não pode mais acessar nosso sistema...''')
        return HttpResponseRedirect('/logout/')

    template = ''
    try:

        form_fornecedores = FormCadastroFornecedores()
        if pessoa_fisica:
            sub_titulo = 'Fornecedores'
            template = 'fornecedores_pessoa_fisica'
        if pessoa_juridica:
            sub_titulo = 'Fornecedores'
            template = 'fornecedores_pessoa_juridica'
    except:
        trace = traceback.format_exc()
        erro = 1
        if request.user.is_superuser:
            mensagem = 'Houve um erro interno no sistema. ' + trace
        else:
            mensagem = '''Houve um erro interno no sistema.
            Por favor, contate o suporte técnico através do E-mail: suporte@atpcsistemas.com.br.'''

    return render(request, 'fornecedores/'+template+'.html', locals(),)


def muda_status_fornecedor(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    sucesso = {}
    mensagem = ''
    titulo = ''
    if not usuario.permissoes.muda_status_fornecedor and not usuario.permissoes.administrador_super and not usuario.permissoes.administrador:
        sucesso['mensagem'] = msg.msg_permissao_negada
        sucesso['titulo'] = msg.titulo_permissao_negada
        return HttpResponse(json.dumps(sucesso), content_type="application/json")

    if request.method == 'POST':
        fornecedor = Fornecedores.objects.get(pk=int(QueryDict(request.body).get('id_fornecedor')))
        status = QueryDict(request.body).get('status')

        fornecedor.status = status
        fornecedor.save()

        if status == 'ATIVO':
            mensagem = 'Fornecedor ativado com sucesso !!!'
            titulo = 'ATIVAR CADASTRO DE FORNECEDOR ...'

        elif status == 'INATIVO':
            mensagem = 'Fornecedor desativado com sucesso !!!'
            titulo = 'DESATIVAR CADASTRO DE FORNECEDOR ...'

        elif status == 'EXCLUIDO':
            mensagem = 'Fornecedor excluído com sucesso !!!'
            titulo = 'EXCLUIR CADASTRO DE FORNECEDOR ...'

        elif status == 'BLOQUEADO':
            mensagem = 'Fornecedor bloqueado com sucesso !!!'
            titulo = 'BLOQUEAR CADASTRO DE FORNECEDOR ...'

        sucesso['mensagem'] = mensagem
        sucesso['titulo'] = titulo
        sucesso['status'] = status

    return HttpResponse(
            json.dumps(sucesso), content_type="application/json")


def buscar_fornecedores(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    pessoa = request.GET.get('pessoa')
    tb_fornecedores = {}
    mensagem = ''
    fornecedores = []
    classe = ''
    if 'status' in request.GET and request.GET['status']:
        status = request.GET.get('status')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_fornecedor:
            tb_fornecedores = Fornecedores.objects.filter(empresa=usuario.empresa.id, status=status, pessoa=pessoa).order_by('nome_razao_social')

        elif usuario.permissoes.administrador_super:
            tb_fornecedores = Fornecedores.objects.filter(pessoa=pessoa, status=status).order_by('nome_razao_social')

    if 'nome' in request.GET and request.GET['nome']:
        nome = request.GET.get('nome')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_fornecedor:
            tb_fornecedores = Fornecedores.objects.filter(
                empresa=usuario.empresa.id, pessoa=pessoa, nome_razao_social__contains=nome.upper()).order_by(
                'nome_razao_social')
        elif usuario.permissoes.administrador_super:
            tb_fornecedores = Fornecedores.objects.filter(
                pessoa=pessoa, nome_razao_social__contains=nome.upper()).order_by(
                'nome_razao_social')

        if not tb_fornecedores:
            if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_fornecedor:
                tb_fornecedores = Fornecedores.objects.filter(
                    empresa=usuario.empresa.id, pessoa=pessoa, nome_razao_social__contains=nome.lower()).order_by('nome_razao_social')
            elif usuario.permissoes.administrador_super:
                tb_fornecedores = Fornecedores.objects.filter(
                    nome_razao_social__contains=nome.lower(), pessoa=pessoa).order_by('nome_razao_social')

        if not tb_fornecedores:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Nenhum Registro correspondeu a sua pesquisa.'
        else:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Um total de ' + str(len(tb_fornecedores)) + ' registros corresponderam á sua pesquisa.'

    if 'id_fornecedor' in request.GET and request.GET['id_fornecedor']:
        id_fornecedor = request.GET.get('id_fornecedor')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_fornecedor:
            tb_fornecedores = Fornecedores.objects.filter(empresa=usuario.empresa.id, pessoa=pessoa, pk=int(id_fornecedor))

        elif usuario.permissoes.administrador_super:
            tb_fornecedores = Fornecedores.objects.filter(pk=int(id_fornecedor), pessoa=pessoa)

    for index in tb_fornecedores:

        if index.status == 'ATIVO':
            classe = 'success'
        elif index.status == 'EXCLUIDO' or index.status == 'BLOQUEADO':
            classe = 'danger'
        elif index.status == 'INATIVO':
            classe = 'warning'

        fornecedores += [
            {
                'nome_razao_social': index.nome_razao_social,
                'sobre_nome': index.sobre_nome,
                'rg_inscricao_estadual': index.rg_inscricao_estadual,
                'cpf_cnpj': index.cpf_cnpj,
                'contato': index.contato,
                'telefone': index.telefone,
                'celular': index.celular,
                'email': index.email,
                'data_nascimento_fundacao': str(index.data_nascimento_fundacao),
                'estado_civil': index.estado_civil,
                'sexo': index.sexo,
                'cep': index.cep,
                'endereco': index.endereco,
                'numero': index.numero,
                'complemento': index.complemento,
                'bairro': index.bairro,
                'cidade': index.cidade,
                'estado': index.estado,
                'status': index.status,
                'inscricao_municipal': index.inscricao_municipal,
                'nome_fantasia': index.nome_fantasia,
                'empresa': str(index.empresa),
                'id': index.id,
                'classe': classe,
                'mensagem': mensagem,
            }
        ]
    retorno = json.dumps(fornecedores)
    return HttpResponse(retorno, content_type='application/json')


def buscar_fornecedor(request):
    fornecedor = {}
    id = 0
    pessoa = request.GET.get('pessoa')
    id = request.GET.get('id')
    try:
        fornecedor = Fornecedores.objects.get(pk=int(id), pessoa=pessoa)
    except:
        pass

    if fornecedor:
        form = FormCadastroFornecedores(instance=fornecedor)
        titulo = 'BUSCANADO REGISTROS . . .'
        mensagem = 'Busca efetuada com sucesso ! ! !'
    else:
        fornecedor = None
        form = FormCadastroFornecedores(instance=fornecedor)
        id = 0
        titulo = 'FORNECEDOR NÃO CADASTRADO . . .'
        mensagem = '''Lembre-se, um fornecedor pode ser cadastrado como pessoa física ou jurídica,
        faça a busca nos dois cadastros, caso não encontre, o mesmo deverá ser cadastrado.
         '''

    campos = {}
    for campo in form.fields:
        if campo in form.initial:
            campos[form.auto_id % campo] = str(form.initial[campo])

    retorno = json.dumps({
        'id': id,
        'titulo': titulo,
        'mensagem': mensagem,
        'campos': campos,
    })
    return HttpResponse(retorno, content_type='application/json')
