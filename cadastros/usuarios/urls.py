from django.urls import path
from cadastros.usuarios import permissoes
from cadastros.usuarios import views
from django.contrib.auth.views import PasswordChangeView, PasswordChangeDoneView


urlpatterns = [
    path('cadastrar-usuario/', views.cadastrar_usuario,
        name='cadastrarusuario', ),

    path('buscar-usuarios/', views.buscar_usuarios,
        name='buscarusuarios'),

    path('', views.cadastro_usuarios,
        name='usuarios', ),

    path('muda-status-usuario/', views.status_usuario,
        name='mudastatususuario'),

    path('cadastrar-permissao-usuario/', permissoes.cadastrar_permissao_usuario,
        name='cadastrarpermissaousuario',),

    path('buscar-permissao-usuario/', permissoes.buscar_permissao_usuario,
        name='buscarpermissaousuario'),

    path('buscar-permissoes-usuarios/', permissoes.buscar_permissoes_usuarios,
        name='buscarpermissoesusuarios'),

    path('muda-status-permissoes-usuario/', permissoes.status_permissoes_usuario,
        name='mudastatuspermissoesusuario'),

    path('muda-estilo-template/', views.muda_estilo_template, name='muda_estilo'),

    path('login/', views.LoginView.as_view(), name='login'),

    path('logout/', views.LogoutView.as_view(), name='logout'),

    path('mudar_senha/', PasswordChangeView.as_view(
        template_name='base/alterar_senha.html',
        success_url='concluido/'
    ), name="alterarsenha"),

    path('mudar_senha/concluido/', PasswordChangeDoneView.as_view(
        template_name='base/senha_alterada_com_sucesso.html'
    )),
]
