from django.urls import path
from . import pedidos, views

urlpatterns = [
    path('', views.vendas, name='vendas',),
    path('registrar-nova-venda/', views.registrar_nova_venda, name='registrarnovavenda',),
    path('finalizar-venda/', views.finalizar_venda, name='finalizarvenda'),
    path('buscar-venda/', views.buscar_venda, name='buscarvenda'),
    path('buscar-vendas/', views.buscar_vendas, name='buscarvendas'),
    path('muda-status-venda/', views.muda_status_venda, name='mudastatusvenda'),
    path('financeiro-contas-a-receber-buscar-pagamento/<int:id_venda>/', views.conta_a_receber,),

    path('busca-produto/', pedidos.busca_produto, name='buscaproduto'),
    path('registrar-saida-produto/', pedidos.registrar_saida_produto, name='registrarsaidaproduto',),
    path('muda-status-item/', pedidos.muda_status_item, name='mudastatusitem'),
    path('cancelar-saida-produto/', pedidos.cancelar_saida_produto, name='cancelarsaidaproduto'),
    path('imprimir-cupom-nao-fiscal/<int:id_venda>/', pedidos.imprimir_pedido, {'cupom': 'cupom'}, ),
    path('imprimir-pedido-pdf/<int:id_venda>/', pedidos.imprimir_pedido_pdf),

]
