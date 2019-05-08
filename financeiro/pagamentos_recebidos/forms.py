from django import forms
from .models import PagamentosRecebidos


class FormPagamentosRecebidos(forms.ModelForm):
    class Meta:
        model = PagamentosRecebidos
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
        model = PagamentosRecebidos
        fields = ()
