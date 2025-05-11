from django.db import migrations
from django.contrib.auth.hashers import make_password

def create_admin_users(apps, schema_editor):
    # Use the historical User model
    User = apps.get_model('auth_app', 'User')
    
    # Same admin data as your command
    admin_users = [
        {
            'username': 'admin1',
            'email': 'admin1@rentify.com',
            'password': make_password('Admin123!'),  # Hash password directly
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        },
        {
            'username': 'admin2',
            'email': 'admin2@rentify.com',
            'password': make_password('Admin123!'),
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        },
        {
            'username': 'admin3',
            'email': 'admin3@rentify.com',
            'password': make_password('Admin123!'),
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True
        }
    ]
    
    for admin_data in admin_users:
        # Only create if user doesn't exist
        if not User.objects.filter(username=admin_data['username']).exists():
            User.objects.create(**admin_data)

# Function to reverse the migration if needed
def reverse_migration(apps, schema_editor):
    User = apps.get_model('auth_app', 'User')
    User.objects.filter(username__in=['admin1', 'admin2', 'admin3']).delete()

class Migration(migrations.Migration):
    # Make sure this dependency points to your latest migration
    dependencies = [
        ('auth_app', '0002_alter_user_options'),  # Update this to your latest migration
    ]

    operations = [
        migrations.RunPython(create_admin_users, reverse_migration),
    ]