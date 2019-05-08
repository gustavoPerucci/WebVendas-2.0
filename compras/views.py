# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from cadastros.usuarios.models import Usuarios
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, HttpResponseRedirect
from .models import Compras, EntradaProdutos
from estoque.produtos.models import TabelaPrecos, Produtos
from .forms import FormCompras, FormEntradaProdutos
import traceback
from django.http import HttpResponse
from django.http import QueryDict
import json
from functions.views import deserialize_form
from cadastros.fornecedores.models import Fornecedores
from datetime import datetime
from functions.views import mensagem_permissao_negada, titulo_mensagem_permissao_negada, \
    mensagem_erro_padrao, titulo_mensagem_erro_padrao
from financeiro.contas_a_pagar.forms import FormContasPagar
from financeiro.contas_a_pagar.models import ContasPagar
from financeiro.pagamentos_pagos.forms import FormPagamentos
from functions.views import moeda_real
from django.contrib import messages


@login_required
def compras(request):
    usuario = {}
    try:
        usuario = Usuarios.objects.get(usuario=request.user.id)

        if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
            messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
            não pode mais acessar nosso sistema...''')
            return HttpResponseRedirect('/logout/')

        sub_titulo = 'Compras'
        form_compras = FormCompras()
        form_entrada = FormEntradaProdutos()
        form_contas_a_pagar = FormContasPagar()
        compras = Compras.objects.filter()

        form_compras.fields['fornecedor'].queryset = Fornecedores.objects.filter(empresa=usuario.empresa)
        form_entrada.fields['produto'].queryset = Produtos.objects.filter(empresa=usuario.empresa, status='ATIVO')
        form_entrada.fields['compra'].queryset = Compras.objects.filter(empresa=usuario.empresa)
    except:
        trace = traceback.format_exc()
        erro = 1
        if usuario.suporte_tecnico:
            mensagem = 'Houve um erro interno no sistema. ' + trace
        else:
            mensagem = ''

    return render(request, "compras/compras.html", locals(),)


@login_required
def registrar_nova_compra(request):
    compra_id = request.POST.get('id')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []

    if compra_id != '0':
        compra = Compras.objects.get(id=int(compra_id))

    else:
        compra = None

    if request.method == 'POST':
        form = FormCompras(deserialize_form(request.POST.get('form')), instance=compra)

        if form.is_valid():
            registro = form.save(commit=False)

            if not compra_id != '0':
                registro.empresa = usuario.empresa
                registro.usuario = request.user
                titulo_mensagem = 'SALVANDO REGISTRO . . .'
                mensagem = 'O registro foi salvo com sucesso !!!'

            else:
                titulo_mensagem = 'ALTERANDO REGISTRO . . .'
                mensagem = 'O registro foi alterado com sucesso !!!'

            registro.save()
            sucesso['fornecedor'] = registro.fornecedor.nome_razao_social
            sucesso['success'] = True
            sucesso['mensagem'] = mensagem
            sucesso['id'] = registro.id
            sucesso['titulo'] = titulo_mensagem
            retorno = json.dumps(sucesso)

        else:

            for error in form.errors:
                erro += {error}
                erro += {error}

            titulo_mensagem = 'ERRO NA VALIDAÇÃO DOS DADOS . . .'
            mensagem = 'Por favor, corrija os campos listados em vermelho e tente novamente...'

            retorno = json.dumps({
                'titulo': titulo_mensagem,
                'mensagem': mensagem,
                'erro': erro,
            })
    return HttpResponse(retorno, content_type="application/json")


def buscar_compra(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    id = int(request.GET.get('id') or 0)
    compra = {}
    itens_compra = []
    valor_total = 0

    try:
        if usuario.permissoes.administrador or usuario.permissoes.edita_compra:
            compra = Compras.objects.get(id=id, empresa=usuario.empresa)
    except:
        pass

    try:
        if usuario.permissoes.administrador_super:
            compra = Compras.objects.get(id=id)
    except:
        pass

    if not compra:
        retorno = json.dumps({
            'titulo': 'REGISTRO NÃO ENCONTRADO',
            'mensagem': 'O sistema não identificou nenhuma compra com este ID.',
            'alerta': 1,
        })
    else:
        form = FormCompras(instance=compra)
        titulo = 'BUSCANADO REGISTROS...'
        mensagem = 'Busca efetuada com sucesso ! ! !'
        campos = {}
        classe = ''
        itens = EntradaProdutos.objects.filter(compra=compra.pk)
        for index in itens:
            classe = 'success'
            valor_total += index.total
            if index.status_entrada == 'CANCELADO':
                classe = 'danger'
                valor_total -= index.total
            itens_compra += [{
                'id': str(index.id),
                'compra': str(index.compra),
                'produto': str(index.produto),
                'quantidade': str(index.quantidade),
                'preco_compra': moeda_real(index.preco_compra),
                'data_entrada': str(index.data_entrada),
                'data_fabricacao': str(index.data_fabricacao),
                'data_validade': str(index.data_validade),
                'numero_lote': str(index.numero_lote),
                'total': moeda_real(index.total),
                'balanco': index.balanco,
                'status_entrada': index.status_entrada,
                'observacoes_entrada': index.observacoes_entrada,
                'empresa': str(index.empresa),
                'marca': str(index.produto.marca_produto),
                'classe': classe
            }]
        for campo in form.fields:
            if campo in form.initial:
                campos[form.auto_id % campo] = str(form.initial[campo])

        retorno = json.dumps({
            'id': id,
            'titulo': titulo,
            'mensagem': mensagem,
            'fornecedor': str(compra.fornecedor.nome_razao_social),
            'valor_total': str(valor_total),
            'data_compra': str(compra.data_compra.strftime('%d/%m/%Y')),
            'solicitante': compra.solicitante,
            'status_compra': compra.status_compra,
            'campos': campos,
            'itens': itens_compra,
        })

    return HttpResponse(retorno, content_type='application/json')


def buscar_compras(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    tb_compras = {}
    mensagem = ''
    compras = []
    classe = ''

    if 'status' in request.GET and request.GET['status']:
        status = request.GET.get('status')

        if usuario.permissoes.administrador or usuario.permissoes.acessa_registro_compra:
            tb_compras = Compras.objects.filter(empresa=usuario.empresa.id, status_compra=status)

        if usuario.permissoes.administrador_super:
            tb_compras = Compras.objects.filter(status_compra=status)

    if 'id_compra' in request.GET and request.GET['id_compra']:
        id_compra = request.GET.get('id_compra')

        if usuario.permissoes.administrador or usuario.permissoes.acessa_registro_compra:
            tb_compras = Compras.objects.filter(empresa=usuario.empresa.id, pk=int(id_compra))

        if usuario.permissoes.administrador_super:
            tb_compras = Compras.objects.filter(pk=int(id_compra))

    if 'data_compra' in request.GET and request.GET['data_compra']:
        data_compra = request.GET.get('data_compra')
        data_compra = datetime.strptime(data_compra, "%Y-%m-%d")

        if usuario.permissoes.administrador or usuario.permissoes.acessa_registro_compra:
            tb_compras = Compras.objects.filter(empresa=usuario.empresa.id, data_compra=data_compra)

        if usuario.permissoes.administrador_super:
            tb_compras = Compras.objects.filter(data_compra=data_compra)

    if 'fornecedor' in request.GET and request.GET['fornecedor']:
        fornecedor = request.GET.get('fornecedor')

        if usuario.permissoes.administrador or usuario.permissoes.acessa_registro_compra:
            tb_compras = Compras.objects.filter(empresa=usuario.empresa.id, fornecedor=fornecedor)

        if usuario.permissoes.administrador_super:
            tb_compras = Compras.objects.filter(fornecedor=fornecedor)

    if 'nota_fiscal' in request.GET and request.GET['nota_fiscal']:
        nota_fiscal = request.GET.get('nota_fiscal')

        if usuario.permissoes.administrador or usuario.permissoes.acessa_registro_compra:
            tb_compras = Compras.objects.filter(empresa=usuario.empresa.id, nota_fiscal=nota_fiscal)

        if usuario.permissoes.administrador_super:
            tb_compras = Compras.objects.filter(nota_fiscal=nota_fiscal)

    if tb_compras:
        for index in tb_compras:

            if index.status_compra == 'NAO LANCADO':
                classe = ''
            elif index.status_compra == 'PARCIALMENTE LANCADO':
                classe = 'warning'
            elif index.status_compra == 'LANCADO':
                classe = 'success'
            elif index.status_compra == 'CANCELADO':
                classe = 'danger'

            compras += [{
                'id': index.id,
                'fornecedor': str(index.fornecedor),
                'solicitante': index.solicitante,
                'data_compra': str(index.data_compra),
                'nota_fiscal': index.nota_fiscal,
                'valor_total': moeda_real(index.valor_total),
                'pagamento': str(index.pagamento) if index.pagamento else 'EM ABERTO',
                'status_pagamento': str(index.pagamento.status_conta) if index.pagamento else 'EM ABERTO',
                'status_compra': index.status_compra,
                'observacoes': index.observacoes,
                'empresa': str(index.empresa),
                'classe': classe,
                'mensagem': mensagem,
            }]

    retorno = json.dumps(compras)
    return HttpResponse(retorno, content_type='application/json')


def muda_status_compra(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    mensagem = ''
    titulo = ''
    sucesso = 0
    erro = 0
    info = 0
    itens_compra =[]
    status = ''
    status_compra = ''
    titulo = 'ALTERANDO STÁTUS DA COMPRA...'
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.muda_status_compra:
        if request.method == 'POST':
            compra = Compras.objects.filter(pk=int(QueryDict(request.body).get('id_compra')))
            status = QueryDict(request.body).get('status')
            if compra:
                compra = Compras.objects.get(pk=int(QueryDict(request.body).get('id_compra')))
                status_compra = compra.status_compra
                if status != status_compra:
                    compra.status_compra = status
                    compra.save()
                    sucesso = 1
                    if status == 'NAO LANCADO':
                        mensagem = 'Esta compra foi marcado novamente como não lançada...'

                    elif status == 'PARCIALMENTE LANCADO':
                        mensagem = 'Esta compra foi marcado como parcialmente lançada...'

                    elif status == 'LANCADO':
                        mensagem = 'Esta compra foi marcada como lançada...'

                    elif status == 'CANCELADO':
                        itens = EntradaProdutos.objects.filter(compra=compra.id, status_entrada='LANCADO')
                        if itens:
                            for item in itens:
                                produto = Produtos.objects.get(id=item.produto.id)
                                produto.estoque_atual -= item.quantidade
                                item.status_entrada = 'CANCELADO'
                                item.save()
                                produto.save()
                                itens = EntradaProdutos.objects.filter(compra=compra.id)
                                for index in itens:
                                    classe = 'success'
                                    if index.status_entrada == 'CANCELADO':
                                        classe = 'danger'
                                    itens_compra += [{
                                        'id': str(index.id),
                                        'compra': str(index.compra),
                                        'produto': str(index.produto),
                                        'quantidade': str(index.quantidade),
                                        'preco_compra': moeda_real(index.preco_compra),
                                        'data_entrada': str(index.data_entrada),
                                        'data_fabricacao': str(index.data_fabricacao),
                                        'data_validade': str(index.data_validade),
                                        'numero_lote': str(index.numero_lote),
                                        'total': moeda_real(index.total),
                                        'balanco': index.balanco,
                                        'marca': str(index.produto.marca_produto),
                                        'status_entrada': index.status_entrada,
                                        'observacoes_entrada': index.observacoes_entrada,
                                        'empresa': str(index.empresa),
                                        'classe': classe
                                    }]
                        mensagem = 'Compra cancelada com sucesso!!!'
                elif status == status_compra:
                    mensagem = '''O registro não foi alterado, pois o seu státus é exatamente o mesmo indicado para
                                  alteração...'''
                    info = 1
    else:
        erro = 1
        mensagem = mensagem_permissao_negada()
        titulo = titulo_mensagem_permissao_negada()
    retorno['itens'] = itens_compra
    retorno['sucesso'] = sucesso
    retorno['erro'] = erro
    retorno['info'] = info
    retorno['mensagem'] = mensagem
    retorno['titulo'] = titulo
    retorno['status'] = status
    retorno['status_compra'] = status_compra
    return HttpResponse(
            json.dumps(retorno), content_type="application/json")


@login_required
def registrar_entrada_produto(request):
    entrada_id = int(request.POST.get('entrada_id' or 0))
    atualizar_preco = request.POST.get('atualizar_preco')
    atualizar_preco_tabelado = request.POST.get('atualizar_preco_tabelado')

    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []
    itens_compra = []
    quantidade_anterior = 0
    classe = ''
    compra = ''
    valor_total = 0
    if request.method == 'POST':
        if entrada_id > 0:
            entrada = EntradaProdutos.objects.get(id=int(entrada_id))
            quantidade_anterior = entrada.quantidade
        else:
            entrada = None
        if 'form_entrada' in request.POST and request.POST['form_entrada']:
            form_entrada = FormEntradaProdutos(deserialize_form(request.POST.get('form_entrada')), instance=entrada)
            if form_entrada.is_valid():
                registro = form_entrada.save(commit=False)
                produto = Produtos.objects.get(id=registro.produto_id)
                estoque_atual = float(produto.estoque_atual)
                estoque_total = (float(estoque_atual) - float(quantidade_anterior))
                quantidade = float(registro.quantidade)
                novo_estoque = (float(estoque_total) + float(quantidade))
                produto.estoque_atual = ("%.3f" % novo_estoque)
                if entrada_id < 1:
                    registro.empresa = usuario.empresa
                    registro.usuario = request.user
                    titulo_mensagem = 'REGISTRANDO ENTRADA DE PRODUTOS'
                    mensagem = 'Entrada registrada com sucesso!!!'
                else:
                    titulo_mensagem = 'ALTERANDO REGISTRO...'
                    mensagem = 'O registro foi alterado com sucesso!!!'
                if novo_estoque >= 0 or entrada_id < 1:
                    preco_compra_anterior = produto.valor_compra
                    percentual = produto.percentual_lucro
                    preco_compra_atual = registro.preco_compra

                    if atualizar_preco == 'SIM':
                        produto.preco_venda = (((percentual / 100) * preco_compra_atual) + preco_compra_atual)
                        produto.valor_compra = registro.preco_compra

                    if atualizar_preco_tabelado == 'SIM':
                        tabela_preco = TabelaPrecos.objects.filter(produto__id=produto.id)
                        for item in tabela_preco:
                            percentual = item.percentual
                            item.preco_venda = (((percentual / 100) * preco_compra_atual) + preco_compra_atual)
                            item.save()

                    registro.save()
                    produto.save()
                    itens = EntradaProdutos.objects.filter(compra=registro.compra)
                    for index in itens:
                        classe = 'success'
                        valor_total += index.total
                        if index.status_entrada == 'CANCELADO':
                            classe = 'danger'
                            valor_total -= index.total
                        itens_compra += [{
                            'id': str(index.id),
                            'compra': str(index.compra),
                            'produto': str(index.produto),
                            'quantidade': str(index.quantidade),
                            'preco_compra': moeda_real(index.preco_compra),
                            'data_entrada': str(index.data_entrada),
                            'data_fabricacao': str(index.data_fabricacao),
                            'data_validade': str(index.data_validade),
                            'numero_lote': str(index.numero_lote),
                            'total': moeda_real(index.total),
                            'balanco': index.balanco,
                            'marca': str(index.produto.marca_produto),
                            'status_entrada': index.status_entrada,
                            'observacoes_entrada': index.observacoes_entrada,
                            'empresa': str(index.empresa),
                            'classe': classe
                        }]
                    compra = Compras.objects.get(id=registro.compra.id)
                    sucesso['itens'] = itens_compra
                    sucesso['mensagem'] = mensagem + ' ' + moeda_real(preco_compra_atual) + ' | ' + moeda_real(preco_compra_anterior)
                    sucesso['id'] = registro.id
                    sucesso['titulo'] = titulo_mensagem
                    sucesso['sucesso'] = 1
                    sucesso['fornecedor'] = str(compra.fornecedor.nome_razao_social)
                    sucesso['valor_total'] = moeda_real(valor_total)
                    sucesso['data_compra'] = str(compra.data_compra.strftime("%d-%m-%Y"))
                    sucesso['solicitante'] = compra.solicitante
                    sucesso['status_compra'] = compra.status_compra
                    retorno = json.dumps(sucesso)
                elif novo_estoque < 0 and (entrada_id > 0):
                    retorno = json.dumps({
                        'titulo': 'QUANTIDADE INVÁLIDA...',
                        'mensagem': 'Parte desre produto já foi vendido. Não foi possível fazer a alteração...',
                        'erro2': 1,
                    })
            else:
                for error in form_entrada.errors:
                    erro += {error}
                    erro += {error}
                titulo_mensagem = 'ERRO NA VALIDAÇÃO DOS DADOS...'
                mensagem = 'Por favor, corrija os campos listados em vermelho e tente novamente...'
                retorno = json.dumps({
                    'titulo': titulo_mensagem,
                    'mensagem': mensagem,
                    'erro': erro,
                })
        else:
            retorno = json.dumps({
                'titulo': titulo_mensagem_erro_padrao(),
                'mensagem': mensagem_erro_padrao(),
                'erro2': 1,
            })
    return HttpResponse(retorno, content_type="application/json")


def buscar_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    produto = Produtos.objects.filter(id=0)
    codigo_barras = request.GET.get('codigo_barras') or ''
    id_entrada = int(request.GET.get('id_entrada') or 0)
    id_produto = int(request.GET.get('id_produto') or 0)
    id_compra = int(request.GET.get('id_compra') or 0)
    campos = {}
    if id_entrada > 0:
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.edita_entrada_produto:
            retorno['permissao_negada'] = 1
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['mensagem'] = mensagem_permissao_negada()
            return HttpResponse(json.dumps(retorno), content_type="application/json")

        entrada = EntradaProdutos.objects.filter(id=id_entrada)
        if entrada:
            entrada = EntradaProdutos.objects.get(id=id_entrada)
            produto = Produtos.objects.get(id=entrada.produto.id)
            form = FormEntradaProdutos(instance=entrada)
            for campo in form.fields:
                if campo in form.initial:
                    campos[form.auto_id % campo] = str(form.initial[campo])

    elif id_produto > 0:
        produto = Produtos.objects.filter(id=id_produto, empresa=usuario.empresa.id, status='ATIVO')
        if produto:
            produto = Produtos.objects.get(id=id_produto)

    elif codigo_barras != '':
        produto = Produtos.objects.filter(codigo_barras=codigo_barras, empresa=usuario.empresa.id, status='ATIVO')
        if produto:
            produto = Produtos.objects.get(codigo_barras=codigo_barras, empresa=usuario.empresa.id, status='ATIVO')

    if produto:
        retorno['sucesso'] = 1
        titulo = 'BUSCANADO PRODUTO...'
        mensagem = 'Busca efetuada com sucesso!!!'
        retorno['id'] = produto.id
        retorno['estoque_atual'] = produto.estoque_atual
        retorno['status'] = produto.status
        retorno['codigo_barras'] = produto.codigo_barras
        retorno['preco_venda'] = str(produto.preco_venda)
        retorno['valor_compra'] = str(produto.valor_compra)
        retorno['estoque_atual'] = str(produto.estoque_atual)
        retorno['descricao_simplificada'] = produto.descricao_simplificada
        retorno['unidade_medida'] = produto.unidade_medida
        retorno['categoria'] = str(produto.categoria_produto)
        retorno['estoque_minimo'] = str(produto.estoque_minimo)
        retorno['estoque_maximo'] = str(produto.estoque_maximo)
        retorno['fracionar_produto'] = produto.fracionar_produto
        retorno['id_embalagem_fechada'] = str(produto.id_embalagem_fechada)
        retorno['desconto_maximo'] = str(produto.desconto_maximo)
        retorno['atacado_apartir'] = str(produto.atacado_apartir)
        retorno['atacado_desconto'] = str(produto.atacado_desconto)
        retorno['empresa'] = str(produto.empresa)
        retorno['marca'] = str(produto.marca_produto)
        retorno['status'] = produto.status
        retorno['mensagem'] = mensagem
        retorno['titulo'] = titulo
        retorno['quantidade_embalagem_fechada'] = 0
        retorno['estoque_embalagem_fechada'] = 0
        retorno['campos'] = campos
        retorno['id_entrada'] = id_entrada

    else:
        retorno['alerta'] = 1
        retorno['titulo'] = 'PRODUTO NÃO CADASTRADO...'
        retorno['mensagem'] = '''Não encontramos registros deste produto em nosso sistema,
                            se já o cadastrou, verifique se seu státus está ativo, se não, cadastre-o...'''

    return HttpResponse(json.dumps(retorno), content_type="application/json")


def cancelar_entrada_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    mensagem = ''
    titulo = ''
    sucesso = 0
    erro = 0
    info = 0
    titulo = 'CANCELANDO ÌTEM...'
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.edita_entrada_produto:
        if request.method == 'POST':
            entrada = EntradaProdutos.objects.filter(pk=int(QueryDict(request.body).get('id_entrada')))
            if entrada:
                entrada = EntradaProdutos.objects.get(pk=int(QueryDict(request.body).get('id_entrada')))
                produto = Produtos.objects.get(id=entrada.produto.id)
                if entrada.status_entrada != 'CANCELADO':
                    entrada.status_entrada = 'CANCELADO'
                    produto.estoque_atual -= entrada.quantidade
                    entrada.save()
                    produto.save()
                    mensagem = 'Ìtem cancelado com sucesso!!!'
                    sucesso = 1
                    retorno['status'] = 'CANCELADO'
                elif entrada.status_entrada == 'CANCELADO':
                    mensagem = '''Este ítem já encontra-se cancelado...'''
                    info = 1
    else:
        erro = 1
        mensagem = mensagem_permissao_negada()
        titulo = titulo_mensagem_permissao_negada()

    retorno['sucesso'] = sucesso
    retorno['erro'] = erro
    retorno['info'] = info
    retorno['mensagem'] = mensagem
    retorno['titulo'] = titulo

    return HttpResponse(
            json.dumps(retorno), content_type="application/json")


@login_required
def finalizar_compra(request):
    titulo = 'FINALIZANDO COMPRA...'
    mensagem = ''
    fornecedor = 0
    registro = {}
    p = {}
    compra = {}
    itens = {}
    erro = 0
    id_compra = 0
    id_conta = 0
    info = 0
    alerta = 0
    valortotal = 0
    sucesso = 0
    retorno = {}
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.finaliza_compra:
        if request.method == 'GET':
            id_conta = int(request.GET.get('id_conta') or 0)
            id_compra = int(request.GET.get('id_compra') or 0)
        elif request.method == 'POST':
            id_conta = int(request.POST.get('id_conta') or 0)
            id_compra = int(request.POST.get('id_compra') or 0)

        if id_compra > 0:
            compra = Compras.objects.get(id=id_compra)
            fornecedor = compra.fornecedor.id
            itens = EntradaProdutos.objects.filter(compra=compra.id, status_entrada='LANCADO')
            if id_conta > 0:
                conta = ContasPagar.objects.get(id=int(id_conta))
            else:
                conta = None

            if request.method == 'POST':
                form = FormContasPagar(deserialize_form(request.POST.get('form')), instance=conta)

                if form.is_valid():
                    registro = form.save(commit=False)

                    if itens:
                        valortotal = 0
                        for item in itens:
                            valortotal = valortotal + item.total

                        compra.valor_total = valortotal
                        compra.status_compra = 'LANCADO'

                        registro.usuario = request.user
                        registro.empresa = usuario.empresa
                        registro.status_conta = 'PENDENTE'
                        registro.data_vencimento = datetime.now()
                        registro.documento_vinculado = compra.id
                        registro.valor_conta = compra.valor_total
                        registro.descricao = 'Pagamento referente a compra 000' + str(compra.id)

                        if registro.valor_entrada < compra.valor_total:
                            if registro.forma_de_pagamento == 'A VISTA' and registro.valor_entrada == 0.0 or \
                                            registro.forma_de_pagamento == 'A PRAZO':

                                registro.save()
                                conta = ContasPagar.objects.get(id=registro.id)
                                id_conta = conta.id
                                compra.pagamento = conta
                                compra.save()

                                if registro.valor_entrada > 0:
                                    pgtos = None
                                    frm = FormPagamentos(instance=pgtos)
                                    p = frm.save(commit=False)
                                    p.conta_id = registro.id
                                    p.empresa = registro.empresa
                                    p.usuario = request.user
                                    p.meio_pagamento = registro.meio_de_pagamento
                                    p.data_pagamento = datetime.now()
                                    p.data_vencimento = datetime.now()
                                    p.valor_pagamento = registro.valor_entrada
                                    p.status_pagamento = 'PAGO'
                                    registro.status_conta = 'PARCIALMENTE PAGO'
                                    p.observacoes_pagamento = 'Pago como entrada no ato da compra.'
                                    registro.save()
                                    p.save()

                                if registro.forma_de_pagamento == 'A VISTA':
                                    pgtos = None
                                    frm = FormPagamentos(instance=pgtos)
                                    p = frm.save(commit=False)
                                    p.empresa = registro.empresa
                                    p.usuario = request.user
                                    p.meio_pagamento = registro.meio_de_pagamento
                                    p.conta_id = registro.id
                                    p.data_pagamento = datetime.now()
                                    p.data_vencimento = datetime.now()
                                    p.valor_pagamento = compra.valor_total
                                    p.status_pagamento = 'PAGO'
                                    registro.status_conta = 'PAGO'
                                    registro.status_conta = 'PAGO'
                                    registro.quantidade_parcelas = 0
                                    p.meio_pagamento = registro.meio_de_pagamento
                                    p.observacoes_pagamento = 'Pagamento realizado no ato da compra.'
                                    p.save()
                                    registro.save()

                                if registro.forma_de_pagamento == 'A PRAZO':
                                    data = registro.primeiro_vencimento
                                    restante = int(registro.quantidade_parcelas)
                                    for ps in range(0, restante):
                                        pgtos = None
                                        frm = FormPagamentos(instance=pgtos)
                                        p = frm.save(commit=False)
                                        p.conta_id = registro.id
                                        if ps == 0:
                                            vencimento = datetime.fromordinal(data.toordinal())
                                        else:
                                            vencimento = datetime.fromordinal(data.toordinal() + 31 * ps)
                                        p.empresa = registro.empresa
                                        p.usuario = request.user
                                        p.data_vencimento = vencimento
                                        p.valor_pagamento = (compra.valor_total - registro.valor_entrada) / restante
                                        p.status_pagamento = 'PENDENTE'
                                        p.meio_pagamento = registro.meio_de_pagamento
                                        p.observacoes_pagamento = \
                                            'Pagamento programado conforme informações coletadas nafinalização da compra.'
                                        p.save()

                                mensagem = 'Compra finalizada com sucesso!!!'
                                sucesso = 1

                            elif registro.forma_de_pagamento == 'A VISTA' and registro.valor_entrada != 0.0:
                                mensagem = 'Tratando se de um pagamento á vista, o valor da entrada deve ser sempre 0,00'
                                erro = 1

                        elif registro.valor_entrada >= compra.valor_total:
                            mensagem = '''Tratando-se de um pagamento a prazo, a  entrada não pode ser igual nem superior
                            ao valor total da compra'''
                            erro = 1

                    else:
                        mensagem = 'Não foi possível finalizar a compra, pois não foi vendido nenhum ítem...'
                        erro = 1

                else:
                    form_erro = []
                    for error in form.errors:
                        form_erro += {error}

                    retorno['form_erro'] = form_erro
                    titulo = 'ERRO NA VALIDAÇÃO DOS DADOS...'
                    mensagem = 'Por favor, corrija os campos listados em vermelho e tente novamente...'
            else:

                if itens:
                    valortotal = 0
                    for item in itens:
                        valortotal = valortotal + item.total
        else:
            mensagem = mensagem_erro_padrao()
            titulo = titulo_mensagem_erro_padrao()
            erro = 1
    else:
        mensagem = mensagem_permissao_negada()
        titulo = titulo_mensagem_permissao_negada()
        erro = 1

    retorno['sucesso'] = sucesso
    retorno['erro'] = erro
    retorno['info'] = info
    retorno['id_conta'] = id_conta
    retorno['alerta'] = alerta
    retorno['mensagem'] = mensagem
    retorno['titulo'] = titulo
    retorno['valor_total'] = str(valortotal)
    retorno['method'] = request.method
    retorno['favorecido'] = str(fornecedor)
    retorno['data_atual'] = str(datetime.now().strftime('%Y-%m-%d'))

    return HttpResponse(json.dumps(retorno), content_type="application/json")


@login_required
def conta_a_pagar(request, id_compra):
    retorno = {}
    id_conta = 0
    compra = {}
    usuario = Usuarios.objects.get(usuario=request.user.id)

    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
        retorno['deslogar_usuario'] = 1
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    if not usuario.permissoes.administrador_super:
        compra = Compras.objects.get(id=id_compra, empresa=usuario.empresa.id)
    elif usuario.permissoes.administrador_super:
        compra = Compras.objects.get(id=id_compra)
    try:
        pagamento = ContasPagar.objects.filter(id=compra.pagamento.id)
    except:
        pagamento = {}

    if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:
        permissoes = 0
        if usuario.permissoes.administrador_super or usuario.permissoes.administrador or (
            usuario.permissoes.acessa_contas_pagar
            and usuario.permissoes.edita_contas_pagar
            and usuario.permissoes.exclui_contas_pagar
            and usuario.permissoes.quita_contas_pagar
            and usuario.permissoes.registra_pagamento
            and usuario.permissoes.acessa_pagamento
            and usuario.permissoes.edita_pagamento
            and usuario.permissoes.exclui_pagamento
            and usuario.permissoes.muda_status_pagamento):
            permissoes = 1
        if permissoes == 0:
            retorno['mensagem'] = mensagem_permissao_negada()
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
        elif permissoes == 1 and not pagamento:
            retorno['mensagem'] = 'Não há registros de pagamentos vinculados a esta compra...'
            retorno['titulo'] = 'NENHUM PAGAMENTO REGISTRADO...'
            retorno['info'] = 1
        elif permissoes == 1:
            retorno['permissoes'] = permissoes
        return HttpResponse(json.dumps(retorno), content_type="application/json")
    else:

        if int(id_compra) > 0:
            if compra.status_compra == 'LANCADO':
                id_conta = str(compra.pagamento.id)

        return HttpResponseRedirect('/admin/contas_a_pagar/contaspagar/'+id_conta+'/')

