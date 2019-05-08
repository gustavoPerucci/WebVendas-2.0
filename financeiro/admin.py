# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.contrib import admin
from django.contrib.admin.options import ModelAdmin, TabularInline
from cadastros.usuarios.models import Usuarios
from financeiro.contas_a_pagar.models import ContasPagar
from financeiro.contas_a_receber.models import ContasReceber
from financeiro.pagamentos_pagos.models import PagamentosPagos
from financeiro.pagamentos_recebidos.models import PagamentosRecebidos
from financeiro.contas_a_pagar.forms import FormContas_Pagar
from financeiro.contas_a_receber.forms import FormContas_Receber
from financeiro.pagamentos_pagos.forms import FormPagamentosPagos
from financeiro.pagamentos_recebidos.forms import FormPagamentosRecebidos


class InlinePagamentoPago(TabularInline):
    model = PagamentosPagos
    form = FormPagamentosPagos


class AdminContaPagar(ModelAdmin):
    form = FormContas_Pagar
    list_display = (
        'favorecido',
        'valor_conta',
        'descricao',
        'data_conta',
        'status_conta',
        'documento_vinculado',
        'observacoes_conta',

    )
    search_fields = ('descricao',)
    list_filter = (
        'data_conta',
        'status_conta',
    )

    inlines = [InlinePagamentoPago, ]
    date_hierarchy = 'data_conta'

    def queryset(self, request):
        usuario = Usuarios.objects.get(usuario=request.user.id)
        qs = super(AdminContaPagar, self).queryset(request)
        return qs.filter(empresa=usuario.empresa.id)

    def save_model(self, request, obj, form, change):
        usuario = Usuarios.objects.get(usuario=request.user.id)
        obj.empresa = usuario.empresa
        obj.save()


class InlinePagamentoRecebido(TabularInline):
    model = PagamentosRecebidos
    form = FormPagamentosRecebidos


class AdminContaReceber(ModelAdmin):
    form = FormContas_Receber
    list_display = (
        'agente_pagador',
        'valor_conta',
        'descricao',
        'data_conta',
        'status_conta',
        'meio_de_pagamento',
        'forma_de_pagamento',
        'observacoes_conta',
    )
    search_fields = ('descricao',)
    list_filter = (
        'data_conta',
        'status_conta',
    )

    inlines = [InlinePagamentoRecebido]
    date_hierarchy = 'data_conta'

    def queryset(self, request):
        usuario = Usuarios.objects.get(usuario=request.user.id)
        qs = super(AdminContaReceber, self).queryset(request)
        return qs.filter(empresa=usuario.empresa.id)

    def save_model(self, request, obj, form, change):
        usuario = Usuarios.objects.get(usuario=request.user.id)
        obj.empresa = usuario.empresa
        obj.save()


admin.site.register(ContasPagar, AdminContaPagar)
admin.site.register(ContasReceber, AdminContaReceber)



