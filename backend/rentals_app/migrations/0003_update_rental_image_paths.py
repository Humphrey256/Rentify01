# Generated manually

from django.db import migrations
from django.conf import settings
import os, shutil

def normalize_image_paths(apps, schema_editor):
    """
    Ensure all rental images have consistent paths under 'rentals/' directory
    """
    Rental = apps.get_model('rentals_app', 'Rental')
    
    # Expected image filenames for our core products
    expected_images = {
        'bugatti.jpg': 'bugatti.jpg',
        'lawn_moer.jpg': 'lawn_moer.jpg', 
        'lambogini.jpg': 'lambogini.jpg',
        'dodge_challenger.jpg': 'dodge_challenger.jpg',
        'electric_driller.jpg': 'electric_driller.jpg',
        'kia_seltos.jpg': 'kia_seltos.jpg',
        'harrier.jpg': 'harrier.jpg',
        'mini_power_generator.jpg': 'mini_power_generator.jpg',
        'vitz.jpg': 'vitz.jpg',
        'range_rover_spot.jpg': 'range_rover_spot.jpg',
    }
    
    # Create rentals directory if it doesn't exist
    media_root = getattr(settings, 'MEDIA_ROOT', '')
    rentals_dir = os.path.join(media_root, 'rentals')
    os.makedirs(rentals_dir, exist_ok=True)
    
    # Process each rental
    for rental in Rental.objects.all():
        if not rental.image:
            continue
            
        # Extract just the filename
        # Handle both string and FileField types
        if hasattr(rental.image, 'name'):
            filename = os.path.basename(rental.image.name)
            current_path = rental.image.name
        else:
            # If image is just a string path
            filename = os.path.basename(str(rental.image))
            current_path = str(rental.image)
        
        # If filename is in our expected images, ensure it's in rentals/
        if filename in expected_images:
            # Normalize the path to be 'rentals/filename.jpg'
            new_path = f'rentals/{filename}'
            
            # Only update if different
            if current_path != new_path:
                print(f"Updating image path for {rental.name}: {current_path} -> {new_path}")
                rental.image = new_path
                rental.save()

def reverse_func(apps, schema_editor):
    pass  # No reverse operation needed

class Migration(migrations.Migration):

    dependencies = [
        ('rentals_app', '0002_rename_available_rental_is_available'),
    ]

    operations = [
        migrations.RunPython(normalize_image_paths, reverse_func),
    ]
