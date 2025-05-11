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
            'category': 'Car',  # Changed to Car
            'details': 'Experience the ultimate luxury and performance with this Bugatti supercar. Perfect for special events, photoshoots, or experiencing the pinnacle of automotive engineering.',
            'price': Decimal('5000.00'),
            'is_available': True,
            'image': 'products/bugatti.jpg'
        },
        {
            'name': 'Dodge Challenger',
            'category': 'Car',  # Changed to Car
            'details': 'Classic American muscle car with powerful engine and iconic design. Ideal for weekend adventures and making a statement on the road.',
            'price': Decimal('1200.00'),
            'is_available': True,
            'image': 'products/dodge challenger.jpg'
        },
        {
            'name': 'Electric Drill',
            'category': 'Machine',  # Changed to Machine
            'details': 'Professional-grade electric drill with multiple speed settings and attachments. Perfect for home improvement projects and construction work.',
            'price': Decimal('45.00'),
            'is_available': True,
            'image': 'products/electric driller.jpg'
        },
        {
            'name': 'Toyota Harrier SUV',
            'category': 'Car',  # Changed to Car
            'details': 'Reliable and comfortable Toyota Harrier SUV with spacious interior. Great for family trips and everyday driving with added convenience.',
            'price': Decimal('950.00'),
            'is_available': True,
            'image': 'products/harrier.jpg'
        },
        {
            'name': 'Kia Seltos',
            'category': 'Car',  # Changed to Car
            'details': 'Modern Kia Seltos with advanced features and fuel efficiency. Compact SUV perfect for both city driving and countryside exploration.',
            'price': Decimal('750.00'),
            'is_available': True,
            'image': 'products/kia seltos.jpg'
        },
        {
            'name': 'Lamborghini Supercar',
            'category': 'Car',  # Changed to Car
            'details': 'Breathtaking Lamborghini supercar with exhilarating performance and head-turning design. The ultimate driving experience for special occasions.',
            'price': Decimal('4500.00'),
            'is_available': True,
            'image': 'products/lambogini.jpg'
        },
        {
            'name': 'Lawn Mower',
            'category': 'Machine',  # Changed to Machine
            'details': 'High-performance lawn mower for maintaining your garden with ease. Adjustable cutting height and efficient operation for all lawn sizes.',
            'price': Decimal('65.00'),
            'is_available': True,
            'image': 'products/lawn moer.jpg'
        },
        {
            'name': 'Mini Power Generator',
            'category': 'Machine',  # Changed to Machine
            'details': 'Compact portable power generator for outdoor events, camping, or emergency backup. Fuel-efficient with multiple outlet options.',
            'price': Decimal('120.00'),
            'is_available': True,
            'image': 'products/mini power generator.jpg'
        },
        {
            'name': 'Toyota Vitz',
            'category': 'Car',  # Changed to Car
            'details': 'Economical Toyota Vitz with great fuel efficiency and easy maneuverability. Perfect for city driving and tight parking spaces.',
            'price': Decimal('550.00'),
            'is_available': True,
            'image': 'products/vitz.jpg'
        },
        {
            'name': 'Range Rover Sport',
            'category': 'Car',  # Changed to Car
            'details': 'Premium Range Rover Sport combining luxury, comfort and off-road capability. Feature-packed interior with sophisticated styling.',
            'price': Decimal('2200.00'),
            'is_available': True,
            'image': 'products/range rover spot.jpg'
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
    # Make sure this depends on your latest migration in rentals_app
    dependencies = [
        ('rentals_app', '0001_initial'),  # Update if you have a different migration number
    ]

    operations = [
        migrations.RunPython(populate_rentals, reverse_migration),
    ]