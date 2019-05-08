from django import forms
from cadastros.fornecedores.models import Fornecedores


class FormCadastroFornecedores(forms.ModelForm):
    class Meta:
        model = Fornecedores
        fields = (
            'nome_razao_social',
            'sobre_nome',
            'rg_inscricao_estadual',
            'cpf_cnpj',
            'contato',
            'telefone',
            'celular',
            'email',
            'data_nascimento_fundacao',
            'estado_civil',
            'sexo',
            'cep',
            'endereco',
            'numero',
            'complemento',
            'bairro',
            'cidade',
            'estado',
            'status',
            'inscricao_municipal',
            'nome_fantasia',
        )
