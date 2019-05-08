# -*- encoding: utf-8 -*-
from django.db import models
from cadastros.empresas.models import Empresas
from cadastros.fornecedores.models import Fornecedores
from estoque.produtos.models import Produtos
from financeiro.contas_a_pagar.models import ContasPagar
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Compras(models.Model):
    fornecedor = models.ForeignKey(Fornecedores, on_delete=models.CASCADE)
    solicitante = models.CharField(max_length=20, blank=False)
    data_compra = models.DateField()
    nota_fiscal = models.CharField(max_length=15)
    valor_total = models.DecimalField(max_digits=15, blank=False, decimal_places=2, default='0')
    pagamento = models.ForeignKey(ContasPagar, blank=True, null=True, on_delete=models.CASCADE)
    status_compra = models.CharField(max_length=30, blank=False, default='NAO LANCADO')
    observacoes = models.TextField(max_length=200, blank=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.fornecedor.nome_razao_social

    class Meta:
        ordering = ('-data_compra',)
        db_table = 'compras'


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class EntradaProdutos(models.Model):
    compra = models.ForeignKey(Compras, blank=True, null=True, on_delete=models.CASCADE)
    produto = models.ForeignKey(Produtos, blank=True, null=True, on_delete=models.CASCADE)
    quantidade = models.DecimalField(max_digits=15, blank=False, decimal_places=3)
    preco_compra = models.DecimalField(max_digits=15, blank=False, decimal_places=3, default='0')
    data_entrada = models.DateField()
    data_fabricacao = models.DateField(blank=True, null=True)
    data_validade = models.DateField(blank=True, null=True)
    numero_lote = models.CharField(max_length=20, default='0', blank=True)
    total = models.DecimalField(max_digits=15, blank=False, decimal_places=2, default='0')
    balanco = models.CharField(max_length=20, blank=False, default='ABERTO')
    status_entrada = models.CharField(max_length=15, blank=False, default='LANCADO')
    observacoes_entrada = models.TextField(max_length=200, blank=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.produto.descricao_simplificada

    class Meta:
        ordering = ('compra',)
        db_table = 'entrada_produtos'
