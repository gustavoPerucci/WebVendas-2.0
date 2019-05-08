# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from cadastros.usuarios.models import Usuarios
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, HttpResponseRedirect
from .models import Vendas, SaidaProdutos
from .forms import FormVendas, FormSaidaProdutos
import traceback
from django.http import HttpResponse
from django.http import QueryDict
import json
from functions.views import deserialize_form
from cadastros.clientes.models import Clientes
from datetime import datetime
from estoque.produtos.models import Produtos, TabelaPrecos
from functions.views import (mensagem_permissao_negada, titulo_mensagem_permissao_negada, mensagem_erro_padrao,
                             titulo_mensagem_erro_padrao
                             )
from financeiro.contas_a_receber.models import ContasReceber
from financeiro.contas_a_receber.forms import FormContasReceber
from financeiro.pagamentos_recebidos.forms import FormPagamentos
from financeiro.pagamentos_recebidos.models import PagamentosRecebidos
from django.contrib import messages


@login_required
def vendas(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
        messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
        não pode mais acessar nosso sistema...''')
        return HttpResponseRedirect('/logout/')
    try:
        sub_titulo = 'Vendas'
        form_vendas = FormVendas()
        form_saida = FormSaidaProdutos()
        form_contas_a_receber = FormContasReceber()
        form_vendas.fields['cliente'].queryset = Clientes.objects.filter(empresa=usuario.empresa)
        form_saida.fields['produto'].queryset = Produtos.objects.filter(empresa=usuario.empresa, status='ATIVO')
        form_saida.fields['venda'].queryset = Vendas.objects.filter(empresa=usuario.empresa, status_pedido='EM ANDAMENTO')
    except:
        trace = traceback.format_exc()
        erro = 1
        if request.user.is_superuser:
            mensagem = 'Houve um erro interno no sistema. ' + trace
        else:
            mensagem = ''

    return render(request, "vendas/vendas.html", locals(),)


@login_required
def registrar_nova_venda(request):
    venda_id = request.POST.get('id')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []
    tabela = []
    if venda_id != '0':
        venda = Vendas.objects.get(id=int(venda_id))

    else:
        venda = None

    if request.method == 'POST':
        form = deserialize_form(request.POST.get('form'))
        form = FormVendas(form, instance=venda)

        if form.is_valid():
            registro = form.save(commit=False)
            if not venda_id != '0':
                registro.empresa = usuario.empresa
                registro.usuario = request.user
                titulo_mensagem = 'SALVANDO REGISTRO . . .'
                mensagem = 'O registro foi salvo com sucesso !!!'

            else:
                titulo_mensagem = 'ALTERANDO REGISTRO . . .'
                mensagem = 'O registro foi alterado com sucesso !!!'

            registro.save()
            tb_precos = TabelaPrecos.objects.filter(cliente=registro.cliente, status_preco='ATIVO')

            for index in tb_precos:
                tabela += [{
                    'id_produto': str(index.produto.id),
                    'produto': str(index.produto),
                }]
            sucesso['tabela'] = tabela
            sucesso['success'] = True
            sucesso['mensagem'] = mensagem
            sucesso['id'] = registro.id
            sucesso['titulo'] = titulo_mensagem
            sucesso['cliente'] = registro.cliente.nome_razao_social
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


def buscar_venda(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    id = int(request.GET.get('id') or 0)
    venda = {}
    itens_venda = []
    classe = ''
    valor_total = 0

    try:
        if usuario.permissoes.administrador or usuario.permissoes.acessa_registro_venda:
            venda = Vendas.objects.get(id=id, empresa=usuario.empresa)
    except:
        pass

    try:
        if usuario.permissoes.administrador_super:
            venda = Vendas.objects.get(id=id)
    except:
        pass

    if not venda:
        retorno = json.dumps({
            'titulo': 'REGISTRO NÃO ENCONTRADO',
            'mensagem': 'O sistema não identificou nenhuma venda com este ID.',
            'alerta': 1,
        })
    else:
        form = FormVendas(instance=venda)
        titulo = 'BUSCANADO REGISTROS...'
        mensagem = 'Busca efetuada com sucesso ! ! !'
        campos = {}
        itens = SaidaProdutos.objects.filter(venda=venda.id)
        for index in itens:
            classe = ''
            valor_total += index.saldo_final
            if index.status == 'CANCELADO':
                valor_total -= index.saldo_final
                classe = 'danger'
            elif index.status == 'ENTREGUE' or index.status == 'SEPARADO':
                classe = 'success'
            elif index.status == 'EM SEPARACAO':
                classe = 'primary'
            elif index.status == 'AGUARDANDO':
                classe = 'warning'

            itens_venda += [{
                'venda': str(index.venda),
                'id': str(index.id),
                'produto': str(index.produto),
                'descricao_simplificada': str(index.produto.descricao_simplificada),
                'quantidade': str(index.quantidade),
                'valor_unitario': str(index.valor_unitario),
                'percentual_desconto': str(index.percentual_desconto),
                'total_desconto': str(index.total_desconto),
                'valor_total': str(index.valor_total),
                'saldo_final': str(index.saldo_final),
                'data_saida': str(index.data_saida),
                'status': str(index.status),
                'observacoes_saida': index.observacoes_saida,
                'empresa': str(index.empresa),
                'classe': classe,
            }]
        for campo in form.fields:
            if campo in form.initial:
                campos[form.auto_id % campo] = str(form.initial[campo] or '')

        retorno = json.dumps({
            'id': id,
            'id_pedido': id,
            'titulo': titulo,
            'mensagem': mensagem,
            'cliente': str(venda.cliente.nome_razao_social),
            'valor_total': str(valor_total),
            'data_venda': str(venda.data_venda.strftime('%d/%m/%Y')),
            'data_entrega': str(venda.data_entrega.strftime('%d/%m/%Y')),
            'solicitante': venda.solicitante,
            'status_pedido': venda.status_pedido,
            'campos': campos,
            'itens': itens_venda,
        })

    return HttpResponse(retorno, content_type='application/json')


def buscar_vendas(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    tb_vendas = {}
    mensagem = ''
    vendas = []
    classe = ''
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.acessa_registro_venda:
        if 'status' in request.GET and request.GET['status']:
            status = request.GET.get('status')
            if status == 'CONCLUIDO E ENTREGUE':
                tb_vendas = Vendas.objects.filter(empresa=usuario.empresa.id, status_pedido=status) | Vendas.objects.filter(empresa=usuario.empresa.id, status_pedido=status)
                if usuario.permissoes.administrador_super:
                    tb_vendas = Vendas.objects.filter(status_pedido=status) | Vendas.objects.filter(status_pedido=status)
            else:
                tb_vendas = Vendas.objects.filter(empresa=usuario.empresa.id, status_pedido=status)
                if usuario.permissoes.administrador_super:
                    tb_vendas = Vendas.objects.filter(status_pedido=status)

        if 'id_venda' in request.GET and request.GET['id_venda']:
            id_venda = request.GET.get('id_venda')
            tb_vendas = Vendas.objects.filter(empresa=usuario.empresa.id, pk=int(id_venda))

            if usuario.permissoes.administrador_super:
                tb_vendas = Vendas.objects.filter(pk=int(id_venda))

        if 'data_venda' in request.GET and request.GET['data_venda']:
            data_venda = request.GET.get('data_venda')
            data_venda = datetime.strptime(data_venda, "%Y-%m-%d")
            tb_vendas = Vendas.objects.filter(empresa=usuario.empresa.id, data_venda=data_venda)

            if usuario.permissoes.administrador_super:
                tb_vendas = Vendas.objects.filter(data_venda=data_venda)

        if 'cliente' in request.GET and request.GET['cliente']:
            cliente = request.GET.get('cliente')
            tb_vendas = Vendas.objects.filter(empresa=usuario.empresa.id, cliente=cliente)

            if usuario.permissoes.administrador_super:
                tb_vendas = Vendas.objects.filter(cliente=cliente)
        for index in tb_vendas:

            if index.status_pedido == 'EM ANDAMENTO':
                classe = ''
            elif index.status_pedido == 'CONCLUIDO NAO ENTREGUE':
                classe = 'warning'
            elif index.status_pedido == 'CONCLUIDO ENTREGUE':
                classe = 'success'
            elif index.status_pedido == 'CANCELADO':
                classe = 'danger'

            itens = SaidaProdutos.objects.filter(venda=index.id)
            valor_total = 0
            total_desconto = 0
            for i in itens:
                valor_total += i.valor_total
                total_desconto += i.total_desconto
                if i.status == 'CANCELADO':
                    valor_total -= i.valor_total
                    total_desconto -= i.total_desconto

            if index.pagamento:
                status_pagamento = index.pagamento.status_conta
                id_pagamento = index.pagamento.id
            else:
                status_pagamento = 'PENDENTE'
                id_pagamento = 'NAO PAGO'

            if not id_pagamento:
                id_pagamento = 'NAO PAGO'

            vendas += [{
                    'id': index.id,
                    'cliente': str(index.cliente),
                    'solicitante': index.solicitante,
                    'data_venda': str(index.data_venda),
                    'data_entrega': str(index.data_entrega),
                    'vencimento': str(index.vencimento),
                    'status_pedido': index.status_pedido,
                    'status_pagamento': status_pagamento,
                    'valor_total': str('%0.02f' % valor_total),
                    'desconto': str('%0.02f' % total_desconto),
                    'saldo_final': str('%0.02f' % (valor_total-total_desconto)),
                    'observacoes': index.observacoes,
                    'pagamento': str(id_pagamento),
                    'pagamento_id': str(id_pagamento),
                    'empresa': str(index.empresa),
                    'cep': index.cep,
                    'endereco': index.endereco,
                    'numero': index.numero,
                    'complemento': index.complemento,
                    'bairro': index.bairro,
                    'cidade': index.cidade,
                    'estado': index.estado,
                    'observacoes_entrega': index.observacoes_entrega,
                    'classe': classe,
                    'mensagem': mensagem,
            }]
    else:
        vendas += [{
            'titulo': titulo_mensagem_permissao_negada(),
            'mensagem': mensagem_permissao_negada(),
            'erro': 1,
        }]
    retorno = json.dumps(vendas)
    return HttpResponse(retorno, content_type='application/json')


def muda_status_venda(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    mensagem = ''
    sucesso = 0
    erro = 0
    info = 0
    itens_venda = []
    status = ''
    status_pedido = ''
    titulo = 'ALTERANDO STÁTUS DA VENDA...'
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.muda_status_venda:
        if request.method == 'POST':
            venda = Vendas.objects.filter(pk=int(QueryDict(request.body).get('id_venda')))
            status = QueryDict(request.body).get('status')
            if venda:
                venda = Vendas.objects.get(pk=int(QueryDict(request.body).get('id_venda')))
                status_pedido = venda.status_pedido
                if status != status_pedido:
                    venda.status_pedido = str(status)
                    venda.save()
                    sucesso = 1

                    itens = SaidaProdutos.objects.filter(
                        venda=venda.id, status='EM SEPARACAO') | SaidaProdutos.objects.filter(
                        venda=venda.id, status='SEPARADO') | SaidaProdutos.objects.filter(
                        venda=venda.id, status='AGUARDANDO') | SaidaProdutos.objects.filter(
                        venda=venda.id, status='ENTREGUE')

                    if status == 'CONCLUIDO NAO ENTREGUE':
                        mensagem = 'Esta venda foi marcada novamente como não entregue...'
                        for item in itens:
                            item.status = 'SEPARADO'
                            item.save()

                    elif status == 'CONCLUIDO E ENTREGUE':
                        mensagem = 'Esta venda foi marcada como entregue...'
                        for item in itens:
                            item.status = 'ENTREGUE'
                            item.save()

                    elif status == 'CANCELADO':
                        mensagem = 'Venda cancelada com sucesso!!!'
                        if itens:
                            for item in itens:
                                produto = Produtos.objects.get(id=item.produto.id)
                                produto.estoque_atual += item.quantidade
                                item.status = 'CANCELADO'
                                item.save()
                                produto.save()
                        
                        if venda.pagamento:
                            conta = ContasReceber.objects.filter(documento_vinculado=venda.pk)
                            if conta:
                                conta = ContasReceber.objects.get(documento_vinculado=venda.pk)
                                pagamentos = PagamentosRecebidos.objects.filter(conta=conta.pk)
                                for pagamento in pagamentos:
                                    pagamento.delete()
                                conta.delete()                               
                        
                elif status == status_pedido:
                    mensagem = '''O registro não foi alterado, pois o seu státus é exatamente o mesmo indicado para
                                      alteração...'''
                    info = 1
    else:
        erro = 1
        mensagem = mensagem_permissao_negada()
        titulo = titulo_mensagem_permissao_negada()
    retorno['itens'] = itens_venda
    retorno['sucesso'] = sucesso
    retorno['erro'] = erro
    retorno['info'] = info
    retorno['mensagem'] = mensagem
    retorno['titulo'] = titulo
    retorno['status'] = status
    retorno['status_pedido'] = status_pedido
    return HttpResponse(
        json.dumps(retorno), content_type="application/json")


@login_required
def finalizar_venda(request):
    titulo = 'FINALIZANDO PEDIDO...'
    mensagem = ''
    cliente = 0
    registro = {}
    p = {}
    venda = {}
    itens = {}
    erro = 0
    id_venda = 0
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
            id_venda = int(request.GET.get('id_venda') or 0)
        elif request.method == 'POST':
            id_conta = int(request.POST.get('id_conta') or 0)
            id_venda = int(request.POST.get('id_venda') or 0)

        if id_venda > 0:
            venda = Vendas.objects.get(id=id_venda)
            cliente = venda.cliente.id
            itens = SaidaProdutos.objects.filter(venda=venda.id, status='AGUARDANDO')

            if itens:
                valortotal = 0
                desc = 0
                tot = 0
                for item in itens:
                    valortotal += item.saldo_final
                    desc += item.total_desconto
                    tot += item.valor_unitario

                if id_conta > 0:
                    conta = ContasReceber.objects.get(id=int(id_conta))
                else:
                    conta = None

                if request.method == 'POST':
                    form = FormContasReceber(deserialize_form(request.POST.get('form')), instance=conta)

                    if form.is_valid():
                        registro = form.save(commit=False)

                        venda.saldo_final = valortotal
                        venda.valor_total = tot
                        venda.desconto = desc
                        venda.status_pedido = 'CONCLUIDO NAO ENTREGUE'

                        registro.usuario = request.user
                        registro.empresa = usuario.empresa
                        registro.status_conta = 'PENDENTE'
                        registro.data_vencimento = datetime.now()
                        registro.documento_vinculado = venda.id
                        registro.valor_conta = venda.saldo_final
                        registro.descricao = 'Pagamento referente ao pedido 000' + str(venda.id)

                        if registro.valor_entrada < venda.saldo_final:
                            if registro.forma_de_pagamento == 'A VISTA' and registro.valor_entrada == 0.0 or \
                                            registro.forma_de_pagamento == 'A PRAZO':

                                registro.save()
                                conta = ContasReceber.objects.get(id=registro.id)
                                id_conta = conta.id
                                venda.pagamento = conta
                                venda.save()

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
                                    p.observacoes_pagamento = 'Pago como entrada no ato da venda.'
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
                                    p.valor_pagamento = venda.saldo_final
                                    # p.status_pagamento = 'PAGO'
                                    # registro.status_conta = 'PAGO'
                                    # registro.status_conta = 'PAGO'
                                    registro.quantidade_parcelas = 0
                                    p.meio_pagamento = registro.meio_de_pagamento
                                    p.observacoes_pagamento = 'Pagamento realizado no ato da venda.'
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
                                        p.valor_pagamento = (venda.saldo_final - registro.valor_entrada) / restante
                                        p.status_pagamento = 'PENDENTE'
                                        p.meio_pagamento = registro.meio_de_pagamento
                                        p.observacoes_pagamento = 'Pagamento programado conforme informações coletadas nafinalização da venda.'
                                        p.save()

                                mensagem = 'Venda finalizada com sucesso!!!'
                                sucesso = 1
                                for item in itens:
                                    if item.status != 'CANCELADO':
                                        item.status = 'EM SEPARACAO'
                                        item.save()
                            elif registro.forma_de_pagamento == 'A VISTA' and registro.valor_entrada != 0.0:
                                mensagem = 'Tratando se de um pagamento á vista, o valor da entrada deve ser sempre $0,00'
                                erro = 1

                        elif registro.valor_entrada >= venda.saldo_final:
                            mensagem = '''Tratando-se de um pagamento a prazo, a  entrada não pode ser igual nem superior
                            ao valor total do pedido'''
                            erro = 1
                    else:
                        form_erro = []
                        for error in form.errors:
                            form_erro += {error}

                        retorno['form_erro'] = form_erro
                        titulo = 'ERRO NA VALIDAÇÃO DOS DADOS...'
                        mensagem = 'Por favor, corrija os campos listados em vermelho e tente novamente...'
            else:
                mensagem = 'Não será possível finalizar a venda, pois não foi vendido nenhum ítem. Caso não tenha interesse em continuá-la, você deve cancelar a mesma...'
                erro = 1
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
    retorno['agente_pagador'] = str(cliente)
    retorno['data_atual'] = str(datetime.now().strftime('%Y-%m-%d'))

    return HttpResponse(json.dumps(retorno), content_type="application/json")


@login_required
def conta_a_receber(request, id_venda):
    retorno = {}
    id_conta = 0
    venda = {}
    usuario = Usuarios.objects.get(usuario=request.user.id)

    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
        retorno['deslogar_usuario'] = 1
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    if not usuario.permissoes.administrador_super:
        venda = Vendas.objects.get(id=id_venda, empresa=usuario.empresa.id)
    elif usuario.permissoes.administrador_super:
        venda = Vendas.objects.get(id=id_venda)
    try:
        pagamento = ContasReceber.objects.filter(id=venda.pagamento.id)
    except:
        pagamento = {}

    if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:
        permissoes = 0
        if usuario.permissoes.administrador_super or usuario.permissoes.administrador or (
            usuario.permissoes.acessa_contas_receber
            and usuario.permissoes.edita_contas_receber
            and usuario.permissoes.exclui_contas_receber
            and usuario.permissoes.quita_contas_receber
            and usuario.permissoes.registra_recebimento
            and usuario.permissoes.acessa_recebimento
            and usuario.permissoes.edita_recebimento
            and usuario.permissoes.exclui_recebimento
            and usuario.permissoes.muda_status_recebimento):
            permissoes = 1
        if permissoes == 0:
            retorno['mensagem'] = mensagem_permissao_negada()
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
        elif permissoes == 1 and not pagamento:
            retorno['mensagem'] = 'Não há registros de pagamentos vinculados a esta venda...'
            retorno['titulo'] = 'NENHUM PAGAMENTO REGISTRADO...'
            retorno['info'] = 1
        elif permissoes == 1:
            retorno['permissoes'] = permissoes
        return HttpResponse(json.dumps(retorno), content_type="application/json")
    else:

        if int(id_venda) > 0:
            if venda.status_pedido == 'CONCLUIDO NAO ENTREGUE' or venda.status_pedido == 'CONCLUIDO E ENTREGUE':
                id_conta = str(venda.pagamento.id)
        return HttpResponseRedirect('/admin/contas_a_receber/contasreceber/'+id_conta+'/')
