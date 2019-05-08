from django.urls import path
from compras import views


urlpatterns = [
    path('', views.compras, name='compras',),
    path('registrar-nova-compra/', views.registrar_nova_compra, name='registrarnovacompra',),
    path('finalizar-compra/', views.finalizar_compra, name='finalizarcompra'),
    path('buscar-compra/', views.buscar_compra, name='buscarcompra'),
    path('buscar-compras/', views.buscar_compras, name='buscarcompras'),
    path('muda-status-compra/', views.muda_status_compra, name='mudastatuscompra'),
    path('registrar-entrada-produto/', views.registrar_entrada_produto, name='registrarentradaproduto',),
    path('cancelar-entrada-produto/', views.cancelar_entrada_produto, name='cancelarentradaproduto',),
    path('buscar-produto/', views.buscar_produto, name='buscarproduto'),
    path('financeiro-contas-a-pagar-buscar-pagamento/<int:id_compra>/', views.conta_a_pagar,),
]
