# -*- coding: utf-8 -*-
# Generated by Django 1.11.14 on 2018-10-25 19:34
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('produtos', '0006_auto_20181025_1908'),
    ]

    operations = [
        migrations.AlterField(
            model_name='produtos',
            name='marketing',
            field=models.CharField(blank=True, default=b'', max_length=500),
        ),
    ]
