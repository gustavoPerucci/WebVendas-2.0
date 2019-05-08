# -*- coding: utf-8 -*-
from django.db import models
from cadastros.empresas.models import Empresas
from django.utils.encoding import python_2_unicode_compatible


@python_2_unicode_compatible  # esta linha somente e necessario quando usado python2.x
class Colaboradores(models.Model):
    nome = models.CharField('Nome', max_length=30, unique=False, blank=False)
    sobre_nome = models.CharField('Sobre nome', max_length=50, unique=False, blank=False)
    rg = models.CharField('Rg', max_length=15, blank=True, unique=False)
    cpf = models.CharField('Cpf', max_length=15, blank=True, unique=False)
    telefone = models.CharField('Telefone', max_length=30, blank=True)
    celular = models.CharField('Celular', max_length=30, blank=True)
    email = models.EmailField('E-mail', max_length=30, blank=True)
    data_nascimento = models.DateField('Data nascimento', blank=False)
    estado_civil = models.CharField('Estado civil', max_length=15, choices=(
        ('SOLTEIRO', 'SOLTEIRO'),
        ('CASADO', 'CASADO'),
        ('UNIAO ESTAVEL', 'UNIAO ESTAVEL'),
        ('DIVORCIADO', 'DIVORCIADO'),
        ('SEPARADO', 'SEPARADO'),
        ('OUTROS', 'OUTROS'),
    ))
    sexo = models.CharField('Sexo', max_length=10, choices=(
        ('MASCULINO', 'MASCULINO'),
        ('FEMININO', 'FEMININO'),
        ('OUTROS', 'OUTROS'),
    ))
    cep = models.CharField('CEP', max_length=10, blank=True)
    endereco = models.CharField('Endereço', max_length=50, blank=True)
    numero = models.CharField(max_length=10, blank=True)
    complemento = models.CharField(max_length=30, blank=True)
    bairro = models.CharField('Bairro', max_length=50, unique=False, blank=True)
    cidade = models.CharField('Cidade', max_length=50, unique=False, blank=True)
    estado = models.CharField('Estado', max_length=2, blank=True)
    status = models.CharField('Státus', max_length=10, default='ATIVO', blank=False, choices=(
        ('ATIVO', 'ATIVO'),
        ('INATIVO', 'INATIVO'),
        ('EXCLUIDO', 'EXCLUIDO'),
        ('AFASTADO', 'AFASTADO'),
        ('APOSENTADO', 'APOSENTADO'),
        ('DEMITIDO', 'DEMITIDO'),
    ))
    observacoes = models.TextField('Observações', max_length=200, blank=True)
    empresa = models.ForeignKey(Empresas, blank=True, null=True, on_delete=models.CASCADE)
    data_registro = models.DateTimeField(auto_now_add=True)
    data_alteracao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome

    class Meta:
        db_table = 'colaboradores'
        ordering = ('nome',)
