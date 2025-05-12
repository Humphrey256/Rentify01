import os
import shutil
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backends.settings')
django.setup()

from django.conf import settings

def initialize_media():
    """Ensure media directories exist and are properly configured."""
    media_root = settings.MEDIA_ROOT
    rentals_dir = os.path.join(media_root, 'rentals')
    
    # Create directories if they don't exist
    os.makedirs(rentals_dir, exist_ok=True)
    
    print(f"Media root: {media_root}")
    print(f"Rentals directory: {rentals_dir}")
    
    # List existing media files
    print("\nExisting media files:")
    for root, _, files in os.walk(media_root):
        for file in files:
            print(f" - {os.path.join(os.path.relpath(root, media_root), file)}")
            
    print("\nMedia initialization complete")

if __name__ == "__main__":
    initialize_media()
