import os
import shutil
import requests
import django
from pathlib import Path

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backends.settings')
django.setup()

from django.conf import settings
from rentals_app.models import Rental

# Create media directories if they don't exist
media_dir = os.path.join(settings.BASE_DIR, 'media')
rentals_dir = os.path.join(media_dir, 'rentals')
os.makedirs(rentals_dir, exist_ok=True)

# Default placeholder image URL
PLACEHOLDER_URL = "https://via.placeholder.com/600x400?text=Product+Image"

# List of expected image filenames
expected_images = [
    'bugatti.jpg',
    'lawn_moer.jpg',
    'lambogini.jpg',
    'dodge_challenger.jpg',
    'electric_driller.jpg',
    'kia_seltos.jpg',
    'harrier.jpg',
    'mini_power_generator.jpg',
    'vitz.jpg',
    'range_rover_spot.jpg',
]

def download_placeholder(filename):
    """Download a placeholder image and save it with the given filename"""
    filepath = os.path.join(rentals_dir, filename)
    print(f"Downloading placeholder for {filename}...")
    
    try:
        response = requests.get(PLACEHOLDER_URL, stream=True)
        if response.status_code == 200:
            with open(filepath, 'wb') as f:
                shutil.copyfileobj(response.raw, f)
            print(f"Created {filepath}")
            return True
        else:
            print(f"Failed to download placeholder image: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error downloading placeholder: {str(e)}")
        return False

def main():
    # Check for missing images and create placeholders
    for image_name in expected_images:
        filepath = os.path.join(rentals_dir, image_name)
        if not os.path.exists(filepath):
            success = download_placeholder(image_name)
            if not success:
                print(f"Failed to create placeholder for {image_name}")
    
    # Update database records with correct image paths if needed
    for rental in Rental.objects.all():
        if rental.image and not os.path.exists(os.path.join(settings.MEDIA_ROOT, rental.image.name)):
            # Extract just the filename from the image path
            filename = os.path.basename(rental.image.name)
            rental.image = f'rentals/{filename}'
            rental.save()
            print(f"Updated image path for {rental.name}")

if __name__ == "__main__":
    main()
    print("Image setup complete")
