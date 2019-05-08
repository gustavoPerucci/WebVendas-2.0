# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from cadastros.clientes.models import Clientes
from cadastros.clientes.forms import FormCadastroClientes
import traceback
from django.http import HttpResponse, QueryDict, HttpResponseRedirect
import json
from functions.views import deserialize_form
from cadastros.usuarios.models import Usuarios
from functions.views import NORMALIZAR
from django.contrib import messages


@login_required
def cadastro_clientes(request, pessoa_fisica=None, pessoa_juridica=None):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
        messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
        não pode mais acessar nosso sistema...''')
        return HttpResponseRedirect('/logout/')

    template = ''
    if pessoa_fisica:
        sub_titulo = 'Cadastro de clientes pessoa física'
        template = 'clientes_pessoa_fisica'
    if pessoa_juridica:
        sub_titulo = 'Cadastro de clientes pessoa jurídica'
        template = 'clientes_pessoa_juridica'
    try:

        form_cliente = FormCadastroClientes()
    except:
        trace = traceback.format_exc()
        erro = 1
        if request.user.is_superuser:
            mensagem = 'Houve um erro interno no sistema. ' + trace
        else:
            mensagem = '''Houve um erro interno no sistema.
            Por favor, contate o suporte técnico através do E-mail: suporte@atpcsistemas.com.br.'''

    return render(request, 'clientes/'+template+'.html', locals(),)


@login_required
def cadastrar_cliente(request):
    cliente_id = request.POST.get('id')
    pessoa = request.POST.get('pessoa')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []

    if cliente_id != '0':
        cliente = Clientes.objects.get(id=int(cliente_id))

    else:
        cliente = None

    if request.method == 'POST':
        form = deserialize_form(request.POST.get('form'))
        form = FormCadastroClientes(form, instance=cliente)

        if form.is_valid():
            registro = form.save(commit=False)
            # registro.nome_razao_social = NORMALIZAR(registro.nome_razao_social)
            # registro.nome_fantasia = NORMALIZAR(registro.nome_fantasia)
            # registro.sobre_nome = NORMALIZAR(registro.sobre_nome)
            if not cliente_id != '0':
                registro.empresa = usuario.empresa
                registro.usuario = int(usuario.id)
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


def muda_status_cliente(request):
    # usuario = Usuarios.objects.get(usuario=request.user.id)
    sucesso = {}
    mensagem = ''
    titulo = ''
    if request.method == 'POST':
        cliente = Clientes.objects.get(pk=int(QueryDict(request.body).get('id_cliente')))
        status = QueryDict(request.body).get('status')

        cliente.status = status
        cliente.save()

        if status == 'ATIVO':
            mensagem = 'Cliente ativado com sucesso !!!'
            titulo = 'ATIVAR CADASTRO DE CLIENTE ...'

        elif status == 'INATIVO':
            mensagem = 'Cliente desativado com sucesso !!!'
            titulo = 'DESATIVAR CADASTRO DE CLIENTE ...'

        elif status == 'EXCLUIDO':
            mensagem = 'Cliente excluído com sucesso !!!'
            titulo = 'EXCLUIR CADASTRO DE CLIENTE ...'

        elif status == 'BLOQUEADO':
            mensagem = 'Cliente bloqueado com sucesso !!!'
            titulo = 'BLOQUEAR CADASTRO DE CLIENTE ...'

        elif status == 'INADIPLENTE':
            mensagem = 'Cliente posto em inadiplência com sucesso !!!'
            titulo = 'COLOCAR CLIENTE EM INADIPLENCIA ...'

        sucesso['mensagem'] = mensagem
        sucesso['titulo'] = titulo
        sucesso['status'] = status

    return HttpResponse(
            json.dumps(sucesso), content_type="application/json")


def buscar_clientes(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    pessoa = request.GET.get('pessoa')
    tb_clientes = {}
    mensagem = ''
    clientes = []
    classe = ''
    if 'status' in request.GET and request.GET['status']:
        status = request.GET.get('status')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_cliente:
            tb_clientes = Clientes.objects.filter(empresa=usuario.empresa.id, status=status, pessoa=pessoa)
        elif usuario.permissoes.administrador_super:
            tb_clientes = Clientes.objects.filter(status=status, pessoa=pessoa)

    if 'nome' in request.GET and request.GET['nome']:
        nome = request.GET.get('nome')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_cliente:
            tb_clientes = Clientes.objects.filter(empresa=usuario.empresa.id, pessoa=pessoa, nome_razao_social__contains=nome.upper()).order_by('nome_razao_social')
        elif usuario.permissoes.administrador_super:
            tb_clientes = Clientes.objects.filter(
                nome_razao_social__contains=nome.upper(), pessoa=pessoa).order_by('nome_razao_social')

        if not tb_clientes:
            if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_cliente:
                tb_clientes = Clientes.objects.filter(empresa=usuario.empresa.id, pessoa=pessoa, nome_razao_social__contains=nome.lower()).order_by('nome_razao_social')
            elif usuario.permissoes.administrador_super:
                tb_clientes = Clientes.objects.filter(
                    nome_razao_social__contains=nome.lower(), pessoa=pessoa).order_by('nome_razao_social')

        if not tb_clientes:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Nenhum Registro correspondeu a sua pesquisa.'
        else:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Um total de ' + str(len(tb_clientes)) + ' registros corresponderam á sua pesquisa.'

    if 'id_cliente' in request.GET and request.GET['id_cliente']:
        id_cliente = request.GET.get('id_cliente')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_cliente:
            tb_clientes = Clientes.objects.filter(empresa=usuario.empresa.id, pessoa=pessoa, pk=int(id_cliente))
        elif usuario.permissoes.administrador_super:
            tb_clientes = Clientes.objects.filter(pk=int(id_cliente), pessoa=pessoa)

    for index in tb_clientes:

        if index.status == 'ATIVO':
            classe = 'success'
        elif index.status == 'EXCLUIDO' or index.status == 'BLOQUEADO' or index.status == 'INADIPLENTE':
            classe = 'danger'
        elif index.status == 'INATIVO':
            classe = 'warning'

        clientes += [
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
    retorno = json.dumps(clientes)
    return HttpResponse(retorno, content_type='application/json')


def buscar_cliente(request):
    cliente = {}
    id = 0
    pessoa = request.GET.get('pessoa')
    id = request.GET.get('id')
    try:
        cliente = Clientes.objects.get(pk=int(id), pessoa=pessoa)
    except:
        pass

    if cliente:
        form = FormCadastroClientes(instance=cliente)
        titulo = 'BUSCANADO REGISTROS . . .'
        mensagem = 'Busca efetuada com sucesso ! ! !'
    else:
        cliente = None
        form = FormCadastroClientes(instance=cliente)
        id = 0
        titulo = 'CLIENTE NÃO CADASTRADO . . .'
        mensagem = '''Lembre-se, um cliente pode ser cadastrado como pessoa física ou jurídica,
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