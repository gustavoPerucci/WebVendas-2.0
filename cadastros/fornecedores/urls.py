from django.urls import path
from cadastros.fornecedores import views


urlpatterns = [
    path('pessoa-juridica/', views.cadastro_fornecedores, {'pessoa_juridica': True}, name='fornecedores_pessoa_juridica', ),
    path('cadastrar-fornecedor/', views.cadastrar_fornecedor, name='cadastrarfornecedor',),
    path('buscar-fornecedor/', views.buscar_fornecedor, name='buscarfornecedor'),
    path('buscar-fornecedores/', views.buscar_fornecedores, name='buscarfornecedores'),
    path('pessoa-fisica/', views.cadastro_fornecedores, {'pessoa_fisica': True}, name='fornecedores_pessoa_fisica',),
    path('muda-status-fornecedor/', views.muda_status_fornecedor, name='mudastatusfornecedor'),
]
