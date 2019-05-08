# -*- encoding: utf-8 -*-
from django.contrib import admin
from .models import Empresas, Planos

class AdminPlanos(admin.ModelAdmin):
    list_display = (
        'nome',
        'descricao',
        'valor',
        'desconto_maximo',
        'observacoes',
        'data_registro',
        'data_alteracao',
        )
admin.site.register(Planos, AdminPlanos)


class AdminEmpresas(admin.ModelAdmin):
    list_display = (
        'razao_social',
        'nome_fantasia',
        'cnpj',
        'inscricao_estadual',
        'inscricao_municipal',
        'contato',
        'telefone',
        'celular',
        'email',
        'site',
        'cep',
        'endereco',
        'numero',
        'complemento',
        'bairro',
        'cidade',
        'uf',
        'contato_cobranca',
        'telefone_cobranca',
        'celular_cobranca',
        'email_cobranca',
        'cep_cobranca',
        'endereco_cobranca',
        'numero_cobranca',
        'complemento_cobranca',
        'bairro_cobranca',
        'cidade_cobranca',
        'uf_cobranca',
        'dia_pagamento',
        'meio_pagamento',
        'forma_pagamento',
        'status',
        'plano',
        'data_inicio',
        'contrato',
        'observacoes',
        'data_registro',
        'data_alteracao',
        )
admin.site.register(Empresas, AdminEmpresas)
