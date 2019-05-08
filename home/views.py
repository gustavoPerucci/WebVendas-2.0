# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.shortcuts import HttpResponseRedirect, render
from cadastros.usuarios.models import Usuarios
from estoque.produtos.models import Produtos, ImagensProdutos, Marcas, Categorias
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from cadastros.empresas.models import Empresas
import traceback


def home(request):
    try:
        site = request.META['HTTP_HOST']
        cat, marc, top, men, mai, az, za = '', '', '', '', '', '', ''
        produtos = Produtos.objects.filter(empresa__site__contains=site, anunciar_produto=1, status='ATIVO').order_by(
            'descricao_simplificada')

        if 'cat' in request.GET and request.GET['cat']:
            cat = request.GET['cat']
            busca = produtos.filter(categoria_produto__descricao=cat)
        if 'marc' in request.GET and request.GET['marc']:
            marc = request.GET['marc']
            busca = produtos.filter(marca_produto__descricao=marc)
        if 'top' in request.GET and request.GET['top']:
            top = request.GET['top']
            busca = produtos.filter(descricao_simplificada=top)
        if 'class' in request.GET and request.GET['class']:
            x = request.GET['class']
            if x == 'menor':
                produtos = produtos.order_by('preco_venda')
            if x == 'maior':
                produtos = produtos.order_by('-preco_venda')
            if x == 'AZ':
                produtos = produtos.order_by('descricao_simplificada')
            if x == 'ZA':
                produtos = produtos.order_by('-descricao_simplificada')

        titulo = 'Home'

        categorias = Categorias.objects.filter(empresa__site__contains=site)
        marcas = Marcas.objects.filter(empresa__site__contains=site)
        imagens = ImagensProdutos.objects.filter(empresa__site__contains=site, status=1).order_by('sequencia')
        mais_vendidos = Produtos.objects.filter(empresa__site__contains=site, anunciar_produto=1, status='ATIVO').order_by('?')[:20]
        empresas = Empresas.objects.filter(site__contains=site)
        empresa = empresas.first()
        if request.user.is_authenticated:
            usuario = Usuarios.objects.get(usuario=request.user.pk)

        if 'pesquisa' in request.GET and request.GET['pesquisa']:
            pesquisa = request.GET['pesquisa']

            busca = Produtos.objects.filter(
                    descricao_simplificada__contains=pesquisa, empresa__site__contains=site, anunciar_produto=1, status='ATIVO'
            ).order_by('descricao_simplificada') | Produtos.objects.filter(
                        descricao_simplificada__contains=pesquisa.upper(), empresa__site__contains=site, anunciar_produto=1, status='ATIVO'
            ).order_by('descricao_simplificada') | Produtos.objects.filter(
                        descricao_simplificada__contains=pesquisa.lower(), empresa__site__contains=site, anunciar_produto=1, status='ATIVO'
            ).order_by('descricao_simplificada')
            messages.add_message(request, messages.INFO, 'Você pesquisou por ' + pesquisa + '. Um total de ' + str(
                len(busca)) + ' produtos corresponderam a sua pesquisa... ')

        cont = str(len(produtos))
    except:
        messages.add_message(request, messages.ERROR, '''Houve um erro interno no sistema. Por favor, 
        recarregue a página e tente novamente... ''' + traceback.format_exc())
    return render(request, 'home/home.html', locals())


@login_required
def index(request):
    sub_titulo, titulo, usuario, mensagem, site, produtos, erro = (
        'Gustavo Perucci | Web Vendas', '', {}, '', '', {}, '')
    try:
        usuario = Usuarios.objects.get(usuario=request.user.pk)
        if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
            messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
            não pode mais acessar nosso sistema...''')
            return HttpResponseRedirect('/logout/')
        titulo = 'Home'
    except:
        messages.add_message(request, messages.ERROR, '''Houve um erro interno no sistema. 
        Por favor, contate o suporte técnico.''')
        return HttpResponseRedirect('/logout/')

    return render(request, 'base/base.html', locals())
