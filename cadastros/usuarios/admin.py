# -*- encoding: utf-8 -*-
from django.contrib import admin
from .models import Permissoes, Usuarios

admin.site.register(Permissoes)
admin.site.register(Usuarios)

