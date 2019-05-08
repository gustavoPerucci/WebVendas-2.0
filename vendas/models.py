# -*- encoding: utf-8 -*-
from django.db import models
from cadastros.empresas.models import Empresas
from cadastros.clientes.models import Clientes
from estoque.produtos.models import Produtos
from financeiro.contas_a_receber.models import ContasReceber
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Vendas(models.Model):
    id = models.AutoField(primary_key=True)
    cliente = models.ForeignKey(Clientes, on_delete=models.CASCADE)
    solicitante = models.CharField('Solicitante', max_length=50, blank=False)
    data_venda = models.DateField(auto_now_add=True)
    data_entrega = models.DateField()
    vencimento = models.DateField(auto_now_add=True)
    status_pedido = models.CharField('Státus do Pedido', max_length=30, blank=False, default='EM ANDAMENTO')
    valor_total = models.DecimalField('Valor total', max_digits=15, blank=False, decimal_places=2, default='0')
    desconto = models.DecimalField('Desconto', max_digits=15, blank=False, decimal_places=2, default='0')
    saldo_final = models.DecimalField('Saldo final', max_digits=15, blank=False, decimal_places=2, default='0')
    observacoes = models.TextField('Observações', max_length=200, blank=True)
    pagamento = models.ForeignKey(ContasReceber, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    cep = models.CharField('CEP', max_length=10, blank=True)
    endereco = models.CharField('Endereço', max_length=50, blank=True)
    numero = models.CharField(max_length=10, blank=True)
    complemento = models.CharField(max_length=30, blank=True)
    bairro = models.CharField('Bairro', max_length=50, blank=True)
    cidade = models.CharField('Cidade', max_length=50, blank=True)
    estado = models.CharField('Estado', max_length=2, blank=True)
    observacoes_entrega = models.TextField('Observações', max_length=200, blank=True)

    def __str__(self):
        return self.cliente.nome_razao_social + ' - ' + str(self.data_venda.strftime('%d/%m/%Y'))+' - Pedido: ' + \
               str(self.id)

    class Meta:
        db_table = 'vendas'
        ordering = ('-data_venda',)


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class SaidaProdutos(models.Model):
    venda = models.ForeignKey(Vendas, verbose_name="Nome/Razão social:", on_delete=models.CASCADE)
    produto = models.ForeignKey(Produtos, on_delete=models.CASCADE)
    quantidade = models.DecimalField('Quantidade', max_digits=15, blank=False, decimal_places=3)
    data_saida = models.DateField(auto_now_add=True)
    valor_unitario = models.DecimalField('Valor unitário', max_digits=15, blank=False, decimal_places=3, default='0')
    percentual_desconto = models.DecimalField('Desconto %', max_digits=15, blank=False, decimal_places=3, default='0')
    total_desconto = models.DecimalField('Desconto total', max_digits=15, blank=False, decimal_places=2, default='0')
    valor_total = models.DecimalField('Valor total', max_digits=15, blank=False, decimal_places=2, default='0')
    status = models.CharField('Státus', max_length=20, blank=False, default='AGUARDANDO',
                              choices=(
                                  ('EM SEPARACAO', 'EM SEPARACAO'),
                                  ('SEPARADO', 'SEPARADO'),
                                  ('ENTREGUE', 'ENTREGUE'),
                                  ('CANCELADO', 'CANCELADO')
                              ))
    balanco = models.CharField('Balanço', max_length=20, blank=False, default='ABERTO', choices=(
        ('ABERTO', 'ABERTO'),
        ('FECHADO', 'FECHADO')
    ))
    observacoes_saida = models.TextField('Observações', max_length=200, blank=True)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    saldo_final = models.DecimalField(max_digits=15, blank=False, decimal_places=2, default='0')

    def __str__(self):
        return self.produto.descricao_simplificada

    class Meta:
        db_table = 'saida_produtos'
        ordering = ('-data_saida',)
