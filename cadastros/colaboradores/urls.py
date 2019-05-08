from django.urls import path
from cadastros.colaboradores import views


urlpatterns = [
    path('cadastrar-colaborador/', views.cadastrar_colaborador,
        name='cadastrarcolaborador', ),

    path('buscar-colaborador/', views.buscar_colaborador,
        name='buscarcolaborador'),

    path('buscar-colaboradores/', views.buscar_colaboradores,
        name='buscarcolaboradores'),

    path('', views.cadastro_colaboradores,
        name='colaboradores', ),

    path('muda-status-colaborador/', views.status_colaborador,
        name='mudastatuscolaborador'),

]
