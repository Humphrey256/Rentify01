# Generated by Django 5.1.7 on 2025-04-11 10:03

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('rentals_app', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='rental',
            old_name='available',
            new_name='is_available',
        ),
    ]
