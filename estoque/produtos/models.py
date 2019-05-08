# -*- encoding: utf-8 -*-
from django.db import models
from cadastros.empresas.models import Empresas
from cadastros.clientes.models import Clientes
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Categorias(models.Model):
    descricao = models.CharField(max_length=100, blank=False)
    obs = models.TextField(blank=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.descricao

    class Meta:
        ordering = ('descricao',)
        db_table = 'categorias_produtos'


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Marcas(models.Model):
    descricao = models.CharField(max_length=100, blank=False)
    obs = models.TextField(blank=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.descricao

    class Meta:
        ordering = ('descricao',)
        db_table = 'marcas_produtos'


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Produtos(models.Model):
    descricao_simplificada = models.CharField(max_length=32, blank=False, unique=False, null=True)
    unidade_medida = models.CharField(max_length=10, blank=False)
    categoria_produto = models.ForeignKey(Categorias, on_delete=models.CASCADE)
    estoque_minimo = models.DecimalField(blank=False, max_digits=15, decimal_places=3, default='0.0')
    estoque_maximo = models.DecimalField(blank=False, max_digits=15, decimal_places=3, default='0.0')
    estoque_atual = models.DecimalField(blank=False, max_digits=15, decimal_places=3, default='0.0')
    fracionar_produto = models.CharField(max_length=5, blank=False)
    id_embalagem_fechada = models.IntegerField(blank=False, default='0')
    quantidade_embalagem_fechada = models.DecimalField(blank=False, max_digits=15, decimal_places=3, default='0')
    valor_compra = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default='0')
    percentual_lucro = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default='0')
    desconto_maximo = models.DecimalField(max_digits=5, blank=False, decimal_places=3, default='0')
    atacado_apartir = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default='0')
    atacado_desconto = models.DecimalField(max_digits=5, blank=False, decimal_places=3, default='0')
    status = models.CharField(max_length=20, blank=False, default='ATIVO')
    observacoes = models.TextField(max_length=200, blank=True)
    marketing = models.CharField(max_length=500, blank=True, null=False, default='')
    preco_venda = models.DecimalField(max_digits=15, blank=False, decimal_places=2, default='0')
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)
    empresa = models.ForeignKey(Empresas, null=True, blank=True, on_delete=models.CASCADE)
    marca_produto = models.ForeignKey(Marcas, on_delete=models.CASCADE)
    imagem = models.ImageField(null=True, blank=True, default='', upload_to='estoque/produtos/img/')
    codigo_barras = models.CharField(max_length=50, blank=True, null=False)
    anunciar_produto = models.IntegerField(default=0)
    descricao_completa = models.CharField(max_length=500, blank=True, null=True, unique=False)

    def __str__(self):
        return '000.'+str(self.pk)+' - '+str(self.descricao_simplificada)+' ('+str(self.unidade_medida) +\
               ' com '+("%.0f" % self.quantidade_embalagem_fechada)+')'

    class Meta:
        db_table = 'produtos'
        ordering = ('descricao_simplificada',)


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class TabelaPrecos(models.Model):
    cliente = models.ForeignKey(Clientes, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produtos, on_delete=models.CASCADE)
    percentual = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default=0)
    preco_venda = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default=0)
    observacoes_preco = models.TextField(max_length=200, blank=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)
    status_preco = models.CharField(max_length=10, blank=False, default='ATIVO')

    def __str__(self):
        return self.cliente

    class Meta:
        ordering = ('produto',)
        db_table = 'tabela_precos'


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class PrecosPomocionais(models.Model):
    produto_promocao = models.ForeignKey(Produtos, on_delete=models.CASCADE)
    percentual_desconto = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default=0)
    preco_venda_promocao = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default=0)
    inicio_promocao = models.DateField()
    fim_promocao = models.DateField()
    status_promocao = models.CharField(max_length=10, blank=False, default='ATIVO')
    observacoes_promocao = models.TextField(max_length=200, blank=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.produto_promocao

    class Meta:
        ordering = ('produto_promocao',)
        db_table = 'precos_promocionais'


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class ImagensProdutos(models.Model):
    imagem = models.ImageField(null=True, blank=True, upload_to='estoque/produtos/img/')
    empresa = models.ForeignKey(Empresas, null=True, blank=True, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produtos, on_delete=models.CASCADE)
    sequencia = models.IntegerField(default=0, blank=True, null=True)
    status = models.IntegerField(default=0, blank=True, null=True)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'imagens_produtos'
        ordering = ['sequencia']

    def __str__(self):
        return self.produto
