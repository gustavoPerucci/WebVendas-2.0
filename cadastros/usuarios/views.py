# -*- coding: utf-8 -*-
from django.conf import settings
from django.contrib.auth import authenticate, login, logout, get_user_model
from django.views.generic.base import View
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.shortcuts import render, HttpResponseRedirect
from cadastros.usuarios.models import Usuarios, Permissoes
from cadastros.usuarios.forms import FormCadastroUsuarios, FormPermissoesUsuarios
from cadastros.colaboradores.models import Colaboradores
from django.utils.datastructures import MultiValueDictKeyError
import traceback
from django.http import HttpResponse
from django.http import QueryDict
import json
from functions.views import deserialize_form
from functions.views import mensagem_erro_padrao, titulo_mensagem_erro_padrao, mensagem_permissao_negada, titulo_mensagem_permissao_negada
from functions.views import NORMALIZAR
from django.contrib import messages
import datetime
from estoque.produtos.models import Produtos, ImagensProdutos, Marcas, Categorias
from cadastros.empresas.models import Empresas


@login_required
def cadastro_usuarios(request):
    sub_titulo = 'Cadastro de Usuarios'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
        messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
        não pode mais acessar nosso sistema...''')
        return HttpResponseRedirect('/logout/')

    try:
        form_usuarios = FormCadastroUsuarios()
        form_permissoes = FormPermissoesUsuarios()
        form_usuarios.fields['colaborador'].queryset = Colaboradores.objects.filter(empresa=usuario.empresa)
        if usuario.permissoes.cadastra_usuario or usuario.permissoes.edita_usuario and not usuario.permissoes.administrador_super and not usuario.permissoes.administrador:
            form_usuarios.fields['permissoes'].queryset = Permissoes.objects.filter(
                empresa=usuario.empresa, administrador_super=0, administrador=0)

        elif usuario.permissoes.administrador and not usuario.permissoes.administrador_super:
            form_usuarios.fields['permissoes'].queryset = Permissoes.objects.filter(
                empresa=usuario.empresa, administrador_super=0)

        elif usuario.permissoes.administrador_super:
            form_usuarios.fields['permissoes'].queryset = Permissoes.objects.all()

        else:
            form_usuarios.fields['permissoes'].queryset = Permissoes.objects.filter(descricao='')

    except:
        trace = traceback.format_exc()
        erro = 1
        if request.user.is_superuser:
            mensagem = 'Houve um erro interno no sistema. ' + trace
        else:
            mensagem = '''Houve um erro interno no sistema.
            Por favor, contate o suporte técnico através do E-mail: suporte@atpcsistemas.com.br.'''

    return render(request, "usuarios/usuarios.html", locals())


@login_required
def cadastrar_usuario(request):
    registro_id = request.POST.get('id')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []
    if registro_id != '0':
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.edita_usuario:
            sucesso['negado'] = 1
            sucesso['mensagem'] = mensagem_permissao_negada()
            sucesso['titulo'] = titulo_mensagem_permissao_negada()
            retorno = json.dumps(sucesso)
            return HttpResponse(retorno, content_type="application/json")
        else:
            registro = Usuarios.objects.get(id=int(registro_id))
    else:
        registro = None
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.cadastra_usuario:
            sucesso['negado'] = 1
            sucesso['mensagem'] = mensagem_permissao_negada()
            sucesso['titulo'] = titulo_mensagem_permissao_negada()
            retorno = json.dumps(sucesso)
            return HttpResponse(retorno, content_type="application/json")

    if request.method == 'POST':
        form = deserialize_form(request.POST.get('form'))
        form = FormCadastroUsuarios(form, instance=registro)

        if form.is_valid():
            registro = form.save(commit=False)
            registro.nome = NORMALIZAR(registro.nome)
            if not registro_id != '0':
                registro.empresa = usuario.empresa
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


@login_required
def buscar_usuarios(request):
    usuario = Usuarios.objects.get(usuario=request.user)
    tb_usuarios = {}
    mensagem = ''
    usuarios = []
    classe = ''
    status = ''
    titulo = 'BUSCANDO usuarios...'
    if 'status' in request.GET and request.GET['status']:
        status = request.GET.get('status')
        if usuario.permissoes.acessa_cadastro_usuarios:
            tb_usuarios = Usuarios.objects.filter(status=status,
                                                            empresa=usuario.empresa,
                                                            permissoes__administrador=0,
                                                            permissoes__administrador_super=0)
        if usuario.permissoes.administrador:
            tb_usuarios = Usuarios.objects.filter(status=status,
                                                            empresa=usuario.empresa,
                                                            permissoes__administrador_super=0)
        if usuario.permissoes.administrador_super:
            tb_usuarios = Usuarios.objects.filter(status=status)
    if 'nome' in request.GET and request.GET['nome']:
        nome = request.GET.get('nome')
        if usuario.permissoes.acessa_cadastro_usuarios:
            tb_usuarios = Usuarios.objects.filter(empresa=usuario.empresa,
                                                            permissoes__administrador=0,
                                                            permissoes__administrador_super=0,
                                                            nome__contains=nome.upper()).order_by('nome')
        elif usuario.permissoes.administrador:
            tb_usuarios = Usuarios.objects.filter(empresa=usuario.empresa,
                                                            permissoes__administrador_super=0,
                                                            nome__contains=nome.upper()).order_by('nome')
        elif usuario.permissoes.administrador_super:
            tb_usuarios = Usuarios.objects.filter(nome__contains=nome.upper()).order_by('nome')
        else:
            tb_usuarios = {}

        if not tb_usuarios:
            if usuario.permissoes.acessa_cadastro_usuarios:
                tb_usuarios = Usuarios.objects.filter(empresa=usuario.empresa,
                                                                permissoes__administrador=0,
                                                                permissoes__administrador_super=0,
                                                                nome__contains=nome.lower()).order_by('nome')
            elif usuario.permissoes.administrador:
                tb_usuarios = Usuarios.objects.filter(empresa=usuario.empresa,
                                                                permissoes__administrador_super=0,
                                                                nome__contains=nome.lower()).order_by('nome')
            elif usuario.permissoes.administrador_super:
                tb_Uuuarios = Usuarios.objects.filter(nome__contains=nome.lower()).order_by('nome')

            else:
                tb_usuarios = {}

        if not tb_usuarios:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Nenhum Registro correspondeu a sua pesquisa.'
        else:
            mensagem = 'Voce pesquisou por [ ' + str(nome) + ' ] Um total de ' + str(
                len(tb_usuarios)) + ' registros corresponderam á sua pesquisa.'

    if 'id_usuario' in request.GET and request.GET['id_usuario']:
        id_usuario = request.GET.get('id_usuario')

        if usuario.permissoes.acessa_cadastro_usuarios:
            tb_usuarios = Usuarios.objects.filter(empresa=usuario.empresa.id,
                                                            permissoes__administrador=0,
                                                            permissoes__administrador_super=0,
                                                            pk=int(id_usuario))
        elif usuario.permissoes.administrador:
            tb_usuarios = Usuarios.objects.filter(empresa=usuario.empresa.id,
                                                            permissoes__administrador_super=0,
                                                            pk=int(id_usuario))
        elif usuario.permissoes.administrador_super:
            tb_usuarios = Usuarios.objects.filter(pk=int(id_usuario))

    for index in tb_usuarios:

        if index.status == 'ATIVO':
            classe = 'success'
        elif index.status == 'BLOQUEADO' or index.status == 'EXCLUIDO':
            classe = 'danger'
        elif index.status == 'INATIVO':
            classe = 'warning'

        usuarios += [{
            'nome': index.nome,
            'colaborador': index.colaborador.nome,
            'email': index.email,
            'status': index.status,
            'empresa': str(index.empresa),
            'id': index.id,
            'classe': classe,
            'mensagem': mensagem,
            'permissoes': str(index.permissoes),
            'titulo': titulo,
        }]
    if usuarios or status != '':
        retorno = json.dumps(usuarios)
    else:
        retorno = json.dumps({
            'titulo': titulo,
            'mensagem': mensagem,
            'info': 1,
        })
    return HttpResponse(retorno, content_type='application/json')


@login_required
def status_usuario(request):
    retorno = {}
    titulo = ''
    mensagem = ''
    try:
        usuario = Usuarios.objects.get(usuario=request.user)
        if not usuario.permissoes.muda_status_usuario and not usuario.permissoes.administrador \
                and not usuario.permissoes.administrador_super:
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
            retorno['mensagem'] = mensagem_permissao_negada()
            return HttpResponse(json.dumps(retorno), content_type="application/json")

        elif request.method == 'POST':
            registro = Usuarios.objects.get(id=int(QueryDict(request.body).get('registro_id')))
            status = QueryDict(request.body).get('status')

            registro.status = status
            registro.save()

            if status == 'ATIVO':
                mensagem = 'Usuario ativado com sucesso !!!'
                titulo = 'ATIVAR CADASTRO DE USUARIO ...'

            elif status == 'INATIVO':
                mensagem = 'Usuario desativado com sucesso !!!'
                titulo = 'DESATIVAR CADASTRO DE USUARIO ...'

            elif status == 'EXCLUIDO':
                mensagem = 'Usuario excluido com sucesso !!!'
                titulo = 'EXCLUIR CADASTRO DE USUARIO ...'

            elif status == 'BLOQUEADO':
                mensagem = 'Usuario BLOQUEADO com sucesso !!!'
                titulo = 'BLOQUEAR USUARIO ...'

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


class LoginView(View):
    def get(self, request):
        form = AuthenticationForm
        if request.user.is_authenticated:
            return HttpResponseRedirect(settings.LOGIN_REDIRECT_URL)
        try:
            next_url = request.GET['next']
        except Exception as e:
            next_url = settings.LOGIN_REDIRECT_URL

        titulo = 'Home'
        site = request.META['HTTP_HOST']
        categorias = Categorias.objects.filter(empresa__site__contains=site)
        marcas = Marcas.objects.filter(empresa__site__contains=site)
        imagens = ImagensProdutos.objects.filter(empresa__site__contains=site, status=1).order_by('sequencia')
        mais_vendidos = Produtos.objects.filter(empresa__site__contains=site, anunciar_produto=1, status='ATIVO').order_by('?')[
              :20]
        produtos = Produtos.objects.filter(empresa__site__contains=site, anunciar_produto=1, status='ATIVO').order_by(
            'descricao_simplificada')
        empresas = Empresas.objects.filter(site__contains=site)
        empresa = empresas.first()
        cont = str(len(produtos))
        return render(request, "usuarios/login-register.html", locals())

    def post(self, request):
        try:
            next_url = request.POST['next']
        except MultiValueDictKeyError as e:
            next_url = settings.LOGIN_REDIRECT_URL
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            usuario = authenticate(username=form.data['username'], password=form.data['password'])
            if (usuario is not None) and usuario.is_active:
                login(request=request, user=usuario)
                next_url = '/'
                return HttpResponseRedirect(next_url)
            else:
                form.errors['Autenticação'] = 'Usuário e/ou Senha incorretos'

        titulo = 'Home'
        site = request.META['HTTP_HOST']
        categorias = Categorias.objects.filter(empresa__site__contains=site)
        marcas = Marcas.objects.filter(empresa__site__contains=site)
        imagens = ImagensProdutos.objects.filter(empresa__site__contains=site, status=1).order_by('sequencia')
        mais_vendidos = Produtos.objects.filter(empresa__site__contains=site, anunciar_produto=1, status='ATIVO').order_by('?')[
              :20]
        produtos = Produtos.objects.filter(empresa__site__contains=site, anunciar_produto=1, status='ATIVO').order_by(
            'descricao_simplificada')
        empresas = Empresas.objects.filter(site__contains=site)
        empresa = empresas.first()
        cont = str(len(produtos))
        return render(request, "usuarios/login-register.html", locals())


class LogoutView(View):
    def get(self, request):
        logout(request=request)
        return redirect(to=settings.LOGIN_REDIRECT_URL)


@login_required
def senha_alterada_com_sucesso(request):
    try:
        usuario = Usuarios.objects.get(usuario=request.user.id)
        if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO':
            return HttpResponseRedirect('/logout/')
    except:
        return HttpResponseRedirect('/logout/')
    return render(request, 'base/senha_alterada_com_sucesso.html', {'usuario': usuario})


@login_required
def alterar_perfil_usuario(request):
    retorno = {}
    titulo_mensagem = 'ALTERANDO DADOS DO PERFIL...'
    mensagem = 'Alterações realizadas comsucesso!!!'
    nome = QueryDict(request.body).get('nome') or ''
    email = QueryDict(request.body).get('email') or ''
    u = User.objects.filter(username=email)
    try:
        usuario = Usuarios.objects.get(usuario=request.user.id)
        email_anterior = usuario.email
        nome_anterior = usuario.nome
        us = request.user
        if nome and nome != nome_anterior:
            usuario.nome = nome
            us.first_name = nome
            mensagem += 'Seu nome foi alterado com sucesso!!!<br>'
        else:
            mensagem += 'Seu nome permanece o mesmo!!!<br>'
        if email and email != email_anterior:
            if u.count():
                retorno['mensagem'] = 'Este E-mail já está cadastrado...'
                retorno['titulo'] = 'E-MAIL JÁ CADASTRADO'
                retorno['status'] = 'erro'
                return HttpResponse(json.dumps(retorno), content_type="application/json")
            usuario.email = email
            us.email = email
            us.username = email
            mensagem += 'Seu E-mail foi alterado com sucesso!!!<br>'
        else:
            mensagem += 'Seu E-mail permanece o mesmo!!!<br>'

        if usuario.nome != nome_anterior or usuario.email != email_anterior:
            us.date_joined = datetime.datetime.now()
            us.save()
            usuario.save()
            status = 'sucesso'
        else:
            mensagem += 'Nenhuma alteração foi detectada...'
            status = 'alerta'
    except:
        if request.user.is_superuser:
            mensagem = traceback.format_exc()
        else:
            mensagem = msg.msg_erro_sistema()
        status = 'erro'
        titulo_mensagem = 'ERRO NO PROCESSAMENTO...'

    retorno['mensagem'] = mensagem
    retorno['titulo'] = titulo_mensagem
    retorno['status'] = status
    return HttpResponse(json.dumps(retorno), content_type="application/json")


@login_required
def muda_estilo_template(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    sucesso = {}
    if request.method == 'POST':

        estilo_template = QueryDict(request.body).get('estilo_template')

        usuario.model_template = estilo_template
        usuario.save()
        mensagem = 'Estilo alterado com sucesso !!!'
        titulo = 'MUDANDO ESTILO ...'

        sucesso['mensagem'] = mensagem
        sucesso['titulo'] = titulo

    return HttpResponse(
            json.dumps(sucesso), content_type="application/json")


