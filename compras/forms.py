from django import forms
from .models import Compras, EntradaProdutos


class FormCompras(forms.ModelForm):

    class Meta:
        model = Compras
        fields = (
            'fornecedor',
            'solicitante',
            'data_compra',
            'nota_fiscal',
            'valor_total',
            'observacoes',
        )


class FormEntradaProdutos(forms.ModelForm):

    class Meta:
        model = EntradaProdutos
        fields = (
            'compra',
            'produto',
            'quantidade',
            'preco_compra',
            'data_entrada',
            'data_fabricacao',
            'data_validade',
            'numero_lote',
            'total',
            'observacoes_entrada',
        )



