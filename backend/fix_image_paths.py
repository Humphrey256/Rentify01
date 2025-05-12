import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backends.settings')
django.setup()

from rentals_app.models import Rental

# Find and update incorrect image paths
lamborghini_rentals = Rental.objects.filter(name__icontains='Lamborghini')
for rental in lamborghini_rentals:
    if 'lambogini.jpg' in rental.image.name:
        print(f"Fixing image path for: {rental.name}")
        # Check if the file exists with alternative spelling
        if os.path.exists('media/rentals/lamborghini.jpg'):
            rental.image = 'rentals/lamborghini.jpg'
        else:
            rental.image = 'rentals/bugatti.jpg'  # Fallback to existing image
        rental.save()

kia_rentals = Rental.objects.filter(name__icontains='Kia')
for rental in kia_rentals:
    if 'kia_seltos.jpg' in rental.image.name:
        print(f"Fixing image path for: {rental.name}")
        # Check if file exists with alternative spelling
        if os.path.exists('media/rentals/kia seltos.jpg'):
            rental.image = 'rentals/kia seltos.jpg'  # Note the space instead of underscore
        else:
            rental.image = 'rentals/harrier.jpg'  # Fallback to existing image
        rental.save()

print("Image path correction complete")
