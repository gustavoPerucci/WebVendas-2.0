from django import forms
from .models import ContasReceber


class FormContasReceber(forms.ModelForm):
    class Meta:
        model = ContasReceber
        fields = (
            'agente_pagador',
            'forma_de_pagamento',
            'meio_de_pagamento',
            'quantidade_parcelas',
            'primeiro_vencimento',
            'valor_entrada',
            'observacoes_conta',
        )


class FormContas_Receber(forms.ModelForm):
    class Meta:
        model = ContasReceber
        fields = ('quantidade_parcelas', 'status_conta', 'observacoes_conta',)
