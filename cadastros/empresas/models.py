# -*- encoding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Planos(models.Model):
    id = models.AutoField(primary_key=True)
    nome = models.CharField('Nome do plano', max_length=50, blank=False, unique=True)
    descricao = models.TextField('Descricao do plano', max_length=100, blank=True)
    valor = models.DecimalField('Valor', max_digits=15, blank=False, decimal_places=2, default='0')
    desconto_maximo = models.DecimalField('Desconto máximo %', max_digits=15, blank=False, decimal_places=2, default='0')
    observacoes = models.TextField('Observações', max_length=250, blank=True)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateField(auto_now=True)

    def __str__(self):
        return self.nome

    class Meta:
        db_table = 'planos'
        ordering = ('nome',)


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Empresas(models.Model):
    id = models.AutoField(primary_key=True)
    razao_social = models.CharField('Razão social', max_length=50, blank=True, unique=True)
    nome_fantasia = models.CharField('Nome Fantasia', max_length=50, blank=False, unique=True)
    cnpj = models.CharField('Cnpj', max_length=20, blank=True, unique=False)
    inscricao_estadual = models.CharField('Inscrição estadual', max_length=20, blank=True)
    inscricao_municipal = models.CharField('Inscrição municipal', max_length=20, blank=True)
    contato = models.CharField(max_length=30, blank=False)
    telefone = models.CharField(max_length=30, blank=False)
    celular = models.CharField(max_length=30, blank=True)
    email = models.EmailField('E-mail', blank=False)
    site = models.CharField(max_length=50, blank=False)
    cep = models.CharField(max_length=9, blank=True)
    endereco = models.CharField(max_length=40, blank=False)
    numero = models.CharField(max_length=10, blank=False)
    complemento = models.CharField(max_length=30, blank=True)
    bairro = models.CharField(max_length=50, blank=False)
    cidade = models.CharField(max_length=50, blank=False)
    uf = models.CharField(max_length=2, blank=False)
    contato_cobranca = models.CharField(max_length=30, blank=True)
    telefone_cobranca = models.CharField(max_length=30, blank=True)
    celular_cobranca = models.CharField(max_length=30, blank=True)
    email_cobranca = models.EmailField('E-mail cobrança', blank=False)
    cep_cobranca = models.CharField(max_length=9, blank=True)
    endereco_cobranca = models.CharField(max_length=40, blank=True)
    numero_cobranca = models.CharField(max_length=10, blank=True)
    complemento_cobranca = models.CharField(max_length=30, blank=True)
    bairro_cobranca = models.CharField(max_length=50, blank=True)
    cidade_cobranca = models.CharField(max_length=50, blank=True)
    uf_cobranca = models.CharField(max_length=2, blank=True)
    dia_pagamento = models.IntegerField(blank=True, null=True)
    plano = models.ForeignKey(Planos, on_delete=models.CASCADE)
    desconto = models.DecimalField('Percentual desconto %', max_digits=4, blank=False, decimal_places=2, default='0')
    forma_pagamento = models.CharField('Forma pagamento', max_length=20, blank=False, choices=(
        ('A VISTA', 'A VISTA'),
        ('PARCELADO', 'PARCELADO'),
        ('GRATUIDADE', 'GRATUIDADE'),
    ))
    meio_pagamento = models.CharField('Meio de pagamento', max_length=20, blank=False, choices=(
        ('BOLETO BANCARIO', 'BOLETO BANCARIO'),
        ('DINHEIRO EM ESPECIE', 'DINHEIRO EM ESPECIE'),
        ('DEPOSITO EM CONTA', 'DEPOSITO EM CONTA'),
        ('CARTAO DE CREDITO', 'CARTAO DE CREDITO'),
        ('CARTAO DE DEBITO', 'CARTAO DE DEBITO'),
        ('DEBITO EM CONTA', 'DEBITO EM CONTA'),
        ('GRATUIDADE', 'GRATUIDADE'),
        ('OUTROS', 'OUTROS'),
    ))
    status = models.CharField('Státus', max_length=20, blank=False, choices=(
        ('ATIVO', 'ATIVO'),
        ('INATIVO', 'INATIVO'),
        ('SUSPENSO', 'SUSPENSO'),
        ('EXCLUIDO', 'EXCLUIDO'),
        ('NEGATIVADO', 'NEGATIVADO'),
    ))
    data_inicio = models.DateField(blank=True, null=True)
    contrato = models.CharField('Contrato', max_length=30, blank=True)
    observacoes = models.TextField(max_length=250, blank=True)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome_fantasia

    class Meta:
        db_table = 'empresas'
        ordering = ('nome_fantasia',)


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class EmpresaResponsaveis(models.Model):
    id = models.AutoField(primary_key=True)
    empresa = models.ForeignKey(Empresas, on_delete=models.DO_NOTHING)
    usuario = models.ForeignKey(User, on_delete=models.DO_NOTHING)
    observacoes = models.TextField(max_length=250, blank=True)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.empresa

    class Meta:
        db_table = 'empresas_responsaveis'
        ordering = ('empresa',)
