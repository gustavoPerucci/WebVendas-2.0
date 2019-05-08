from django import forms
from .models import Colaboradores


class FormCadastroColaboradores(forms.ModelForm):
    class Meta:
        model = Colaboradores
        fields = (
            'nome',
            'sobre_nome',
            'rg',
            'cpf',
            'telefone',
            'celular',
            'email',
            'data_nascimento',
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
        )
