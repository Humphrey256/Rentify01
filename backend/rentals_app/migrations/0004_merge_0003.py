# Generated manually

from django.db import migrations

class Migration(migrations.Migration):
    """
    This migration merges the conflicting migrations:
    - 0003_alter_rental_image
    - 0003_update_rental_image_paths
    """
    dependencies = [
        ('rentals_app', '0003_alter_rental_image'),
        ('rentals_app', '0003_update_rental_image_paths'),
    ]

    operations = [
        # No operations needed, this just merges the migration history
    ]
