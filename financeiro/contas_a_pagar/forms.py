from django import forms
from .models import ContasPagar


class FormContasPagar(forms.ModelForm):
    class Meta:
        model = ContasPagar
        fields = (
            'favorecido',
            'forma_de_pagamento',
            'meio_de_pagamento',
            'quantidade_parcelas',
            'primeiro_vencimento',
            'valor_entrada',
            'observacoes_conta',
        )


class FormContas_Pagar(forms.ModelForm):
    class Meta:
        model = ContasPagar
        fields = ('quantidade_parcelas', 'status_conta', 'observacoes_conta',)
