# Generated by Django 5.0.4 on 2024-05-07 10:56

import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0008_alter_property_building_name'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='description',
            field=models.TextField(default=django.utils.timezone.now),
            preserve_default=False,
        ),
    ]
