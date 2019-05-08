# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from cadastros.usuarios.models import Usuarios
from django.contrib.auth.decorators import login_required
from django.shortcuts import HttpResponseRedirect
from .models import PrecosPomocionais
from .forms import FormPrecosPomocionais
from django.http import HttpResponse, QueryDict
import json
from functions.views import deserialize_form
from estoque.produtos.models import Produtos
from functions.views import mensagem_permissao_negada, titulo_mensagem_permissao_negada
from reportlab.pdfgen import canvas
from cadastros.empresas.models import Empresas
from datetime import datetime


@login_required
def registrar_promocao(request):
    preco_id = int(request.POST.get('id') or 0)
    usuario = Usuarios.objects.get(usuario=request.user)
    retorno = {}
    sucesso = {}
    erro = []
    registro = {}
    if preco_id > 0:
        preco = PrecosPomocionais.objects.get(id=preco_id)
    else:
        preco = None

    if request.method == 'POST':
        form = FormPrecosPomocionais(deserialize_form(request.POST.get('form')), instance=preco)

        if form.is_valid():
            registro = form.save(commit=False)
            if preco_id < 1:
                produto_promocao = PrecosPomocionais.objects.filter(produto_promocao=registro.produto_promocao,status_promocao='ATIVO')
                if produto_promocao:
                    retorno = json.dumps({
                        'titulo': 'AÇÃO REJEITADA PELO SISTEMA...',
                        'mensagem': 'Este produto já está em promoção...',
                        'erro': 1,
                    })
                    return HttpResponse(retorno, content_type="application/json")
                else:
                    registro.empresa = usuario.empresa
                    registro.usuario = request.user
                    titulo_mensagem = 'PREÇOS PROMOCIONAIS...'
                    mensagem = 'Promoção gerada com sucesso!!!'
            else:
                titulo_mensagem = 'ALTERANDO PREÇO PROMOCIONAL...'
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
def buscar_promocao(request):
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
        precos = PrecosPomocionais.objects.filter(id=id)
        if precos:
            preco = PrecosPomocionais.objects.get(id=id)
        if not preco:
            retorno = json.dumps({
                'titulo': 'REGISTRO NÃO ENCONTRADO...',
                'mensagem': 'O sistema não identificou nenhum registro de promoção com este ID.',
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
                form = FormPrecosPomocionais(instance=preco)
                titulo = 'BUSCANADO REGISTROS DE PROMOÇÕES...'
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
def buscar_promocoes(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    tb_precos = {}
    mensagem = ''
    precos = []
    id_produto = 0
    codigo_barras = ''
    if 'codigo_barras' in request.GET and request.GET['codigo_barras']:
        codigo_barras = request.GET.get('codigo_barras')
        if codigo_barras != '':
            produto =Produtos.objects.filter(empresa=usuario.empresa.id, codigo_barras=codigo_barras)
            if produto:
                produto = Produtos.objects.get(empresa=usuario.empresa.id, codigo_barras=codigo_barras)
                tb_precos = PrecosPomocionais.objects.filter(empresa=usuario.empresa, produto_promocao=produto)
                if usuario.permissoes.administrador_super:
                    tb_precos = PrecosPomocionais.objects.filter(produto_promocao=produto)

    elif 'id_produto' in request.GET and request.GET['id_produto']:
        id_produto = int(request.GET.get('id_produto') or 0)
        if id_produto > 0:
            tb_precos = PrecosPomocionais.objects.filter(empresa=usuario.empresa, produto_promocao=id_produto)
            if usuario.permissoes.administrador_super:
                tb_precos = PrecosPomocionais.objects.filter(produto_promocao=id_produto)

    if id_produto == 0 and codigo_barras == '':
        tb_precos = PrecosPomocionais.objects.filter(empresa=usuario.empresa)
        if usuario.permissoes.administrador_super:
            tb_precos = PrecosPomocionais.objects.all()

    for index in tb_precos:
        precos += [{
            'id': str(index.id),
            'produto_promocao': str(index.produto_promocao),
            'descricao_simplificada': str(index.produto_promocao.descricao_simplificada),
            'percentual_desconto': str(index.percentual_desconto),
            'preco_venda_promocao': str(index.preco_venda_promocao),
            'empresa': str(index.empresa),
            'inicio_promocao': str(index.inicio_promocao.strftime('%d/%m/%Y')),
            'fim_promocao': str(index.fim_promocao.strftime('%d/%m/%Y')),
            'status_promocao': index.status_promocao,
            'observacoes_promocao': index.observacoes_promocao,
            'mensagem': mensagem,
            'titulo': '',
            'classe': 'success',
            'sucesso': 1,
        }]
    retorno = json.dumps(precos)
    return HttpResponse(retorno, content_type='application/json')


@login_required
def muda_status_promocao(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    status_promocao = ''
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.muda_status_preco_tabelado:
        if request.method == 'POST':
            registro = PrecosPomocionais.objects.filter(id=int(QueryDict(request.body).get('registro_id')))
            if registro:
                registro = PrecosPomocionais.objects.get(id=int(QueryDict(request.body).get('registro_id')))
                status = registro.status_promocao
                if registro.status_promocao == 'ATIVO':
                    registro.status_promocao = 'INATIVO'
                elif registro.status_promocao == 'INATIVO':
                    registro.status_promocao = 'ATIVO'

                status_promocao = registro.status_promocao
                registro.save()
                if registro.status_promocao == status_promocao:
                    mensagem = 'Státus alterado com sucesso!!!'
                else:
                    mensagem = '''Verifique se o státus foi realmente alterado,
                                  pois há uma suspeita, de que isto não tenha ocorrido...'''
                retorno['mensagem'] = mensagem
                retorno['titulo'] = 'ALTERANDO STÁTUS DE PREÇO...'
                retorno['status_preco'] = registro.status_promocao
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
def excluir_promocao(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.exclui_preco_tabelado:
        if request.method == 'DELETE':
            registro = PrecosPomocionais.objects.get(id=int(QueryDict(request.body).get('registro_id')))

            registro.delete()

            retorno['mensagem'] = 'Registro excluído com sucesso!!!'
            retorno['titulo'] = 'PREÇOS PROMOCIONAIS...'
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
    campos = {}

    if id_produto > 0:
        registro = Produtos.objects.filter(id=id_produto, status='ATIVO')
        if registro:
            produto = Produtos.objects.get(id=id_produto)
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
def precos_promocionais_pdf(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    permissoes = 0
    if usuario.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO':
        return HttpResponseRedirect('/logout/')

    promocoes = PrecosPomocionais.objects.filter(empresa=usuario.empresa, status_promocao='ATIVO').order_by('-preco_venda_promocao')
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.acessa_tabela_de_precos:
        permissoes = 1

    if 'verifica_permissoes' in request.GET and request.GET['verifica_permissoes']:

        if permissoes == 0:
            retorno['mensagem'] = mensagem_permissao_negada()
            retorno['titulo'] = titulo_mensagem_permissao_negada()
            retorno['erro'] = 1
        elif permissoes == 1 and not promocoes:
            retorno['mensagem'] = 'Não há nenhum registro de produtos em promoção na empresa ' + str(usuario.empresa.razao_social) + '...'
            retorno['titulo'] = 'NENHUM REGISTRO ENCONTRADO...'
            retorno['info'] = 1
        elif permissoes and promocoes:
            retorno['permissoes'] = permissoes
        return HttpResponse(json.dumps(retorno), content_type="application/json")

    if promocoes and permissoes:

        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = 'inline; filename="tabela_de_precos.pdf"'

        documento = canvas.Canvas(response)

        empresa = Empresas.objects.get(id=usuario.empresa.id)

        linha = 0
        cont = 0
        for index in promocoes:

            if cont == 0:
                linha = 820
                documento.setFont("Helvetica", 12)
                documento.drawString(20, linha, empresa.nome_fantasia.upper())
                linha -= 20
                data = datetime.now()
                documento.drawString(20, linha, 'ATENÇÃO!!!: Fique atento as datas de início e fim de cada promoção...')
                linha = 780
                documento.setFont("Helvetica", 10)
                documento.drawString(20, linha - 2, 'CÓDIGO')
                documento.drawString(120, linha-2, 'DESCRIÇÃO DO PRODUTO')
                documento.drawString(290, linha-2, 'PREÇO')
                documento.drawString(350, linha - 2, 'DESC')
                documento.drawString(400, linha - 2, 'PROMOÇÃO')
                documento.drawString(480, linha - 2, 'INÍCIO')
                documento.drawString(530, linha - 2, 'FIM')
                documento.line(15, linha-4, 580, linha-4)
                linha -= 15
            promocao = (index.produto_promocao.preco_venda - index.preco_venda_promocao)
            documento.setFont("Helvetica", 8)
            documento.drawString(20, linha, str(index.produto_promocao.codigo_barras))
            documento.drawString(120, linha, str(index.produto_promocao.descricao_simplificada + ' (' + index.produto_promocao.unidade_medida + ')').upper())
            documento.drawString(290, linha, 'R$ ' + str('%0.02f' % index.produto_promocao.preco_venda))
            documento.drawString(350, linha, 'R$ ' + str('%0.02f' % promocao))
            documento.drawString(400, linha, 'R$ ' + str('%0.02f' % index.preco_venda_promocao))
            documento.drawString(480, linha, str(index.inicio_promocao.strftime('%d/%m/%Y')))
            documento.drawString(530, linha, str(index.fim_promocao.strftime('%d/%m/%Y')))

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
