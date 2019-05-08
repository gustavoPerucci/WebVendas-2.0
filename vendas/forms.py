from django import forms
from .models import Vendas, SaidaProdutos


class FormVendas(forms.ModelForm):

    class Meta:
        model = Vendas
        fields = (
            'cliente',
            'solicitante',
            'data_entrega',
            'observacoes',
            'cep',
            'endereco',
            'numero',
            'complemento',
            'bairro',
            'cidade',
            'estado',
            'observacoes_entrega',
        )


class FormSaidaProdutos(forms.ModelForm):

    class Meta:
        model = SaidaProdutos
        fields = (
            'venda',
            'produto',
            'quantidade',
            'valor_unitario',
            'percentual_desconto',
            'total_desconto',
            'valor_total',
            'observacoes_saida',
            'saldo_final',
        )


class FormSaidaProdutosAutomatica(forms.ModelForm):

    class Meta:
        model = SaidaProdutos
        fields = ()



