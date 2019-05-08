# -*- encoding: utf-8 -*-
from django.db import models
from cadastros.empresas.models import Empresas
from financeiro.contas_a_pagar.models import ContasPagar
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class PagamentosPagos(models.Model):
    data_pagamento = models.DateField(blank=True, null=True)
    data_vencimento = models.DateField(blank=True, null=True)
    valor_pagamento = models.DecimalField(max_digits=15, decimal_places=2)
    status_pagamento = models.CharField(max_length=20, blank=False,
                                        choices=(('PENDENTE', 'PENDENTE'),
                                                 ('PAGO', 'PAGO'),
                                                 ('PARCIALMENTE PAGO', 'PARCIALMENTE PAGO'),
                                                 ('CANCELADO', 'CANCELADO')
                                                 ))
    meio_pagamento = models.CharField(max_length=15, blank=False,
                                      choices=(('DINHEIRO', 'DINHEIRO'),
                                               ('CARTAO DEBITO', 'CARTAO DEBITO'),
                                               ('CARTAO CREDITO', 'CARTAO CREDITO'),
                                               ('CHEQUE', 'CHEQUE'),
                                               ('OUTROS', 'OUTROS')
                                               ))
    observacoes_pagamento = models.CharField(max_length=200, blank=True)
    conta = models.ForeignKey(ContasPagar, on_delete=models.CASCADE)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('data_vencimento', 'valor_pagamento')
        db_table = 'pagamentos_pagos'

    def __str__(self):
        data_vencimento = self.data_vencimento.strftime('%d/%m/%Y')
        valor_pagamento = '%0.02f' % self.valor_pagamento
        return '%s - %s (%s)' % (valor_pagamento, self.status_pagamento, data_vencimento)

