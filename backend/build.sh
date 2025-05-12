#!/bin/bash
# Exit on error
set -o errexit

# Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create default images
python create_default_images.py

# Collect static files
python manage.py collectstatic --no-input
