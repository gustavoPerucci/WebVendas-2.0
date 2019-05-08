# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from unicodedata import normalize
from django.http.request import QueryDict
from django.shortcuts import HttpResponseRedirect
from django.contrib import messages
from cadastros.usuarios.models import Usuarios


def deserialize_form(data):
    return QueryDict(query_string=data)


def verifica_permissoes(request):
    messages.add_message(request, messages.ERROR, '''Você foi deslogado pelo sistema devido não ter autorização 
                prévia para acessar esta área...''')

    try:
        usuario = Usuarios.objects.get(usuario=request.user.id)
        if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
            messages.add_message(request, messages.ERROR, '''Você foi deslogado pelo sistema devido não ter autorização 
            prévia para acessar efetuar efetuar para acessar esta área...''')
            return HttpResponseRedirect('/logout/')
    except:
        messages.add_message(request, messages.ERROR, '''Você foi deslogado pelo sistema devido um erro interno...''')
        return True


def moeda(numero):
    try:
        contador = 0
        valor_y = ''
        num = numero.__str__()
        if '.' in num:
            preco, centavos = num.split('.')
        else:
            preco = num
            centavos = '00'

        tamanho = len(preco)
        while tamanho > 0:
            valor_y = valor_y + preco[tamanho - 1]
            contador += 1
            if contador == 3 and tamanho > 1:
                valor_y = valor_y + '.'
                contador = 0
            tamanho -= 1

        tamanho = len(valor_y)
        valor_x = ''
        while tamanho > 0:
            valor_x = valor_x + valor_y[tamanho - 1]
            tamanho -= 1

        return str("{},{}".format(valor_x, centavos))
    except:
        return str(numero)


def moeda_real(numero):
    try:
        contador = 0
        valor_y = ''
        num = numero.__str__()
        if '.' in num:
            preco, centavos = num.split('.')
        else:
            preco = num
            centavos = '00'

        tamanho = len(preco)
        while tamanho > 0:
            valor_y = valor_y + preco[tamanho - 1]
            contador += 1
            if contador == 3 and tamanho > 1:
                valor_y = valor_y + '.'
                contador = 0
            tamanho -= 1

        tamanho = len(valor_y)
        valor_x = ''
        while tamanho > 0:
            valor_x = valor_x + valor_y[tamanho - 1]
            tamanho -= 1

        return str("R$ {},{}".format(valor_x, centavos))
    except:
        return str(numero)


def dia_da_semana(dia):
    dia = dia.weekday()
    dias = (u'Segunda-feira', u'Terça-feira', u'Quarta-feira', u'Quinta-feira', u'Sexta-feira', u'Sábado', u'Domingo')
    return dias[dia]


def normalizar(texto):
    return normalize('NFKD', texto).encode('ASCII', 'ignore').decode('ASCII').lower()


def NORMALIZAR(texto):

    return normalize('NFKD', texto).encode('ASCII', 'ignore').decode('ASCII').upper()


def Normalizar(texto):
    return normalize('NFKD', texto).encode('ASCII', 'ignore').decode('ASCII').capitalize()


def mensagem_erro_padrao():
    mensagem_erro = '''Houve um erro interno no sistema.
                Por favor, contate o suporte técnico através do E-mail: suporte@atpcsistemas.com.br...'''
    return mensagem_erro


def titulo_mensagem_erro_padrao():
    titulo_erro = 'ERRO INTERNO NO SISTEMA...'
    return titulo_erro


def mensagem_permissao_negada():
    mensagem_permissao = '''Você não tem permissão para executar esta operação.<br>
                            Caso nececite desta permissão, contate seu gestor ou gestora...'''
    return mensagem_permissao


def titulo_mensagem_permissao_negada(): return 'PERMISSÃO NEGADA PELO SISTEMA...'
