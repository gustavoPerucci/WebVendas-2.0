from django.urls import path
from . import precos_promocionais, tabela_precos, views
urlpatterns = [
    path('cadastrar-produto/', views.cadastrar_produto, name='cadastrarproduto',),
    path('alterar-imagem-produto/<int:registro_id>/', views.alterar_imagem_produto,),
    path('adicionar-imagem-produto/<int:registro_id>/', views.adicionar_imagem_produto,),
    path('apagar-imagem-produto/<int:registro_id>/', views.apagar_imagem_produto,),
    path('apagar-imagem-principal-produto/<int:registro_id>/', views.apagar_imagem_principal_produto,),
    path('buscar-produto/', views.buscar_produto, name='buscarproduto'),
    path('buscar-produtos/', views.buscar_produtos, name='buscarprodutos'),
    path('', views.cadastro_produtos, name='produtos',),
    path('anunciar-produto/', views.anunciar_produto, name='anunciarproduto'),
    path('muda-status-produto/', views.status_produto, name='mudastatusproduto'),
    path('ativos/', views.cadastro_produtos, {'status': 'ATIVO'}, name='produtosativos',),
    path('inativos/', views.cadastro_produtos, {'status': 'INATIVO'}, name='produtosinativos',),
    path('fora-de-linha/', views.cadastro_produtos, {'status': 'FORA DE LINHA'}, name='produtosforadelinha',),
    path('excluidos/', views.cadastro_produtos, {'status': 'EXCLUIDO'}, name='produtosexcluidos',),

    path('tabela-precos/', tabela_precos.tabela_precos, name='tabelaprecos',),
    path('tabelar-preco/', tabela_precos.tabelar_preco, name='tabelarpreco',),
    path('buscar-precos-tabelados/', tabela_precos.buscar_precos_tabelados, name='buscarprecostabelados',),
    path('tabela-precos-cliente/<int:id_cliente>/', tabela_precos.tabela_precos_cliente, name='tabelaprecoscliente',),
    path('tabela-precos-produto/<int:id_produto>/', tabela_precos.tabela_precos_produto, name='tabelaprecosproduto',),
    path('tabela-precos-pdf/', tabela_precos.tabela_precos_pdf, name='tabelaprecospdf',),
    path('buscar-preco-tabelado/', tabela_precos.buscar_preco_tabelado, name='buscarprecotabelado',),
    path('excluir-preco-tabelado/', tabela_precos.excluir_preco_tabelado, name='excluirprecotabelado',),
    path('muda-status-preco-tabelado/', tabela_precos.muda_status_preco_tabelado, name='mudastatusprecotabelado',),

    path('precos-promocionais-pdf/', precos_promocionais.precos_promocionais_pdf, name='precospromocionaispdf',),
    path('busca-produto/', precos_promocionais.busca_produto, name='buscaproduto'),
    path('registrar-promocao/', precos_promocionais.registrar_promocao, name='registrarpromocao',),
    path('buscar-promocoes/', precos_promocionais.buscar_promocoes, name='buscarpromocoes',),
    path('buscar-promocao/', precos_promocionais.buscar_promocao, name='buscarpromocao',),
    path('muda-status-promocao/', precos_promocionais.muda_status_promocao, name='mudastatuspromocao',),
    path('excluir-promocao/', precos_promocionais.excluir_promocao, name='excluirpromocao',),

    path('categorias/', views.CategoriasView.as_view(), name='categorias',),
    path('marcas/', views.MarcasView.as_view(), name='marcas',),
]
