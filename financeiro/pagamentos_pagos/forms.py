from django import forms
from .models import PagamentosPagos


class FormPagamentosPagos(forms.ModelForm):
    class Meta:
        model = PagamentosPagos
        fields = (
            'data_pagamento',
            'data_vencimento',
            'valor_pagamento',
            'status_pagamento',
            'meio_pagamento',
            'observacoes_pagamento',
        )


class FormPagamentos(forms.ModelForm):
    class Meta:
        model = PagamentosPagos
        fields = ()

