from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.conf import settings

User = get_user_model()

class Command(BaseCommand):
    help = 'Creates fixed admin user accounts'

    def handle(self, *args, **kwargs):
        # Define multiple admin accounts with fixed credentials
        admin_users = [
            {
                'username': 'admin1',
                'email': 'admin1@rentify.com',
                'password': 'Admin123!',
            },
            {
                'username': 'admin2',
                'email': 'admin2@rentify.com',
                'password': 'Admin123!',
            },
            {
                'username': 'admin3',
                'email': 'admin3@rentify.com',
                'password': 'Admin123!',
            },
            # Add more admin users as needed
        ]
        
        for admin in admin_users:
            # Check if user already exists
            if User.objects.filter(email=admin['email']).exists():
                self.stdout.write(
                    self.style.WARNING(f"Admin user with email {admin['email']} already exists")
                )
                continue
                
            # Create the admin user
            user = User.objects.create_user(
                username=admin['username'],
                email=admin['email'],
                password=admin['password'],
                role='admin',  # Assuming your User model has this field
                is_staff=True,
                is_superuser=True,
                is_active=True
            )
            
            self.stdout.write(
                self.style.SUCCESS(f"Successfully created admin user: {admin['email']}")
            )