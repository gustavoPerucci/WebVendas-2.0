# -*- coding: utf-8 -*-
# Generated by Django 1.11.15 on 2018-11-08 11:56
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0010_auto_20181026_1133'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='imagensprodutos',
            options={'ordering': ['sequencia']},
        ),
        migrations.AlterField(
            model_name='imagensprodutos',
            name='imagem',
            field=models.ImageField(blank=True, null=True, upload_to=b'estoque/produtos/img/'),
        ),
        migrations.AlterField(
            model_name='produtos',
            name='imagem',
            field=models.ImageField(blank=True, default=b'', null=True, upload_to=b'estoque/produtos/img/'),
        ),
    ]