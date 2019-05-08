from django import forms
from .models import TabelaPrecos, Produtos, PrecosPomocionais, ImagensProdutos, Marcas, Categorias


class FormTabelaPrecos(forms.ModelForm):

    class Meta:
        model = TabelaPrecos
        fields = (
            'cliente',
            'produto',
            'percentual',
            'preco_venda',
            'observacoes_preco',
        )


class FormPrecosPomocionais(forms.ModelForm):

    class Meta:
        model = PrecosPomocionais
        fields = (
            'produto_promocao',
            'percentual_desconto',
            'preco_venda_promocao',
            'observacoes_promocao',
            'inicio_promocao',
            'fim_promocao',
        )


class FormCadastroProduto(forms.ModelForm):

    class Meta:
        model = Produtos
        fields = (
            'codigo_barras',
            'descricao_simplificada',
            'descricao_completa',
            'unidade_medida',
            'categoria_produto',
            'estoque_minimo',
            'estoque_maximo',
            'fracionar_produto',
            'id_embalagem_fechada',
            'quantidade_embalagem_fechada',
            'percentual_lucro',
            'desconto_maximo',
            'atacado_apartir',
            'atacado_desconto',
            'marca_produto',
            'observacoes',
            'marketing',
        )


class FormImagemProduto(forms.ModelForm):

    class Meta:
        model = Produtos
        fields = (
            'imagem',
        )


class FormImagemProdutos(forms.ModelForm):
    class Meta:
        model = ImagensProdutos
        fields = (
            'imagem',
            'sequencia',
        )


class FormCategorias(forms.ModelForm):
    class Meta:
        model = Categorias
        fields = '__all__'


class FormMarcas(forms.ModelForm):
    class Meta:
        model = Marcas
        fields = '__all__'

