from django.db import migrations
from decimal import Decimal
from django.core.files.base import ContentFile
import os

def populate_rentals(apps, schema_editor):
    # Get the Rental model from the app registry
    Rental = apps.get_model('rentals_app', 'Rental')
    
    # Define rentals based on the provided image names
    rentals = [
        {
            'name': 'Bugatti Luxury Supercar',
            'category': 'Car',
            'details': 'Experience the ultimate luxury and performance with this Bugatti supercar.',
            'price': Decimal('5000.00'),
            'is_available': True,
            'image': 'rentals/bugatti.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Dodge Challenger',
            'category': 'Car',
            'details': 'Classic American muscle car with powerful engine and iconic design.',
            'price': Decimal('1200.00'),
            'is_available': True,
            'image': 'rentals/dodge_challenger.jpg'  # This one was correct
        },
        {
            'name': 'Electric Drill',
            'category': 'Machine',
            'details': 'Professional-grade electric drill with multiple speed settings and attachments. Perfect for home improvement projects and construction work.',
            'price': Decimal('45.00'),
            'is_available': True,
            'image': 'rentals/electric driller.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Toyota Harrier SUV',
            'category': 'Car',
            'details': 'Reliable and comfortable Toyota Harrier SUV with spacious interior. Great for family trips and everyday driving with added convenience.',
            'price': Decimal('950.00'),
            'is_available': True,
            'image': 'rentals/harrier.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Kia Seltos',
            'category': 'Car',
            'details': 'Modern Kia Seltos with advanced features and fuel efficiency. Compact SUV perfect for both city driving and countryside exploration.',
            'price': Decimal('750.00'),
            'is_available': True,
            'image': 'rentals/kia seltos.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Lamborghini Supercar',
            'category': 'Car',
            'details': 'Breathtaking Lamborghini supercar with exhilarating performance and head-turning design. The ultimate driving experience for special occasions.',
            'price': Decimal('4500.00'),
            'is_available': True,
            'image': 'rentals/lambogini.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Lawn Mower',
            'category': 'Machine',
            'details': 'High-performance lawn mower for maintaining your garden with ease. Adjustable cutting height and efficient operation for all lawn sizes.',
            'price': Decimal('65.00'),
            'is_available': True,
            'image': 'rentals/lawn moer.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Mini Power Generator',
            'category': 'Machine',
            'details': 'Compact portable power generator for outdoor events, camping, or emergency backup. Fuel-efficient with multiple outlet options.',
            'price': Decimal('120.00'),
            'is_available': True,
            'image': 'rentals/mini power generator.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Toyota Vitz',
            'category': 'Car',
            'details': 'Economical Toyota Vitz with great fuel efficiency and easy maneuverability. Perfect for city driving and tight parking spaces.',
            'price': Decimal('550.00'),
            'is_available': True,
            'image': 'rentals/vitz.jpg'  # Added rentals/ prefix
        },
        {
            'name': 'Range Rover Sport',
            'category': 'Car',
            'details': 'Premium Range Rover Sport combining luxury, comfort and off-road capability. Feature-packed interior with sophisticated styling.',
            'price': Decimal('2200.00'),
            'is_available': True,
            'image': 'rentals/range rover spot.jpg'  # Added rentals/ prefix
        }
    ]
    
    # Create each rental
    for rental_data in rentals:
        if not Rental.objects.filter(name=rental_data['name']).exists():
            Rental.objects.create(**rental_data)

def reverse_migration(apps, schema_editor):
    # Code to reverse the migration if needed
    Rental = apps.get_model('rentals_app', 'Rental')
    Rental.objects.filter(name__in=[
        'Bugatti Luxury Supercar',
        'Dodge Challenger',
        'Electric Drill',
        'Toyota Harrier SUV',
        'Kia Seltos',
        'Lamborghini Supercar',
        'Lawn Mower',
        'Mini Power Generator',
        'Toyota Vitz',
        'Range Rover Sport'
    ]).delete()

class Migration(migrations.Migration):
    # Change this to depend on the rename migration
    dependencies = [
        ('rentals_app', '0002_rename_available_rental_is_available'),  # Updated dependency
    ]

    operations = [
        migrations.RunPython(populate_rentals, reverse_migration),
    ]