# -*- coding: utf-8 -*-
from cadastros.usuarios.models import Usuarios
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, get_object_or_404
from .models import Produtos, ImagensProdutos
from .forms import FormCadastroProduto, FormTabelaPrecos, FormPrecosPomocionais, FormImagemProduto, FormImagemProdutos, FormCategorias, FormMarcas
import traceback
from django.http import HttpResponse, QueryDict, HttpResponseRedirect, Http404
import json
from cadastros.clientes.models import Clientes
from functions.views import mensagem_permissao_negada, titulo_mensagem_permissao_negada
from functions.views import NORMALIZAR, moeda_real
from django.contrib import messages
from functions.views import deserialize_form
from django.views.generic.base import View
from estoque.produtos.models import Categorias, Marcas


@login_required
def cadastro_produtos(request, status=None):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if usuario.status != 'ATIVO' or usuario.colaborador.status != 'ATIVO' or usuario.permissoes.status != 'ATIVO' or usuario.empresa.status != 'ATIVO' or not usuario.colaborador:
        messages.add_message(request, messages.ERROR, 'Olá' + usuario.nome + '''. Desculpe-nos, mas você 
        não pode mais acessar nosso sistema...''')
        return HttpResponseRedirect('/logout/')

    classe = ''
    produtos = {}
    try:
        categorias = Categorias.objects.filter(empresa=usuario.empresa)
        marcas = Marcas.objects.filter(empresa=usuario.empresa)
        sub_titulo = 'Produtos'
        form_tabela_precos = FormTabelaPrecos()
        form_precos_promocao = FormPrecosPomocionais()
        form_produtos = FormCadastroProduto()

        if (usuario.permissoes.administrador_super or usuario.permissoes.administrador or
                usuario.permissoes.cadastra_produto or usuario.permissoes.edita_produto):

            form_produtos.fields['categoria_produto'].queryset = Categorias.objects.filter(
                empresa=usuario.empresa)

            form_produtos.fields['marca_produto'].queryset = Marcas.objects.filter(
                empresa=usuario.empresa)

        if (usuario.permissoes.administrador_super or usuario.permissoes.administrador or
                usuario.permissoes.tabela_preco or usuario.permissoes.edita_tabela_de_precos):

            form_tabela_precos.fields['produto'].queryset = Produtos.objects.filter(
                empresa=usuario.empresa)
            form_tabela_precos.fields['cliente'].queryset = Clientes.objects.filter(
                empresa=usuario.empresa)
            form_precos_promocao.fields['produto_promocao'].queryset = Produtos.objects.filter(
                empresa=usuario.empresa)

        else:
            form_tabela_precos.fields['cliente'].queryset = Clientes.objects.filter(id=0)
            form_tabela_precos.fields['produto'].queryset = Produtos.objects.filter(id=0)
            form_precos_promocao.fields['produto_promocao'].queryset = Produtos.objects.filter(id=0)

        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_produto:
            produtos = Produtos.objects.filter(empresa=usuario.empresa.id, status=status)

        elif usuario.permissoes.administrador_super:
            produtos = Produtos.objects.filter(status=status)

        for index in produtos:
            if index.anunciar_produto:
                anuncio = 'ANUNCIADO'
            else:
                anuncio = 'SEM ANUNCIO'

            if (index.estoque_atual > index.estoque_minimo) and index.estoque_minimo > 0:
                classe = 'success'
            elif (index.estoque_atual == index.estoque_minimo) and index.estoque_minimo > 0:
                classe = 'warning'
            elif (index.estoque_atual < index.estoque_minimo) and index.estoque_minimo > 0:
                classe = 'danger'
            index.anunciar_produto = anuncio
            index.classe = classe
    except:
        trace = traceback.format_exc()
        erro = 1
        if request.user.is_superuser:
            mensagem = 'Houve um erro interno no sistema. ' + trace
        else:
            mensagem = '''Houve um erro interno no sistema.
            Por favor, contate o suporte técnico através do E-mail: suporte@atpcsistemas.com.br.'''

    return render(request, "produtos/produtos.html", locals(),)


@login_required
def cadastrar_produto(request):
    produto_id = int(request.POST.get('id') or 0)
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    sucesso = {}
    erro = []
    if produto_id > 0:
        produto = Produtos.objects.get(id=produto_id)

    else:
        produto = None

    if request.method == 'POST':
        form = deserialize_form(request.POST.get('form'))
        form = FormCadastroProduto(form, instance=produto)
        if form.is_valid():
            registro = form.save(commit=False)
            if not registro.descricao_completa:
                registro.descricao_completa = registro.descricao_simplificada

            registro.descricao_simplificada = NORMALIZAR(registro.descricao_simplificada)
            registro.descricao_completa = NORMALIZAR(registro.descricao_completa)
            if registro.codigo_barras and registro.codigo_barras != 'Null' and registro.codigo_barras != 'None':
                p = Produtos.objects.filter(empresa=usuario.empresa, codigo_barras=registro.codigo_barras)
                if p:
                    p = Produtos.objects.get(empresa=usuario.empresa, codigo_barras=registro.codigo_barras)
                    if p.id != registro.id:
                        retorno = json.dumps({
                            'titulo': 'CÓDIGO DE BARRAS REPETIDO...',
                            'mensagem': 'Já existe um produto cadastrado com este código de barras...<br>' + str(p.descricao_simplificada) + '...',
                            'erro': 1,
                        })
                        return HttpResponse(retorno, content_type="application/json")
            if produto_id < 1:
                registro.empresa = usuario.empresa
                registro.usuario = request.user
                titulo_mensagem = 'SALVANDO REGISTRO . . .'
                mensagem = 'O registro foi salvo com sucesso !!!'

            else:
                titulo_mensagem = 'ALTERANDO REGISTRO . . .'
                mensagem = 'O registro foi alterado com sucesso !!!'
            if registro.valor_compra:
                preco_venda = ((float(registro.percentual_lucro) / 100) * float(registro.valor_compra)) + float(registro.valor_compra)
                registro.preco_venda = preco_venda
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
            mensagem = '''O formulário apresentou erros no seu preenchimento.
                       Corrija os campos listados em vermelho e tente novamente. . .'''

            retorno = json.dumps({
                'titulo': titulo_mensagem,
                'mensagem': mensagem,
                'erro': erro,
            })
    return HttpResponse(retorno, content_type="application/json")


@login_required
def anunciar_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    if usuario.permissoes.administrador_super or usuario.permissoes.administrador or usuario.permissoes.anuncia_produto:
        if request.method == 'POST':
            produto = Produtos.objects.get(pk=int(QueryDict(request.body).get('registro_id')))

            if produto.anunciar_produto == 0:
                produto.anunciar_produto = 1
                titulo = 'ANUNCIANDO PRODUTO . . .'
                anuncio = 'ANUNCIADO'
                mensagem = 'O produto passou a ser anunciado no site ' + str(usuario.empresa.site) + '.' \
                           ' Lembramos que para isto, é necessário que o mesmo possua um estoque positivo.'

            else:
                produto.anunciar_produto = 0
                titulo = 'DEIXANDO DE ANUNCIAR PRODUTO . . .'
                anuncio = 'SEM ANUNCIO'
                mensagem = 'O produto deixou de ser anunciado no site ' + str(usuario.empresa.site) + \
                           '''. Lembramos que você pode voltar a  anunciá-lo a qualquer momento
                           repetindo esta mesma operação.'''
            produto.save()
            retorno['titulo'] = titulo
            retorno['anuncio'] = anuncio
            retorno['mensagem'] = mensagem
            retorno['permissao_negada'] = 0
            retorno['sucesso'] = 1
    else:
        retorno['mensagem'] = mensagem_permissao_negada()
        retorno['titulo'] = titulo_mensagem_permissao_negada()
        retorno['permissao_negada'] = 1
        retorno['sucesso'] = 0
    return HttpResponse(json.dumps(retorno), content_type="application/json")


@login_required
def status_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    retorno = {}
    mensagem = ''
    titulo = ''
    if usuario.permissoes.administrador > 0 or usuario.permissoes.administrador_super > 0 or usuario.permissoes.anuncia_produto >0:
        if request.method == 'POST':
            registro = Produtos.objects.get(pk=int(QueryDict(request.body).get('registro_id')))
            status = QueryDict(request.body).get('status')

            if status != 'ATIVO':
                registro.anunciar_produto = 0

            registro.status = status
            registro.save()

            if status == 'ATIVO':
                mensagem = 'Produto ativado com sucesso !!!'
                titulo = 'ATIVAR PRODUTO ...'

            elif status == 'INATIVO':
                mensagem = 'Produto desativado com sucesso !!!'
                titulo = 'DESATIVAR PRODUTO ...'

            elif status == 'EXCLUIDO':
                mensagem = 'Produto excluido com sucesso !!!'
                titulo = 'EXCLUIR PRODUTO ...'

            elif status == 'FORA DE LINHA':
                mensagem = 'Produto posto fora de linha com sucesso !!!'
                titulo = 'TIRAR PRODUTO DE LINHA ...'

            if registro.anunciar_produto == 1:
                anuncio = 'ANUNCIADO'
            else:
                anuncio = 'SEM ANUNCIO'

            retorno['mensagem'] = mensagem
            retorno['titulo'] = titulo
            retorno['status'] = status
            retorno['anuncio'] = anuncio
            retorno['sucesso'] = 1
            retorno['permissao_negada'] = 0
    else:
        retorno['mensagem'] = mensagem_permissao_negada()
        retorno['titulo'] = titulo_mensagem_permissao_negada()
        retorno['permissao_negada'] = 1
        retorno['sucesso'] = 0

    return HttpResponse(
            json.dumps(retorno), content_type="application/json")


@login_required
def buscar_produtos(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    tb_produtos = {}
    mensagem = ''
    produtos = []
    classe = ''
    alerta = 0
    sucesso = 0
    erro = 0
    valor_total = 0
    valor_estoque = 0
    titulo = 'PESQUISANDO PRODUTOS...'
    if 'status' in request.GET and request.GET['status']:
        status = request.GET.get('status')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_produto:
            tb_produtos = Produtos.objects.filter(empresa=usuario.empresa, status=status).order_by('descricao_simplificada')
        elif usuario.permissoes.administrador_super:
            tb_produtos = Produtos.objects.filter(status=status).order_by('descricao_simplificada')

    if 'descricao' in request.GET and request.GET['descricao']:
        descricao = request.GET.get('descricao')
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_produto:
            tb_produtos = Produtos.objects.filter(empresa=usuario.empresa.id,
                                                  descricao_simplificada__contains=descricao.upper()).order_by(
                'descricao_simplificada')
        elif usuario.permissoes.administrador_super:
            tb_produtos = Produtos.objects.filter(descricao_simplificada__contains=descricao.upper()).order_by(
                'descricao_simplificada')

        if not tb_produtos:
            if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_produto:
                tb_produtos = Produtos.objects.filter(empresa=usuario.empresa.id,
                                                      descricao_simplificada__contains=descricao.lower()).order_by(
                    'descricao_simplificada')
            elif usuario.permissoes.administrador_super:
                tb_produtos = Produtos.objects.filter(descricao_simplificada__contains=descricao.lower()).order_by(
                    'descricao_simplificada')

        if not tb_produtos:
            mensagem = 'Voce pesquisou por [ ' + str(descricao) + ' ] Nenhum Produto corresponde a sua pesquisa...'
        else:
            mensagem = 'Voce pesquisou por [ ' + str(descricao) + ' ] Um total de ' + str(
                len(tb_produtos)) + ' registros corresponderam á sua pesquisa...'

    if 'codigo_barras' in request.GET and request.GET['codigo_barras']:
        codigo_barras = str(request.GET.get('codigo_barras'))
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_produto:
            tb_produtos = Produtos.objects.filter(empresa=usuario.empresa.id,
                                                  codigo_barras=codigo_barras).order_by('descricao_simplificada')
        elif usuario.permissoes.administrador_super:
            tb_produtos = Produtos.objects.filter(codigo_barras=codigo_barras).order_by('descricao_simplificada')

        if not tb_produtos:
            mensagem = 'Voce pesquisou por produtos com o seguinte código de barras: [ ' + codigo_barras + ''' ].
                          Nenhum produto corresponde a sua pesquisa...'''
        else:
            mensagem = 'Voce pesquisou por produtos com o seguinte código de barras: [ ' + codigo_barras + ''' ].
                        Um total de ''' + str(len(tb_produtos)) + ' registros corresponderam á sua pesquisa....'

    if 'id_produto' in request.GET and request.GET['id_produto']:
        id_produto = int(request.GET.get('id_produto') or 0)
        if usuario.permissoes.administrador or usuario.permissoes.acessa_cadastro_produto:
            tb_produtos = Produtos.objects.filter(empresa=usuario.empresa.id, id=id_produto)
        elif usuario.permissoes.administrador_super:
            tb_produtos = Produtos.objects.filter(id=id_produto)

        if not tb_produtos:
            mensagem = 'Voce pesquisou por produtos com o seguinte ID: [ 000.' + str(id_produto) + ''' ].
                          Nenhum produto corresponde a sua pesquisa...'''
        else:
            mensagem = 'Voce pesquisou por produtos com o seguinte ID: [ ' + str(id_produto) + ''' ].
                        Um total de ''' + str(len(tb_produtos)) + ' registros corresponderam á sua pesquisa...'
    sucesso = 1
    for index in tb_produtos:
        tatal_desconto = 0
        if index.anunciar_produto:
            anuncio = 'ANUNCIADO'
        else:
            anuncio = 'SEM ANUNCIO'

        if (index.estoque_atual > index.estoque_minimo) and index.estoque_minimo > 0:
            classe = 'success'
        elif (index.estoque_atual == index.estoque_minimo) and index.estoque_minimo > 0:
            classe = 'warning'
        elif (index.estoque_atual < index.estoque_minimo) and index.estoque_minimo > 0:
            classe = 'danger'

        if index.desconto_maximo >= index.atacado_desconto and index.desconto_maximo > 0:
            tatal_desconto = ((index.desconto_maximo / 100) * index.estoque_atual) * index.preco_venda

        elif index.desconto_maximo < index.atacado_desconto and index.atacado_desconto > 0:
            tatal_desconto = ((index.atacado_desconto / 100) * index.estoque_atual) * index.preco_venda
        elif index.desconto_maximo < 0.001 and index.atacado_desconto < 0.001:
            tatal_desconto = 0

        valor_total = index.estoque_atual * index.preco_venda
        valor_estoque = valor_total - tatal_desconto

        valor_total = '%0.02f' % valor_total
        valor_estoque = '%0.02f' % valor_estoque
        tatal_desconto = '%0.02f' % tatal_desconto

        produtos += [{
            'codigo_barras': index.codigo_barras,
            'preco_venda': moeda_real(index.preco_venda),
            'valor_compra': moeda_real(index.valor_compra),
            'valor_total': moeda_real(valor_total),
            'tatal_desconto': moeda_real(tatal_desconto),
            'valor_estoque': moeda_real(valor_estoque),
            'estoque_atual': str(index.estoque_atual),
            'descricao_simplificada': index.descricao_simplificada,
            'unidade_medida': index.unidade_medida,
            'categoria': str(index.categoria_produto),
            'estoque_minimo': str(index.estoque_minimo),
            'estoque_maximo': str(index.estoque_maximo),
            'fracionar_produto': index.fracionar_produto,
            'id_embalagem_fechada': str(index.id_embalagem_fechada),
            'quantidade_embalagem_fechada': str(index.quantidade_embalagem_fechada),
            'percentual_lucro': str(index.percentual_lucro),
            'desconto_maximo': str(index.desconto_maximo),
            'atacado_apartir': str(index.atacado_apartir),
            'atacado_desconto': str(index.atacado_desconto),
            'anunciar_produto': anuncio,
            'empresa': str(index.empresa),
            'marca': str(index.marca_produto),
            'id': index.id,
            'status': index.status,
            'classe': classe,
        }]

    retorno = json.dumps({
        'produtos': produtos,
        'titulo': titulo,
        'mensagem': mensagem,
        'erro': erro,
        'alerta': alerta,
        'sucesso': sucesso,
    })
    return HttpResponse(retorno, content_type='application/json')


@login_required
def buscar_produto(request):
    usuario = Usuarios.objects.get(usuario=request.user.id)
    id = 0
    if usuario.permissoes.administrador or usuario.permissoes.administrador_super or usuario.permissoes.edita_produto:
        id = request.GET.get('id')
        registro = Produtos.objects.get(pk=int(id))
        form = FormCadastroProduto(instance=registro)
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
    else:
        retorno = json.dumps({
            'id': id,
            'titulo': titulo_mensagem_permissao_negada(),
            'mensagem': mensagem_permissao_negada(),
            'campos': {},
            'permissao_negada': 1,
        })
    return HttpResponse(retorno, content_type='application/json')


@login_required
def alterar_imagem_produto(request, registro_id=None):
    titulo = 'ALTERAR IMAGEM DE PRODUTO'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    if registro_id:
        mensagem = 'Selecione uma imagem e clique em salvar...'
        registro = get_object_or_404(Produtos, id=registro_id)
        imagens = ImagensProdutos.objects.filter(produto=registro)
        if registro.empresa != usuario.empresa:
            raise Http404
    else:
        raise Http404

    if request.method == 'POST':
        form = FormImagemProduto(request.POST, request.FILES, instance=registro)
        if form.is_valid():
            if 'caminho_imagem' in request.POST and request.POST['caminho_imagem']:
                caminho = request.POST['caminho_imagem']
                id_imagem = int(request.POST['id_imagem'])
                registro.imagem = caminho
                registro.save()
                fechar = 1
            else:
                registro = form.save()
                ImagensProdutos.objects.create(imagem=registro.imagem, empresa=registro.empresa, produto=registro)
                fechar = 1
    else:
        form = FormImagemProduto(instance=registro,)

    return render(request, 'produtos/imagem_produtos.html', locals())


@login_required
def editar_imagem(request, registro_id=None):
    titulo = 'ALTERAR IMAGEM DE PRODUTO'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    registro = None
    caminho = ''
    if registro_id:
        mensagem = 'Selecione uma imagem e clique em salvar...'
        registro = get_object_or_404(ImagensProdutos, id=registro_id)
        caminho = registro.imagem
        imagens = ImagensProdutos.objects.filter(produto=registro.produto)

    if request.method == 'POST':
        form = FormImagemProdutos(request.POST, request.FILES, instance=registro)
        if form.is_valid():
            if 'caminho_imagem' in request.POST and request.POST['caminho_imagem']:
                caminho = request.POST['caminho_imagem']
                registro.imagem = caminho
                registro.save()
                fechar = 1
            else:
                registro = form.save()
                ImagensProdutos.objects.create(imagem=caminho, empresa=registro.empresa, produto=registro.produto)
                fechar = 1
    else:
        form = FormImagemProdutos(instance=registro,)

    return render(request, 'produtos/imagem_produtos.html', locals())


@login_required
def apagar_imagem_principal_produto(request, registro_id=None):
    titulo = 'APAGANDO IMAGEM DE PRODUTO'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    mensagem = 'Atenção!!! se você apagar uma imagem acidentalmente, poderá recuperá-la novomente clicando no link "alterar imagem"...'
    produto = get_object_or_404(Produtos, id=registro_id)
    sucesso = 1
    imagem = produto.imagem
    if request.method == 'POST':
        produto.imagem = ''
        produto.save()
        fechar = 1
    return render(request, 'produtos/apagar_imagem_produtos.html', locals())


@login_required
def adicionar_imagem_produto(request, registro_id=None):
    titulo = 'ADICIONAR IMAGEM AO PRODUTO'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    mensagem = 'Selecione uma imagem e clique em salvar...'
    produto = Produtos.objects.get(pk=registro_id)
    imagens = ImagensProdutos.objects.filter(produto=produto, status=0)

    if request.method == 'POST':
        form = FormImagemProdutos(request.POST, request.FILES, instance=None)
        if form.is_valid():

            if 'caminho_imagem' in request.POST and request.POST['caminho_imagem']:
                caminho = request.POST['caminho_imagem']
                id_imagem = int(request.POST['id_imagem'])
                imagem = ImagensProdutos.objects.get(pk=id_imagem)
                imagem.status = 1
                imagem.save()
                fechar = 1
            else:
                produto = get_object_or_404(Produtos, id=registro_id)
                registro = form.save(commit=False)
                registro.produto = produto
                registro.status = 1
                registro.empresa = usuario.empresa
                if registro.imagem:
                    registro.save()
                    fechar = 1
                else:
                    mensagem = 'Atenção!!! Você precisa selecionar uma imagem para salvar...'
                    erro = 1
    else:
        form = FormImagemProdutos(instance=None,)

    return render(request, 'produtos/imagem_produtos.html', locals())


@login_required
def apagar_imagem_produto(request, registro_id=None):
    titulo = 'APAGANDO IMAGEM DE PRODUTO'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    mensagem = 'Atenção!!! se você apagar uma imagem acidentalmente, poderá recuperá-la novomente clicando no link "adicionar imagem"...'
    registro = get_object_or_404(ImagensProdutos, id=registro_id)
    imagem = registro.imagem
    erro = 1
    if request.method == 'POST':
        registro.status = 0
        registro.save()
        fechar = 1

    return render(request, 'produtos/apagar_imagem_produtos.html', locals())


@login_required
def testeando_apagar_arquivo(request, registro_id=None):
    from WebVendas.settings import BASE_DIR
    import os
    titulo = 'APAGANDO IMAGEM DE PRODUTO'
    usuario = Usuarios.objects.get(usuario=request.user.id)
    # mensagem = 'Atenção!!! Se você apagar esta imagem não, poderá recuperá-la novomente...'
    registro = get_object_or_404(ImagensProdutos, id=registro_id)
    imagem = registro.imagem
    erro = 1
    if request.method == 'POST':
        path = os.path.join(BASE_DIR, 'media\\estoque\\produtos\\img\\')
        dir = os.listdir(path)
        mensagem = path + str(registro.imagem).replace('estoque/produtos/img/', '')
        arquivo = str(registro.imagem).replace('estoque/produtos/img/', '')

        for file in dir:
            x = arquivo.replace('jpg', 'png')
            os.renames(path + arquivo, path + x)
            if file == arquivo:
                os.remove(str(path) + str(file))
                mensagem = 'ok'
                fechar = 0

    return render(request, 'produtos/apagar_imagem_produtos.html', locals())


class CategoriasView(View):
    def get(self, request):
        usuario = Usuarios.objects.get(usuario=request.user.id)
        categorias = Categorias.objects.filter(empresa=usuario.empresa)
        return render(request, 'produtos/tables/categorias.html', locals())

    def post(self, request):
        id = int(request.POST.get('id') or 0)
        usuario = Usuarios.objects.get(usuario=request.user.id)
        empresa = {}
        sucesso = {}
        erro = []
        if id > 0:
            registro = Categorias.objects.get(id=id)
            empresa = registro.empresa
        else:
            registro = None
            empresa = usuario.empresa
        form = FormCategorias(deserialize_form(request.POST.get('form')), instance=registro)
        if form.is_valid():
            registro = form.save(commit=False)
            registro.descricao = NORMALIZAR(registro.descricao)
            registro.obs = NORMALIZAR(registro.obs)
            registro.empresa = empresa
            if id < 1:
                titulo_mensagem = 'SALVANDO REGISTRO . . .'
                mensagem = 'O registro foi salvo com sucesso !!!'
            else:
                titulo_mensagem = 'ALTERANDO REGISTRO . . .'
                mensagem = 'O registro foi alterado com sucesso !!!'

            registro.save()
            sucesso['success'] = True
            sucesso['mensagem'] = mensagem
            sucesso['id'] = registro.id
            sucesso['descricao'] = registro.descricao
            sucesso['obs'] = registro.obs
            sucesso['titulo'] = titulo_mensagem
            retorno = json.dumps(sucesso)

        else:
            for error in form.errors:
                erro += {error}
                erro += {error}

            titulo_mensagem = 'ERRO NA VALIDAÇÃO DOS DADOS . . .'
            mensagem = '''O formulário apresentou erros no seu preenchimento.
                        Corrija os campos listados em vermelho e tente novamente...'''

            retorno = json.dumps({
                'titulo': titulo_mensagem,
                'mensagem': mensagem,
                'erro': erro,
            })
        return HttpResponse(retorno, content_type="application/json")

    def put(self, request):
        pass


class MarcasView(View):
    def get(self, request):
        usuario = Usuarios.objects.get(usuario=request.user.id)
        marcas = Marcas.objects.filter(empresa=usuario.empresa)
        return render(request, 'produtos/tables/marcas.html', locals())

    def post(self, request):
        id = int(request.POST.get('id') or 0)
        usuario = Usuarios.objects.get(usuario=request.user.id)
        empresa = {}
        sucesso = {}
        erro = []
        if id > 0:
            registro = Marcas.objects.get(id=id)
            empresa = registro.empresa
        else:
            registro = None
            empresa = usuario.empresa
        form = FormMarcas(deserialize_form(request.POST.get('form')), instance=registro)
        if form.is_valid():
            registro = form.save(commit=False)
            registro.descricao = NORMALIZAR(registro.descricao)
            registro.obs = NORMALIZAR(registro.obs)
            registro.empresa = empresa
            if id < 1:
                titulo_mensagem = 'SALVANDO REGISTRO . . .'
                mensagem = 'O registro foi salvo com sucesso !!!'
            else:
                titulo_mensagem = 'ALTERANDO REGISTRO . . .'
                mensagem = 'O registro foi alterado com sucesso !!!'

            registro.save()
            sucesso['success'] = True
            sucesso['mensagem'] = mensagem
            sucesso['id'] = registro.id
            sucesso['descricao'] = registro.descricao
            sucesso['obs'] = registro.obs
            sucesso['titulo'] = titulo_mensagem
            retorno = json.dumps(sucesso)

        else:
            for error in form.errors:
                erro += {error}
                erro += {error}

            titulo_mensagem = 'ERRO NA VALIDAÇÃO DOS DADOS . . .'
            mensagem = '''O formulário apresentou erros no seu preenchimento.
                        Corrija os campos listados em vermelho e tente novamente...'''

            retorno = json.dumps({
                'titulo': titulo_mensagem,
                'mensagem': mensagem,
                'erro': erro,
            })
        return HttpResponse(retorno, content_type="application/json")

    def put(self, request):
        pass

