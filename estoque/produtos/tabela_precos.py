# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from cadastros.usuarios.models import Usuarios
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, HttpResponseRedirect
from .models import TabelaPrecos
from .forms import FormTabelaPrecos
import traceback
from django.http import HttpResponse, QueryDict
import json
from functions.views import deserialize_form
from cadastros.clientes.models import Clientes
from estoque.produtos.models import Produtos
from functions.views import mensagem_permissao_negada, titulo_mensagem_permissao_negada
from reportlab.pdfgen import canvas
from datetime import datetime
from cadastros.empresas.models import Empresas
from vendas.models import Vendas

@login_required
def tabela_precos(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO':
        return HttpResponseRedirect('/logout/')
    try:
        sub_titulo = 'Tabela de preços'
        form = FormTabelaPrecos()
        if not usuario.permissoes.administrador_super:
            form.fields['cliente'].queryset = Clientes.objects.filter(empresa=usuario.empresa, status='ATIVO')
            form.fields['produto'].queryset = Produtos.objects.filter(empresa=usuario.empresa, status='ATIVO')
    except:
        trace = traceback.format_exc()
        erro = 1
        if request.user.is_superuser:
            mensagem = 'Houve um erro interno no sistema. ' + trace
        else:
            mensagem = ''

    return render(request, "tabela_precos/tabela_precos.html", locals(),)


@login_required
def tabelar_preco(request):
    preco_id = int(request.POST.get('id') or 0)
    usuario = Usuarios.objects.get(usuario=request.user)
    retorno = {}
    sucesso = {}
    erro = []

    if preco_id > 0:
        preco = TabelaPrecos.objects.get(id=preco_id)
    else:
        preco = None

    if request.method == 'POST':
        form = FormTabelaPrecos(deserialize_form(request.POST.get('form')), instance=preco)

        if form.is_valid():
            registro = form.save(commit=False)
            if preco_id < 1:
                produto_tabela = TabelaPrecos.objects.filter(produto=registro.produto, cliente=registro.cliente)
                if produto_tabela:
                    retorno = json.dumps({
                        'titulo': 'AÇÃO REJEITADA PELO SISTEMA...',
                        'mensagem': 'Este produto já consta na tabela deste cliente',
                        'erro': erro,
                    })
                    return HttpResponse(retorno, content_type="application/json")
                else:
                    registro.empresa = usuario.empresa
                    registro.usuario = request.user
                    titulo_mensagem = 'TABELANDO PREÇO...'
                    mensagem = 'Preço tabelado com sucesso!!!'
            else:
                titulo_mensagem = 'ALTERANDO PREÇO . . .'
                mensagem = 'O preço foi alterado com sucesso!!!'

            registro.save()

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


@login_required
def buscar_preco_tabelado(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    id = int(request.GET.get('id') or 0)
    preco = {}
    retorno = {}
    if not usuario.permissoes.administrador_super and not usuario.permissoes.administrador and not usuario.permissoes.edita_tabela_de_precos:
        retorno = json.dumps({
            'titulo': titulo_mensagem_permissao_negada(),
            'mensagem': mensagem_permissao_negada(),
            'permissao_negada': 1,
        })
    else:
        precos = TabelaPrecos.objects.filter(id=id)
        if precos:
            preco = TabelaPrecos.objects.get(id=id)
        if not preco:
            retorno = json.dumps({
                'titulo': 'REGISTRO NÃO ENCONTRADO...',
                'mensagem': 'O sistema não identificou nenhum registro de preço tabelado com este ID.',
                'alerta': 1,
            })
        elif preco.empresa != usuario.empresa and usuario.permissoes.administrador_super:
            retorno = json.dumps({
                'titulo': 'AÇÃO INTERROMPIDA PELO SISTEMA...',
                'mensagem': '''Por questão de segurança, para realizar alterações neste registro, é necessário que você
                esteja logado como usuário da empresa <strong>'''+str(preco.empresa).upper()+'</strong>...',
                'alerta': 1,
            })
        else:
                form = FormTabelaPrecos(instance=preco)
                titulo = 'BUSCANADO REGISTROS...'
                mensagem = 'Busca efetuada com sucesso!!!'
                campos = {}

                for campo in form.fields:
                    if campo in form.initial:
                        campos[form.auto_id % campo] = str(form.initial[campo])

                retorno = json.dumps({
                    'id': id,
                    'titulo': titulo,
                    'mensagem': mensagem,
                    'campos': campos,
                    'sucesso': 1,
                })
    return HttpResponse(retorno, content_type='application/json')


@login_required
def buscar_precos_tabelados(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    tb_precos = {}
    mensagem = ''
    precos = []
    id_produto = 0
    id_cliente = 0
    id_venda =0
    codigo_barras = ''
    produto = {}
    if 'codigo_barras' in request.GET and request.GET['codigo_barras']:
        codigo_barras = request.GET.get('codigo_barras')
        if codigo_barras != '':
            produto =Produtos.objects.filter(empresa=usuario.empresa.id, codigo_barras=codigo_barras)
            if produto:
                produto = Produtos.objects.get(empresa=usuario.empresa.id, codigo_barras=codigo_barras)
                tb_precos = TabelaPrecos.objects.filter(empresa=usuario.empresa, produto=produto)
                if usuario.permissoes.administrador_super:
                    tb_precos = TabelaPrecos.objects.filter(produto=produto)

    if 'id_produto' in request.GET and request.GET['id_produto']:
        id_produto = int(request.GET.get('id_produto') or 0)
        if id_produto > 0 and id_cliente < 1:
            tb_precos = TabelaPrecos.objects.filter(empresa=usuario.empresa, produto=id_produto)
            if usuario.permissoes.administrador_super:
                tb_precos = TabelaPrecos.objects.filter(produto=id_produto)

    if 'id_cliente' in request.GET and request.GET['id_cliente']:
        id_cliente = int(request.GET.get('id_cliente') or 0)
        if id_cliente > 0 and id_produto < 1:
            tb_precos = TabelaPrecos.objects.filter(empresa=usuario.empresa, cliente=id_cliente)
            if usuario.permissoes.administrador_super:
                tb_precos = TabelaPrecos.objects.filter(cliente=id_cliente)

    if 'id_venda' in request.GET and request.GET['id_venda']:
        id_venda = int(request.GET.get('id_venda') or 0)
        if id_venda > 0:
            venda = Vendas.objects.filter(empresa=usuario.empresa, id=id_venda)
            if venda:
                venda = Vendas.objects.get(id=id_venda)
                tb_precos = TabelaPrecos.objects.filter(cliente=venda.cliente.id)

    if id_produto == 0 and id_cliente == 0 and codigo_barras == '' and id_venda == 0:
        tb_precos = TabelaPrecos.objects.filter(empresa=usuario.empresa)
        if usuario.permissoes.administrador_super:
            tb_precos = TabelaPrecos.objects.all()
    elif id_produto > 0 and id_cliente > 0:
        tb_precos = TabelaPrecos.objects.filter(empresa=usuario.empresa, cliente=id_cliente, produto=id_produto)
        if usuario.permissoes.administrador_super:
            tb_precos = TabelaPrecos.objects.filter(cliente=id_cliente, produto=id_produto)
    elif id_produto < 1 and id_cliente > 0 and codigo_barras != '':
        tb_precos = TabelaPrecos.objects.filter(empresa=usuario.empresa, cliente=id_cliente, produto=produto)
        if usuario.permissoes.administrador_super:
            tb_precos = TabelaPrecos.objects.filter(cliente=id_cliente, produto=produto)

    for index in tb_precos:
        precos += [{
            'id_produto': str(index.produto.id),
            'id': str(index.id),
            'cliente': str(index.cliente),
            'produto': str(index.produto),
            'descricao_simplificada': str(index.produto.descricao_simplificada),
            'percentual': str(index.percentual),
            'preco_venda': str(index.preco_venda),
            'empresa': str(index.empresa),
            'status_preco': index.status_preco,
            'observacoes_preco': str(index.observacoes_preco),
            'mensagem': mensagem,
            'titulo': '',
            'classe': 'success',
            'sucesso': 1,
        }]
    retorno = json.dumps(precos)
    return HttpResponse(retorno, content_type='application/json')


@login_required
def muda_status_preco_tabelado(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.muda_status_preco_tabelado:
        if request.method == 'POST':
            registro = TabelaPrecos.objects.filter(id=int(QueryDict(request.body).get('registro_id')))
            if registro:
                registro = TabelaPrecos.objects.get(id=int(QueryDict(request.body).get('registro_id')))
                status = registro.status_preco
                if registro.status_preco == 'ATIVO':
                    registro.status_preco = 'INATIVO'
                elif registro.status_preco == 'INATIVO':
                    registro.status_preco = 'ATIVO'

                registro.save()
                if registro.status_preco != status:
                    mensagem = 'Státus alterado com sucesso!!!'
                else:
                    mensagem = '''Verifique se o státus foi realmente alterado,
                                  pois há uma suspeita, de que isto não ocorreu...'''
                retorno['mensagem'] = mensagem
                retorno['titulo'] = 'ALTERANDO STÁTUS DE PREÇO...'
                retorno['status_preco'] = registro.status_preco
                retorno['sucesso'] = 1
            else:
                retorno['mensagem'] = '''Não foi possível identificar o registro para efetuar a alteração.
                                         Por favor, tente novamente...'''
                retorno['titulo'] = 'OPERAÇÃO NÃO REALIZADA...'
                retorno['erro'] = 1
    else:
        retorno['mensagem'] = mensagem_permissao_negada()
        retorno['titulo'] = titulo_mensagem_permissao_negada()
        retorno['erro'] = 1
    return HttpResponse(
            json.dumps(retorno), content_type="application/json")


@login_required
def excluir_preco_tabelado(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.exclui_preco_tabelado:
        if request.method == 'DELETE':
            registro = TabelaPrecos.objects.get(id=int(QueryDict(request.body).get('registro_id')))

            registro.delete()

            retorno['mensagem'] = 'Registro excluído com sucesso!!!'
            retorno['titulo'] = 'EXCLUINDO PREÇO TABELADO...'
            retorno['sucesso'] = 1
    else:
        retorno['mensagem'] = mensagem_permissao_negada()
        retorno['titulo'] = titulo_mensagem_permissao_negada()
        retorno['erro'] = 1
    return HttpResponse(
            json.dumps(retorno), content_type="application/json")


@login_required
def busca_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    produto = Produtos.objects.filter(id=0)
    id_produto = int(request.GET.get('id_produto') or 0)
    codigo_barras = request.GET.get('codigo_barras')
    campos = {}
    if id_produto > 0 and codigo_barras == '':
        registro = Produtos.objects.filter(id=id_produto, status='ATIVO')
        if registro:
            produto = Produtos.objects.get(id=id_produto)
    elif id_produto < 1 and codigo_barras != '':
        registro = Produtos.objects.filter(codigo_barras=codigo_barras, empresa=usuario.empresa, status='ATIVO')
        if registro:
            produto = Produtos.objects.get(codigo_barras=codigo_barras, empresa=usuario.empresa, status='ATIVO')
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
        retorno['percentual_lucro'] = str(produto.percentual_lucro)
        retorno['desconto_maximo'] = str(produto.desconto_maximo)
        retorno['atacado_apartir'] = str(produto.atacado_apartir)
        retorno['atacado_desconto'] = str(produto.atacado_desconto)
        retorno['empresa'] = str(produto.empresa)
        retorno['status'] = produto.status
        retorno['mensagem'] = mensagem
        retorno['titulo'] = titulo
        retorno['quantidade_embalagem_fechada'] = 0
        retorno['estoque_embalagem_fechada'] = 0
        retorno['campos'] = campos
    else:
        retorno['alerta'] = 1
        retorno['titulo'] = 'PRODUTO REMOVIDO OU DESATIVADO...'
        retorno['mensagem'] = '''Não encontramos registros deste produto em nosso sistema,
                            verifique se seu státus está ativo, ou talvez o mesmo tenha sido removido...'''
    return HttpResponse(json.dumps(retorno), content_type="application/json")


@login_required
def tabela_precos_cliente(request, id_cliente=None):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    permissoes = 0
    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
        return HttpResponseRedirect('/logout/')

    cliente = Clientes.objects.get(id=id_cliente)
    tabela = TabelaPrecos.objects.filter(cliente=id_cliente, empresa=usuario.empresa)
    if usuario.permissoes.administrador_super:
        tabela = TabelaPrecos.objects.filter(cliente=id_cliente)

    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.acessa_tabela_de_precos:
        permissoes = 1

    if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:
        if permissoes == 0:
            retorno['mensagem'] = mensagem_permissao_negada()
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
        elif permissoes == 1 and not tabela:
            retorno['mensagem'] = 'Não há produtos tabelados para este cliente...'
            retorno['titulo'] = 'NENHUM REGISTRO ENCONTRADO...'
            retorno['info'] = 1
        elif permissoes and tabela:
            retorno['permissoes'] = permissoes
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    if tabela and permissoes:

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="tabela_de_precos'+cliente.cpf_cnpj+'.pdf"'

        documento = canvas.Canvas(response)

        empresa = Empresas.objects.get(id=cliente.empresa.id)

        linha = 0
        cont = 0
        for index in tabela:

            if cont == 0:
                linha = 820
                documento.setFont("Helvetica", 12)
                documento.drawString(20, linha, 'Fornecedor: ' + empresa.nome_fantasia.upper())
                linha -= 20
                documento.setFont("Helvetica", 12)
                documento.drawString(20, linha, 'Cliente: ' + cliente.nome_razao_social.upper())
                documento.setFont("Helvetica", 10)
                linha -= 20
                data = datetime.now()
                vencimento = datetime.fromordinal(data.toordinal() + 10).strftime('%d/%m/%Y')
                documento.drawString(20, linha,
                                     'Tabela válida até ' + vencimento + ' ,ou, enquanto durarem os nossos estoques.')
                linha = 760
                documento.setFont("Helvetica", 10)
                documento.drawString(20, linha-2, 'CÓDIGO BARRAS')
                documento.drawString(150, linha-2, 'DESCRIÇÃO DO PRODUTO')
                documento.drawString(400, linha-2, 'PREÇO')
                documento.line(15, linha-4, 580, linha-4)
                linha -= 15

            documento.setFont("Helvetica", 8)
            documento.drawString(20, linha, str(index.produto.codigo_barras))
            documento.drawString(150, linha, str(index.produto.descricao_simplificada + ' (' + index.produto.unidade_medida + ')').upper())
            documento.drawString(400, linha, 'R$ ' + str(index.preco_venda))
            documento.line(15, linha-4, 580, linha-4)
            linha -= 15
            cont += 1

            if cont == 50:
                documento.showPage()
                cont = 0

        documento.showPage()
        documento.save()
        return response
    elif not permissoes:
        return HttpResponseRedirect('/logout/')


@login_required
def tabela_precos_produto(request, id_produto=None):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    permissoes = 0
    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
        return HttpResponseRedirect('/logout/')

    produto = Produtos.objects.get(id=id_produto)
    tabela = TabelaPrecos.objects.filter(produto=id_produto, empresa=usuario.empresa).order_by('-preco_venda')
    if usuario.permissoes.administrador_super:
        tabela = TabelaPrecos.objects.filter(produto=id_produto).order_by('preco_venda')

    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.acessa_tabela_de_precos:
        permissoes = 1

    if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:

        if permissoes == 0:
            retorno['mensagem'] = mensagem_permissao_negada()
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
        elif permissoes == 1 and not tabela:
            retorno['mensagem'] = 'Este produto não consta na tabela de preços de nenhum cliente...'
            retorno['titulo'] = 'NENHUM REGISTRO ENCONTRADO...'
            retorno['info'] = 1
        elif permissoes and tabela:
            retorno['permissoes'] = permissoes
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    if tabela and permissoes:

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="tabela_de_precos.pdf"'

        documento = canvas.Canvas(response)

        empresa = Empresas.objects.get(id=produto.empresa.id)

        linha = 0
        cont = 0
        for index in tabela:

            if cont == 0:
                linha = 820
                documento.setFont("Helvetica", 12)
                documento.drawString(20, linha, 'Fornecedor: ' + empresa.nome_fantasia.upper())
                linha -= 20
                data = datetime.now()
                vencimento = datetime.fromordinal(data.toordinal() + 10).strftime('%d/%m/%Y')
                documento.drawString(20, linha,
                                     'Tabela válida até ' + vencimento + ' ,ou, enquanto durarem os nossos estoques.')
                linha = 780
                documento.setFont("Helvetica", 10)
                documento.drawString(20, linha-2, 'CÓDIGO DE BARRAS')
                documento.drawString(130, linha-2, 'DESCRIÇÃO DO PRODUTO')
                documento.drawString(330, linha-2, 'PREÇO')
                documento.drawString(380, linha - 2, 'CLIENTE')
                documento.line(15, linha-4, 580, linha-4)
                linha -= 15

            documento.setFont("Helvetica", 8)
            documento.drawString(20, linha, str(index.produto.codigo_barras))
            documento.drawString(130, linha, str(index.produto.descricao_simplificada + ' (' + index.produto.unidade_medida + ')').upper())
            documento.drawString(330, linha, 'R$ ' + str(index.preco_venda))
            documento.drawString(380, linha, str(index.cliente.nome_razao_social))
            documento.line(15, linha-4, 580, linha-4)
            linha -= 15
            cont += 1

            if cont == 50:
                documento.showPage()
                cont = 0

        documento.showPage()
        documento.save()
        return response
    elif not permissoes:
        return HttpResponseRedirect('/logout/')

    @login_required
    def tabela_precos_produto(request, id_produto=None):
        usuario = Usuarios.objects.get(usuario=request.user.id)
        retorno = {}
        permissoes = 0
        if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
            return HttpResponseRedirect('/logout/')

        produto = Produtos.objects.get(id=id_produto)
        tabela = TabelaPrecos.objects.filter(produto=id_produto, empresa=usuario.empresa).order_by('-preco_venda')
        if usuario.permissoes.administrador_super:
            tabela = TabelaPrecos.objects.filter(produto=id_produto).order_by('preco_venda')

        if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.acessa_tabela_de_precos:
            permissoes = 1

        if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:

            if permissoes == 0:
                retorno['mensagem'] = mensagem_permissao_negada()
                retorno['titulo'] = titulo_mensagem_permissao_negada()
                retorno['erro'] = 1
            elif permissoes == 1 and not tabela:
                retorno['mensagem'] = 'Este produto não consta na tabela de preços de nenhum cliente...'
                retorno['titulo'] = 'NENHUM REGISTRO ENCONTRADO...'
                retorno['info'] = 1
            elif permissoes and tabela:
                retorno['permissoes'] = permissoes
            return HttpResponse(json.dumps(retorno), content_type="application/json")

        if tabela and permissoes:

            response = HttpResponse(content_type='application/pdf')
            response['Content-Disposition'] = 'inline; filename="tabela_de_precos.pdf"'

            documento = canvas.Canvas(response)

            empresa = Empresas.objects.get(id=produto.empresa.id)

            linha = 0
            cont = 0
            for index in tabela:

                if cont == 0:
                    linha = 820
                    documento.setFont("Helvetica", 12)
                    documento.drawString(20, linha, 'Fornecedor: ' + empresa.nome_fantasia.upper())
                    linha -= 20
                    data = datetime.now()
                    vencimento = datetime.fromordinal(data.toordinal() + 10).strftime('%d/%m/%Y')
                    documento.drawString(20, linha,
                                         'Tabela válida até ' + vencimento + ' ,ou, enquanto durarem os nossos estoques.')
                    linha = 780
                    documento.setFont("Helvetica", 10)
                    documento.drawString(20, linha - 2, 'CÓDIGO DE BARRAS')
                    documento.drawString(130, linha - 2, 'DESCRIÇÃO DO PRODUTO')
                    documento.drawString(330, linha - 2, 'PREÇO')
                    documento.drawString(380, linha - 2, 'CLIENTE')
                    documento.line(15, linha - 4, 580, linha - 4)
                    linha -= 15

                documento.setFont("Helvetica", 8)
                documento.drawString(20, linha, str(index.produto.codigo_barras))
                documento.drawString(130, linha, str(
                    index.produto.descricao_simplificada + ' (' + index.produto.unidade_medida + ')').upper())
                documento.drawString(330, linha, 'R$ ' + str(index.preco_venda))
                documento.drawString(380, linha, str(index.cliente.nome_razao_social))
                documento.line(15, linha - 4, 580, linha - 4)
                linha -= 15
                cont += 1

                if cont == 50:
                    documento.showPage()
                    cont = 0

            documento.showPage()
            documento.save()
            return response
        elif not permissoes:
            return HttpResponseRedirect('/logout/')


@login_required
def tabela_precos_pdf(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    permissoes = 0
    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
        return HttpResponseRedirect('/logout/')

    tabela = TabelaPrecos.objects.filter(empresa=usuario.empresa).order_by('-preco_venda')
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.acessa_tabela_de_precos:
        permissoes = 1

    if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:

        if permissoes == 0:
            retorno['mensagem'] = mensagem_permissao_negada()
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
        elif permissoes == 1 and not tabela:
            retorno['mensagem'] = 'Não há nenhum produto tabelado para nenhum cliente da empresa ' + str(usuario.empresa.razao_social) + '...'
            retorno['titulo'] = 'NENHUM REGISTRO ENCONTRADO...'
            retorno['info'] = 1
        elif permissoes and tabela:
            retorno['permissoes'] = permissoes
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    if tabela and permissoes:

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="tabela_de_precos.pdf"'

        documento = canvas.Canvas(response)

        empresa = Empresas.objects.get(id=usuario.empresa.id)

        linha = 0
        cont = 0
        for index in tabela:

            if cont == 0:
                linha = 820
                documento.setFont("Helvetica", 12)
                documento.drawString(20, linha, 'Fornecedor: ' + empresa.nome_fantasia.upper())
                linha -= 20
                data = datetime.now()
                vencimento = datetime.fromordinal(data.toordinal() + 10).strftime('%d/%m/%Y')
                documento.drawString(20, linha,
                                     'Tabela válida até ' + vencimento + ' ,ou, enquanto durarem os nossos estoques.')
                linha = 780
                documento.setFont("Helvetica", 10)
                documento.drawString(20, linha-2, 'CÓDIGO DE BARRAS')
                documento.drawString(130, linha-2, 'DESCRIÇÃO DO PRODUTO')
                documento.drawString(330, linha-2, 'PREÇO')
                documento.drawString(380, linha - 2, 'CLIENTE')
                documento.line(15, linha-4, 580, linha-4)
                linha -= 15

            documento.setFont("Helvetica", 8)
            documento.drawString(20, linha, str(index.produto.codigo_barras))
            documento.drawString(130, linha, str(index.produto.descricao_simplificada + ' (' + index.produto.unidade_medida + ')').upper())
            documento.drawString(330, linha, 'R$ ' + str(index.preco_venda))
            documento.drawString(380, linha, str(index.cliente.nome_razao_social))
            documento.line(15, linha-4, 580, linha-4)
            linha -= 15
            cont += 1

            if cont == 50:
                documento.showPage()
                cont = 0

        documento.showPage()
        documento.save()
        return response
    elif not permissoes:
        return HttpResponseRedirect('/logout/')
