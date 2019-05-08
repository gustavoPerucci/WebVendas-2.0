from django.urls import path
from cadastros.clientes import views


urlpatterns = [

    path('pessoa-juridica/', views.cadastro_clientes, {'pessoa_juridica': True}, name='clientes_pessoa_juridica',),
    path('cadastrar-cliente/', views.cadastrar_cliente, name='cadastrarcliente', ),
    path('buscar-cliente/', views.buscar_cliente, name='buscarcliente'),
    path('buscar-clientes/', views.buscar_clientes, name='buscarclientes'),
    path('pessoa-fisica/', views.cadastro_clientes, {'pessoa_fisica': True}, name='clientes_pessoa_fisica', ),
    path('muda-status-cliente/', views.muda_status_cliente, name='mudastatuscliente'),
]


