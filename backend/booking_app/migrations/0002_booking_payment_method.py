# Generated by Django 5.1.7 on 2025-03-26 10:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking_app', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='payment_method',
            field=models.CharField(default='Physical', max_length=50),
        ),
    ]
