# -*- coding: utf-8 -*-
from django.db import models
from cadastros.empresas.models import Empresas
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Fornecedores(models.Model):
    nome_razao_social = models.CharField('Nome', max_length=100, blank=False)
    cpf_cnpj = models.CharField('Cpf', max_length=20, blank=False)
    rg_inscricao_estadual = models.CharField('Rg ou inscição estadual', max_length=15, blank=True)
    telefone = models.CharField('Telefone', max_length=30, blank=True)
    celular = models.CharField('Celular', max_length=30, blank=True)
    contato = models.CharField('Contato', max_length=30, blank=True)
    email = models.EmailField('E-mail', blank=False, unique=True)
    status = models.CharField('Státus', max_length=10, default='ATIVO', blank=False,)
    endereco = models.CharField('Endereço', max_length=50, blank=True)
    bairro = models.CharField('Bairro', max_length=50, blank=True)
    cidade = models.CharField('Cidade', max_length=50, blank=False)
    cep = models.CharField('CEP', max_length=10, blank=True)
    estado = models.CharField('Estado', max_length=2, blank=False)
    observacoes = models.TextField('Observações', max_length=200, blank=True)
    sexo = models.CharField('Sexo', max_length=10, blank=True)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    pessoa = models.CharField('Pessoa', blank=False, max_length=10)
    numero = models.CharField(max_length=10, blank=True)
    complemento = models.CharField(max_length=30, blank=True)
    data_nascimento_fundacao = models.DateField('Data nascimento')
    estado_civil = models.CharField('Estado civil', max_length=15, blank=True)
    model_template = models.CharField(max_length=20, blank=True)
    sobre_nome = models.CharField('Sobre nome', max_length=100, blank=True)
    nome_fantasia = models.CharField('Nome fantasia', max_length=100, blank=True)
    inscricao_municipal = models.CharField('Rg ou inscição estadual', max_length=15, blank=True)

    def __str__(self):
        return '000' + str(self.id) + '-' + str(self.nome_razao_social)

    class Meta:
        db_table = 'fornecedores'
        ordering = ('nome_razao_social',)
