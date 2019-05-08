# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib.auth.decorators import login_required
from django.shortcuts import render
from django.http import HttpResponse, QueryDict
from functions.views import deserialize_form
from estoque.produtos.models import TabelaPrecos, PrecosPomocionais, Produtos
from .models import SaidaProdutos, Vendas
from cadastros.usuarios.models import Usuarios
from .forms import FormSaidaProdutos
import json
from datetime import datetime
from functions.views import mensagem_permissao_negada, titulo_mensagem_permissao_negada
import traceback
from io import BytesIO
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from functions.views import moeda_real, moeda


def if_null(v, default):
    if (not v) or (v is None):
        return default
    else:
        return v


@login_required
def registrar_saida_produto(request):
    saida_id = request.POST.get('saida_id')
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []
    form_saida = {}
    registro_saida = {}
    embalagem_fechada = {}
    saida_automatica = 0
    entrada_automatica = 0
    quantidade_baixa = 0
    itens_venda = []
    classe = ''
    valor_total = 0
    if saida_id != '0':
        saida = SaidaProdutos.objects.get(id=int(saida_id))
    else:
        saida = None

    if request.method == 'POST':
        if 'saida_automatica' in request.POST and request.POST['saida_automatica']:
            saida_automatica = float(request.POST.get('saida_automatica'))
        if 'entrada_automatica' in request.POST and request.POST['entrada_automatica']:
            entrada_automatica = float(request.POST.get('entrada_automatica'))
        if 'quantidade_baixa' in request.POST and request.POST['quantidade_baixa']:
            quantidade_baixa = float(request.POST.get('quantidade_baixa'))
        if 'form_saida' in request.POST and request.POST['form_saida']:
            form_saida = FormSaidaProdutos(deserialize_form(request.POST.get('form_saida')), instance=saida)

        if form_saida.is_valid():
            registro = form_saida.save(commit=False)
            produto = Produtos.objects.get(id=registro.produto_id)
            estoque_total = float(produto.estoque_atual)
            if produto.id_embalagem_fechada:
                embalagem_fechada = Produtos.objects.get(id=produto.id_embalagem_fechada)
                estoque_total += (embalagem_fechada.estoque_atual * embalagem_fechada.quantidade_embalagem_fechada)

            if estoque_total >= quantidade_baixa:
                estoque_atual = produto.estoque_atual
                novo_estoque = (float(estoque_atual) - quantidade_baixa + entrada_automatica)
                produto.estoque_atual = ("%.3f" % novo_estoque)
                if not saida_id != '0':
                    registro.empresa = usuario.empresa
                    
                    titulo_mensagem = 'REGISTRANDO SAÍDA DE PRODUTOS'
                    mensagem = 'Saída registrada com sucesso!!!'

                else:
                    titulo_mensagem = 'ALTERANDO REGISTRO...'
                    mensagem = 'O registro foi alterado com sucesso!!!'

                if saida_automatica > 0 and entrada_automatica > 0:
                    saida = FormSaidaProdutos({
                        'venda': 2,
                        'produto': produto.id,
                        'quantidade': saida_automatica,
                        'valor_unitario': 0.00,
                        'percentual_desconto': 0.000,
                        'total_desconto': 0.00,
                        'valor_total': 0.00,
                        'observacoes_saida': '''Baixado automaticamente pelo sistema e adicionado ao produto de codigo 
                        ''' + str(produto.id_embalagem_fechada) + '.',
                        'saldo_final': 0.00,
                    })
                    if saida.is_valid():
                        registro_saida = saida.save(commit=False)
                        registro_saida.empresa = usuario.empresa
                        estoque_embalagem_fechada = float(embalagem_fechada.estoque_atual)-saida_automatica
                        embalagem_fechada.estoque_atual = estoque_embalagem_fechada
                    else:
                        sucesso['erro2'] = 1
                        sucesso['mensagem'] = '''Houve um erro na baixa automática do produto.
                        A venda não pode ser concluída. Por favor, tente novamente. Se o problema persistir,
                        entre em contato com o suporte técnico através do e-mail: suporte@atpcsistemas.com.br ...'''
                        sucesso['titulo'] = 'ERRO INTERNO NO SISTEMA...'
                        retorno = json.dumps(sucesso)
                        return HttpResponse(retorno, content_type="application/json")

                if saida_automatica > 0 and entrada_automatica > 0 and saida.is_valid() and form_saida.is_valid():
                    registro.save()
                    produto.save()
                    registro_saida.save()
                    embalagem_fechada.save()
                elif saida_automatica == 0 and entrada_automatica == 0 and form_saida.is_valid():
                    registro.save()
                    produto.save()
                else:
                    sucesso['erro2'] = 1
                    sucesso['mensagem'] = '''Houve um erro interno no sistema, por isto a venda não pode ser concluída.
                    Por favor contate o suporte técnico através do <br> e-mail: suporte@atpcsistemas.com.br...'''
                    sucesso['titulo'] = 'ERRO INTERNO NO SISTEMA...'
                    retorno = json.dumps(sucesso)
                    return HttpResponse(retorno, content_type="application/json")

                sucesso['sucesso'] = 1
                itens = SaidaProdutos.objects.filter(venda=registro.venda)
                for index in itens:
                    classe = ''
                    valor_total += index.saldo_final
                    if index.status == 'CANCELADO':
                        valor_total -= index.saldo_final
                        classe = 'danger'
                    elif index.status == 'ENTREGUE' or index.status == 'SEPARADO':
                        classe = 'success'
                    elif index.status == 'EM SEPARACAO':
                        classe = 'warning'

                    itens_venda += [{
                        'venda': str(index.venda),
                        'id': str(index.id),
                        'produto': str(index.produto),
                        'descricao_simplificada': index.produto.descricao_simplificada,
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
            else:
                titulo_mensagem = 'ESTOQUE INSUFICIENTE...'
                mensagem = 'Não há produto suficiente em estoque...'
                sucesso['alerta'] = 1
            venda = Vendas.objects.get(id=registro.venda.id)
            sucesso['valor_total'] = str(valor_total)
            sucesso['itens'] = itens_venda
            sucesso['cliente'] = str(venda.cliente.nome_razao_social)
            sucesso['id_pedido'] = venda.id
            sucesso['mensagem'] = mensagem
            sucesso['solicitante'] = venda.solicitante
            sucesso['status_pedido'] = venda.status_pedido
            sucesso['data_venda'] = str(venda.data_venda.strftime('%d/%m/%Y'))
            sucesso['data_entrega'] = str(venda.data_entrega.strftime('%d/%m/%Y'))
            sucesso['id'] = registro.id
            sucesso['titulo'] = titulo_mensagem
            retorno = json.dumps(sucesso)

        else:

            for error in form_saida.errors:
                erro += {error}
                erro += {error}

            titulo_mensagem = 'ERRO NA VALIDAÇÃO DOS DADOS...'
            mensagem = 'Por favor, corrija os campos listados em vermelho e tente novamente...'
            retorno = json.dumps({
                'titulo': titulo_mensagem,
                'mensagem': mensagem,
                'erro': erro,
            })
    return HttpResponse(retorno, content_type="application/json")


def busca_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    produto = Produtos.objects.filter(id=0)
    codigo_barras = request.GET.get('codigo_barras') or ''
    id_saida = int(request.GET.get('id_saida') or 0)
    id_produto = int(request.GET.get('id_produto') or 0)
    id_venda = int(request.GET.get('id_venda') or 0)
    saida = {}
    campos = {}
    venda = {}
    tabela_preco = {}
    preco_promocional = 0
    preco_tabelado = 0
    promocao = {}
    observacoes = ''
    if id_saida > 0:
        if not usuario.permissoes.administrador and not usuario.permissoes.administrador_super and not usuario.permissoes.edita_saida_produto:
            retorno['permissao_negada'] = 1
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['mensagem'] = mensagem_permissao_negada()
            return HttpResponse(json.dumps(retorno), content_type="application/json")
        try:
            if usuario.permissoes.edita_saida_produto:
                saida = SaidaProdutos.objects.get(id=id_saida)
                produto = Produtos.objects.get(id=saida.produto.id, empresa=saida.empresa, status='ATIVO')

            if usuario.permissoes.administrador:
                saida = SaidaProdutos.objects.get(id=id_saida, empresa=usuario.empresa)
                produto = Produtos.objects.get(id=saida.produto.id, empresa=saida.empresa, status='ATIVO')

            if usuario.permissoes.administrador_super:
                saida = SaidaProdutos.objects.get(id=id_saida)
                produto = Produtos.objects.get(id=saida.produto.id, empresa=saida.empresa, status='ATIVO')

            form = FormSaidaProdutos(instance=saida)
            for campo in form.fields:
                if campo in form.initial:
                    campos[form.auto_id % campo] = str(form.initial[campo])
        except:
            retorno['erro'] = 1
            retorno['titulo'] = 'PRODUTO NÃO ENCONTRADO...'
            retorno['mensagem'] = '''Não pudemos acessar o registro deste produto,
                    certamente ele não está mais ativo...''' + traceback.format_exc()
            return HttpResponse(json.dumps(retorno), content_type="application/json")

    elif id_produto > 0:
        try:
            produto = Produtos.objects.get(id=id_produto, empresa=usuario.empresa, status='ATIVO')
        except:
            retorno['alerta'] = 1
            retorno['titulo'] = 'PRODUTO NÃO CADASTRADO...'
            retorno['mensagem'] = '''Não encontramos registros deste produto em nosso sistema,
                                se já o cadastrou, verifique se seu státus está ativo, se não, cadastre-o...'''
            return HttpResponse(json.dumps(retorno), content_type="application/json")

    elif codigo_barras != '':
        try:
            produto = Produtos.objects.get(codigo_barras=codigo_barras, empresa=usuario.empresa, status='ATIVO')
        except:
            retorno['alerta'] = 1
            retorno['titulo'] = 'PRODUTO NÃO CADASTRADO...'
            retorno['mensagem'] = '''Não encontramos registros deste produto em nosso sistema,
                                se já o cadastrou, verifique se seu státus está ativo, se não, cadastre-o...'''
            return HttpResponse(json.dumps(retorno), content_type="application/json")

    if produto:
        if id_venda > 0:
            venda = Vendas.objects.get(id=id_venda)
            tabela_preco = TabelaPrecos.objects.filter(produto=produto, cliente=venda.cliente, status_preco='ATIVO')
            promocao = PrecosPomocionais.objects.filter(produto_promocao=produto, status_promocao='ATIVO')
        if tabela_preco:
            tabela_preco = TabelaPrecos.objects.get(produto=produto, cliente=venda.cliente, status_preco='ATIVO')
            percentual = float(tabela_preco.percentual)
            preco_venda = tabela_preco.preco_venda
            desconto_maximo = 0
            preco_tabelado = 1
            observacoes = 'Produto vendido conforme tabela de preços do cliente.'
        else:
            percentual = produto.percentual_lucro
            preco_venda = produto.preco_venda
            desconto_maximo = produto.desconto_maximo
        if promocao:
            promocao = PrecosPomocionais.objects.get(produto_promocao=produto, status_promocao='ATIVO')
            if promocao.preco_venda_promocao < preco_venda and promocao.fim_promocao.toordinal() >= datetime.now().toordinal():
                percentual = 0
                preco_venda = produto.preco_venda
                desconto_maximo = promocao.percentual_desconto
                preco_promocional = 1
                observacoes = 'Foi aplicado desconto de: '+str(promocao.percentual_desconto)+'%, referente a promoção vigente.'
        retorno['sucesso'] = 1
        titulo = 'BUSCANADO PRODUTO...'
        mensagem = 'Busca efetuada com sucesso!!!'
        retorno['id'] = produto.id
        retorno['estoque_atual'] = produto.estoque_atual
        retorno['status'] = produto.status
        retorno['codigo_barras'] = produto.codigo_barras
        retorno['preco_venda'] = str(preco_venda)
        retorno['valor_compra'] = str(produto.valor_compra)
        retorno['estoque_atual'] = str(produto.estoque_atual)
        retorno['descricao_simplificada'] = produto.descricao_simplificada
        retorno['unidade_medida'] = produto.unidade_medida
        retorno['categoria'] = str(produto.categoria_produto)
        retorno['estoque_minimo'] = str(produto.estoque_minimo)
        retorno['estoque_maximo'] = str(produto.estoque_maximo)
        retorno['fracionar_produto'] = produto.fracionar_produto
        retorno['id_embalagem_fechada'] = str(produto.id_embalagem_fechada)
        retorno['percentual_lucro'] = str(percentual)
        retorno['desconto_maximo'] = str(desconto_maximo)
        retorno['atacado_apartir'] = str(produto.atacado_apartir)
        retorno['atacado_desconto'] = str(produto.atacado_desconto)
        retorno['empresa'] = str(produto.empresa)
        retorno['status'] = produto.status
        retorno['mensagem'] = mensagem
        retorno['titulo'] = titulo
        retorno['quantidade_embalagem_fechada'] = 0
        retorno['estoque_embalagem_fechada'] = 0
        retorno['campos'] = campos
        retorno['id_saida'] = id_saida
        retorno['preco_tabelado'] = preco_tabelado
        retorno['preco_promocional'] = preco_promocional
        retorno['observacoes'] = observacoes
        if produto.id_embalagem_fechada > 0:
            try:
                embalagem_fechada = Produtos.objects.get(pk=produto.id_embalagem_fechada, empresa=usuario.empresa)
                retorno['quantidade_embalagem_fechada'] = str(embalagem_fechada.quantidade_embalagem_fechada)
                retorno['estoque_embalagem_fechada'] = str(embalagem_fechada.estoque_atual)
            except:
                retorno['erro'] = 1
                retorno['titulo'] = 'PRODUTO CADASTRADO INCORRETAMENTE'
                retorno['mensagem'] = '''Há um erro no cadasto deste produto,
                        o mesmo deverá ser corrigido imediatamente. É impossível efetuar a venda,
                        ou mesmo alterações de vendas já realizadas...'''
                return HttpResponse(json.dumps(retorno), content_type="application/json")

    else:
        retorno['alerta'] = 1
        retorno['titulo'] = 'PRODUTO NÃO CADASTRADO...'
        retorno['mensagem'] = '''Não encontramos registros deste produto em nosso sistema,
                            se já o cadastrou, verifique se seu státus está ativo, se não, cadastre-o...'''

    return HttpResponse(json.dumps(retorno), content_type="application/json")


def muda_status_item(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    mensagem = ''
    titulo = ''
    sucesso = 0
    erro = 0
    status = ''
    titulo = 'ALTERANDO STÁTUS DOS ÍTENS DO PEDIDO...'
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.muda_status_saida_produto:
        if request.method == 'POST':
            item = SaidaProdutos.objects.get(pk=int(QueryDict(request.body).get('id_item')))
            status = item.status
            if item.status != 'CANCELADO':
                if status == 'EM SEPARACAO' or status == 'SEPARADO':
                    if status == 'EM SEPARACAO':
                        mensagem = 'Este ítem foi marcado como separado...'
                        status = 'SEPARADO'
                    elif status == 'SEPARADO':
                        mensagem = 'Este ítem foi posto novamente em separação...'
                        status = 'EM SEPARACAO'
                    else:
                        mensagem = 'Este ítem foi marcado como separado...'
                        status = 'SEPARADO'
                    try:
                        item.status = status
                        item.save()
                        sucesso = 1
                    except:
                        erro = 1
                        sucesso = 0
                        mensagem = 'Houve um erro inesperado na tentativa de mudar o státus do ítem...<br>Por favor, tente novamente...'
                elif status == 'ENTREGUE':
                    mensagem = 'Não é possível alterar o státus deste ítem pois ele pertence um pedido já entregue...'
                    titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...'
                    erro = 1
                elif status == 'AGUARDANDO':
                    mensagem = 'Não é possível alterar o státus deste ítem pois ele pertence a venda ainda nao finalizada...'
                    titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...'
                    erro = 1
            else:
                mensagem = 'Não é possível alterar o státus deste ítem pois ele pertence a venda "CANCELADA"...'
                titulo = 'AÇÃO INTERROMPIDA PELO SISTEMA...'
                erro = 1
    else:
        mensagem = mensagem_permissao_negada()
        titulo = titulo_mensagem_permissao_negada()
        erro = 1

    retorno['sucesso'] = sucesso
    retorno['erro'] = erro
    retorno['mensagem'] = mensagem
    retorno['titulo'] = titulo
    retorno['status'] = status
    return HttpResponse(
            json.dumps(retorno), content_type="application/json")


def cancelar_saida_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    mensagem = ''
    titulo = ''
    sucesso = 0
    erro = 0
    info = 0
    titulo = 'CANCELANDO ÌTEM...'
    valor_total = 0
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.edita_saida_produto:
        if request.method == 'POST':
            saida = SaidaProdutos.objects.filter(pk=int(QueryDict(request.body).get('id_saida')))
            if saida:
                saida = SaidaProdutos.objects.get(pk=int(QueryDict(request.body).get('id_saida')))
                produto = Produtos.objects.get(id=saida.produto.id)
                if saida.venda.status_pedido == 'EM ANDAMENTO':
                    if saida.status != 'CANCELADO':
                        saida.status = 'CANCELADO'
                        produto.estoque_atual += saida.quantidade
                        saida.save()
                        produto.save()
                        mensagem = 'Ìtem cancelado com sucesso!!!'
                        sucesso = 1
                        itens = SaidaProdutos.objects.filter(venda=saida.venda.id)
                        for item in itens:
                            valor_total += item.saldo_final
                            if item.status == 'CANCELADO':
                                valor_total -= item.saldo_final

                        retorno['status'] = 'CANCELADO'
                        retorno['id_pedido'] = str(saida.venda.id)
                        retorno['cliente'] = str(saida.venda.cliente.nome_razao_social)
                        retorno['valor_total'] = str(valor_total)

                    elif saida.status == 'CANCELADO':
                        mensagem = '''Este ítem já encontra-se cancelado...'''
                        info = 1
                else:
                    mensagem = '''Este ítem não pode ser cancelado, pois o mesmo faz parte de uma venda já finalizada...'''
                    erro = 1
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
def imprimir_pedido(request, id_venda=None, cupom=None):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    data = datetime.now()
    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
        retorno['deslogar_usuario'] = 1
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    venda = Vendas.objects.get(id=id_venda)
    itens = SaidaProdutos.objects.filter(
        venda=id_venda, status='SEPARADO') | SaidaProdutos.objects.filter(
        venda=id_venda, status='AGUARDANDO') | SaidaProdutos.objects.filter(
        venda=id_venda, status='EM SEPARACAO')

    if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:
        permissoes = 0
        if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.imprime_cupom_venda:
            permissoes = 1
        if permissoes == 0:
            retorno['mensagem'] = mensagem_permissao_negada()
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
        elif permissoes == 1 and not itens:
            retorno['mensagem'] = 'Não é possível imprimir o pedido, pois não foi vendido nenhum ítem...'
            retorno['titulo'] = 'NENHUM ÍTEM VENDIDO...'
            retorno['info'] = 1
        elif permissoes == 1 and itens:
            retorno['permissoes'] = permissoes
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    else:
        if 'vias' in request.GET and request.GET['vias']:
            vias = request.GET['vias']

        valor_total = 0
        desconto = 0.0
        saldo_final = 0
        valor_total_sem_desconto = 0
        data = datetime.now()
        for item in itens:

            item.valor_unitario = '%0.02f' % item.valor_unitario
            item.valor_unitario = moeda(item.valor_unitario)
            item.produto.descricao_simplificada = item.produto.descricao_simplificada[:32]
            valor_total += float(item.saldo_final) + float(item.saldo_final)
            valor_total_sem_desconto += float(item.saldo_final) + float(item.total_desconto)
            desconto += float(item.total_desconto)
            item.saldo_final = moeda(item.saldo_final + item.total_desconto)
            item.total_desconto = moeda(item.total_desconto)

        desconto = '%0.02f' % desconto
        valor_total_sem_desconto = '%0.02f' % valor_total_sem_desconto
        valor_total = moeda(valor_total)
        desconto = moeda(desconto)
        valor_total_sem_desconto = moeda(valor_total_sem_desconto)
        saldo_final = moeda(venda.saldo_final)

        venda.cliente.nome_razao_social = venda.cliente.nome_razao_social[:32]
        venda.empresa.nome_fantasia = venda.empresa.nome_fantasia[:32]
        if venda.pagamento:
            venda.pagamento.meio_de_pagamento = venda.pagamento.meio_de_pagamento.lower()
        if cupom:
            return render(request, 'vendas/cupom_nao_fiscal.html', locals(),)
        else:
            titulo = 'Imprimir Cupom não Fiscal'
        return render(request, 'vendas/pedido_a4.html', locals(),)


def imprimir_pedido_pdf(request, id_venda):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    pedido = Vendas.objects.get(id=id_venda)
    itens = SaidaProdutos.objects.filter(venda=pedido)

    # Create the HttpResponse object with the appropriate PDF headers.
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = 'inline; filename="WebVendasPedido_000{}.pdf"'.format(pedido.pk)
    buffer = BytesIO()
    canv = canvas.Canvas(buffer)
    canv.setTitle('Impressão de pedido de venda - 000{}'.format(pedido.pk))
    # define a large font
    canv.setFont("Helvetica", 8)

    col = 18
    lin = 800

    # localiza a agenda
    i = lin
    pg = 1
    i = 0
    total_desconto = 0

    # logo da empresa
    x = pedido.empresa.nome_fantasia if pedido.empresa.nome_fantasia else pedido.empresa.razao_social
    x = x.split(' ')
    filename = '/static/img/logo.jpg'
    try:
        logo = ImageReader(filename)
        canv.drawImage(logo, 10, 730, mask='auto')
    except:
        pass

    canv.setFont("Helvetica", 7)
    canv.drawRightString(580, 820, datetime.today().strftime('%d/%m/%Y %H:%M'))

    canv.setFont("Helvetica", 16)

    canv.drawString(110, lin - i, pedido.empresa.razao_social)
    canv.setFont("Helvetica", 8)
    canv.setAuthor('ATPC-Sistemas')

    i += 10

    c = '{} {} {} {}'.format(
        if_null(pedido.empresa.endereco, ' - '),
        if_null(pedido.empresa.numero, ''),
        if_null(pedido.empresa.bairro, '.'),
        if_null(pedido.empresa.cidade, '.'),
        if_null(pedido.empresa.uf, ''))

    canv.drawString(110, lin - i, c)
    i += 10

    canv.setFont("Helvetica", 6)
    i += 30

    canv.setFillColorRGB(0.7, 0.7, 0.7)
    canv.rect(13, lin - i - 5, 568, 20, fill=1)
    canv.setFillColorRGB(0, 0, 0)
    canv.setFont("Helvetica", 11)
    canv.drawString(15, lin - i, 'PEDIDO DE VENDA: 000{}'.format(pedido.pk))

    i += 20

    canv.setFillColorRGB(0, 0, 0)
    canv.setFont("Helvetica", 8)
    canv.drawString(15, lin - i, 'Cliente: {}'.format(pedido.cliente.nome_razao_social))
    i += 10
    canv.drawString(15, lin - i, 'CPF/CNPJ: {} RG/I.Est.: {}  Insc.Mun.: {} Telefone: {}'.format(
        pedido.cliente.cpf_cnpj,
        pedido.cliente.rg_inscricao_estadual,
        pedido.cliente.inscricao_municipal,
        pedido.cliente.telefone
    ))
    i += 10
    canv.drawString(15, lin - i, 'Email: {}'.format(pedido.cliente.email))
    i += 10
    canv.drawString(15, lin - i, 'Endereco: {},{}  Bairro: {} Cidade: {} UF: {}'.format(
        pedido.cliente.endereco,
        pedido.cliente.numero,
        pedido.cliente.bairro,
        pedido.cliente.cidade,
        pedido.cliente.estado
    ))
    canv.line(15, lin - 2 - i, 580, lin - 2 - i)
    i += 15
    canv.drawString(17, lin - i, pedido.observacoes)

    i = 750
    pag = 0
    for item in itens:
        if item.status != 'CANCELADO':
            if i >= 750:
                if pag > 0:
                    canv.showPage()
                    pag += 1

                i = 140
                canv.setFont("Helvetica", 8)
                canv.setFillColorRGB(0.7, 0.7, 0.7)
                canv.rect(13, lin - i - 5, 568, 20, fill=1)
                canv.setFillColorRGB(0, 0, 0)
                canv.drawString(17, lin - i, 'CÓDIGO')
                canv.drawString(90, lin - i, 'DESCRIÇÃO DO PRODUTO')
                canv.drawString(380, lin - i, 'UN')
                canv.drawRightString(430, lin - i, 'VL UN')
                canv.drawRightString(470, lin - i, 'QDE')
                canv.drawRightString(520, lin - i, 'DESC')
                canv.drawRightString(570, lin - i, 'TOTAL')
                i += 3
                canv.line(15, lin - 2 - i, 580, lin - 2 - i)
                i += 20

            canv.setFillColorRGB(0, 0, 0)
            canv.setFont("Helvetica", 7)
            canv.drawString(17, lin - i, item.produto.codigo_barras)
            canv.drawString(90, lin - i, item.produto.descricao_simplificada)
            canv.drawString(380, lin - i, if_null(item.produto.unidade_medida, 'UN'))
            canv.drawRightString(430, lin - i, moeda(item.valor_unitario))
            canv.drawRightString(470, lin - i, moeda(item.quantidade))
            canv.drawRightString(520, lin - i, moeda(item.total_desconto))
            canv.drawRightString(570, lin - i, moeda(item.saldo_final))

            canv.line(13, lin - 5 - i, 580, lin - 5 - i)

            i += 15

            total_desconto += item.total_desconto

    canv.line(13, 140, 580, 140)
    canv.setFont("Helvetica", 10)

    canv.drawString(15, 120, 'Valor total bruto do pedido:')
    canv.drawRightString(230, 120, 'R$ {}'.format(moeda(total_desconto + pedido.saldo_final)))

    canv.drawString(15, 100, 'Valor total dos descontos:')
    canv.drawRightString(230, 100, 'R$ {}'.format(moeda(total_desconto)))

    canv.drawString(15, 80, 'Valor total a pagar:')
    canv.drawRightString(230, 80, 'R$ {}'.format(moeda(pedido.saldo_final)))

    canv.setFont("Helvetica", 8)
    canv.drawString(15, 60, 'Declaro para os devidos fins que: Recebi de {}, {}'.format(pedido.empresa.nome_fantasia, 'os produtos acima informados.'))
    canv.drawString(15, 40, 'Data: _____/_____/{}'.format(datetime.today().strftime('%Y')))
    canv.drawString(110, 40, 'Ass: ___________________________________________________________')
    canv.drawString(400, 40, 'RG/CPF: _________________________________')
    # canv.line(13, 40, 540, 40)
    # Close the PDF object cleanly, and we're done.
    canv.setFont("Helvetica", 6)
    canv.rect(15, 22, 565, 10, fill=0)
    canv.drawCentredString(285, 25, '*** Web Vendas, © ATPC-Sistemas  (2012 - {}) ***  Sao Paulo - SP - Brasil Site: www.atpcsistemas.com.br E-mail: atpcsistema@gmail.com'.format(datetime.today().strftime('%Y')))
    canv.showPage()
    canv.save()
    pdf = buffer.getvalue()
    buffer.close()
    response.write(pdf)
    pdf_name = '{}.pdf'.format(pedido.pk)

    return response
