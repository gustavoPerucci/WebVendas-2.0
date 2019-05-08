# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, HttpResponseRedirect
from cadastros.colaboradores.models import Colaboradores
from cadastros.colaboradores.forms import FormCadastroColaboradores
from cadastros.usuarios.models import Usuarios
from django.http import HttpResponse
from django.http import QueryDict
import json
from functions.views import deserialize_form
from functions.views import mensagem_erro_padrao, titulo_mensagem_erro_padrao, mensagem_permissao_negada, titulo_mensagem_permissao_negada
from functions.views import NORMALIZAR
from django.contrib import messages


@login_required
def cadastro_colaboradores(request):
    sub_titulo = 'Colaboradores'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
        messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
        não pode mais acessar nosso sistema...''')
        return HttpResponseRedirect('/logout/')

    form_colaboradores = FormCadastroColaboradores()

    return render(request, "colaboradores/colaboradores.html", locals())


@login_required
def cadastrar_colaborador(request):
    colaborador_id = request.POST.get('id')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []
    if colaborador_id != '0':
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.edita_colaborador:
            sucesso['negado'] = 1
            sucesso['mensagem'] = mensagem_permissao_negada()
            sucesso['titulo'] = titulo_mensagem_permissao_negada()
            retorno = json.dumps(sucesso)
            return HttpResponse(retorno, content_type="application/json")
        else:
            colaborador = Colaboradores.objects.get(id=int(colaborador_id))
    else:
        colaborador = None
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.cadastra_colaborador:
            sucesso['negado'] = 1
            sucesso['mensagem'] = mensagem_permissao_negada()
            sucesso['titulo'] = titulo_mensagem_permissao_negada()
            retorno = json.dumps(sucesso)
            return HttpResponse(retorno, content_type="application/json")

    if request.method == 'POST':
        form = deserialize_form(request.POST.get('form'))
        form = FormCadastroColaboradores(form, instance=colaborador)
        if form.is_valid():
            registro = form.save(commit=False)
            registro.nome = NORMALIZAR(registro.nome)
            registro.sobre_nome = NORMALIZAR(registro.sobre_nome)
            if not colaborador_id != '0':
                registro.empresa = usuario.empresa
                registro.id_usuario = request.user.id
                titulo_mensagem = 'SALVANDO REGISTRO...'
                mensagem = 'O registro foi salvo com sucesso !!!'
            else:
                titulo_mensagem = 'ALTERANDO REGISTRO...'
                mensagem = 'O registro foi alterado com sucesso!!!'

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


def status_colaborador(request):
    retorno = {}
    titulo = ''
    mensagem = ''
    try:
        usuario = Usuarios.objects.get(usuario=request.user)
        if not usuario.permissoes.muda_status_colaborador and not usuario.permissoes.administrador \
                and not usuario.permissoes.administrador_super:
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
            retorno['mensagem'] = mensagem_permissao_negada()
            return HttpResponse(json.dumps(retorno), content_type="application/json")

        elif request.method == 'POST':
            colaborador = Colaboradores.objects.get(id=int(QueryDict(request.body).get('registro_id')))
            status = QueryDict(request.body).get('status')

            colaborador.status = status
            colaborador.save()

            if status == 'ATIVO':
                mensagem = 'Colaborador ativado com sucesso !!!'
                titulo = 'ATIVAR CADASTRO DE COLABORADOR ...'

            elif status == 'INATIVO':
                mensagem = 'colaborador desativado com sucesso !!!'
                titulo = 'DESATIVAR CADASTRO DE COLABORADOR ...'

            elif status == 'EXCLUIDO':
                mensagem = 'colaborador excluido com sucesso !!!'
                titulo = 'EXCLUIR CADASTRO DE COLABORADOR ...'

            elif status == 'AFASTADO':
                mensagem = 'colaborador afastado com sucesso !!!'
                titulo = 'AFASTAR COLABORADOR ...'

            elif status == 'APOSENTADO':
                mensagem = 'colaborador aposentado com sucesso !!!'
                titulo = 'APOSENTAR COLABORADOR ...'

            elif status == 'DEMITIDO':
                mensagem = 'colaborador demitido com sucesso !!!'
                titulo = 'DEMITIR COLABORADOR ...'

            retorno['mensagem'] = mensagem
            retorno['titulo'] = titulo
            retorno['sucesso'] = 1
            retorno['status'] = status
    except:
        retorno['titulo'] = titulo_mensagem_erro_padrao()
        retorno['mensagem'] = mensagem_erro_padrao()
        retorno['erro'] = 1

    return HttpResponse(
            json.dumps(retorno), content_type="application/json")


def buscar_colaboradores(request):
    usuario = Usuarios.objects.get(usuario=request.user)
    tb_colaboradores = {}
    mensagem = ''
    colaboradores = []
    classe = ''
    status = ''
    titulo = 'BUSCANDO COLABORADORES...'
    if 'status' in request.GET and request.GET['status']:
        status = request.GET.get('status')
        if usuario.permissoes.acessa_cadastro_colaboradores or usuario.permissoes.administrador:
            tb_colaboradores = Colaboradores.objects.filter(status=status, empresa=usuario.empresa)

        elif usuario.permissoes.administrador_super:
            tb_colaboradores = Colaboradores.objects.filter(status=status)

    if 'nome' in request.GET and request.GET['nome']:
        nome = request.GET.get('nome')
        if usuario.permissoes.acessa_cadastro_colaboradores or usuario.permissoes.administrador:
            tb_colaboradores = Colaboradores.objects.filter(empresa=usuario.empresa, nome__contains=nome.upper()).order_by('nome') | Colaboradores.objects.filter(empresa=usuario.empresa, nome__contains=nome.lower()).order_by('nome')
        elif usuario.permissoes.administrador_super:
            tb_colaboradores = Colaboradores.objects.filter(nome__contains=nome.upper()).order_by('nome') | Colaboradores.objects.filter(nome__contains=nome.lower()).order_by('nome')
        else:
            tb_colaboradores = {}

        if not tb_colaboradores:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Nenhum Registro correspondeu a sua pesquisa.'
        else:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Um total de ' + str(
                len(tb_colaboradores)) + ' registros corresponderam á sua pesquisa.'

    if 'id_colaborador' in request.GET and request.GET['id_colaborador']:
        id_colaborador = request.GET.get('id_colaborador')

        if usuario.permissoes.acessa_cadastro_colaboradores or usuario.permissoes.administrador:
            tb_colaboradores = Colaboradores.objects.filter(empresa=usuario.empresa.id, pk=int(id_colaborador))

        elif usuario.permissoes.administrador_super:
            tb_colaboradores = Colaboradores.objects.filter(pk=int(id_colaborador))

    for index in tb_colaboradores:

        if index.status == 'ATIVO':
            classe = 'success'
        elif index.status == 'EXCLUIDO' or index.status == 'DEMITIDO':
            classe = 'danger'
        elif index.status == 'AFASTADO' or index.status == 'INATIVO':
            classe = 'warning'

        colaboradores += [{
            'nome': index.nome,
            'sobre_nome': index.sobre_nome,
            'rg': index.rg,
            'cpf': index.cpf,
            'telefone': index.telefone,
            'celular': index.celular,
            'email': index.email,
            'data_nascimento': str(index.data_nascimento),
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
            'empresa': str(index.empresa),
            'id': index.id,
            'classe': classe,
            'mensagem': mensagem,
            'titulo': titulo,
        }]
    if colaboradores or status != '':
        retorno = json.dumps(colaboradores)
    else:
        retorno = json.dumps({
            'titulo': titulo,
            'mensagem': mensagem,
            'info': 1,
        })
    return HttpResponse(retorno, content_type='application/json')


def buscar_colaborador(request):
    usuario = Usuarios.objects.get(usuario=request.user)
    colaborador = {}
    titulo = 'BUSCANADO REGISTROS DE COLABORADORES...'
    id = request.GET.get('id')
    try:
        if usuario.permissoes.edita_colaborador:
            colaborador = Colaboradores.objects.get(id=int(id),
                                                    empresa=usuario.empresa.id)
    except:
        pass

    try:
        if usuario.permissoes.administrador:
            colaborador = Colaboradores.objects.get(id=int(id),
                                                    empresa=usuario.empresa.id)

    except:
        pass

    try:
        if usuario.permissoes.administrador_super:
            colaborador = Colaboradores.objects.get(id=int(id))
    except:
        pass

    if colaborador:
        form = FormCadastroColaboradores(instance=colaborador)
        mensagem = 'Busca efetuada com sucesso !!!'
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
    else:
        retorno = json.dumps({
            'titulo': titulo,
            'mensagem': 'Nenhum registro de colaborador corresponde ao ID informado.'
                        'Ou talvez, você não tenha permissão para acessar estes dados...',
            'info': 1,
        })

    return HttpResponse(retorno, content_type='application/json')
