"""
This script uploads your media files to a GitHub repository
so they can be served via raw.githubusercontent.com

Instructions:
1. Create a GitHub repository (e.g., rentify01-images)
2. Generate a personal access token with repo permissions
3. Run this script
"""
import os
import json
import requests
from pathlib import Path
import base64
import hashlib
import time
import django
from django.conf import settings
import argparse

# Initialize Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backends.settings')
django.setup()

# Configuration
GITHUB_USERNAME = "hanningtonem"  # Change to your GitHub username
GITHUB_REPO = "rentify01-images"  # Change to your repo name
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN")  # Set this environment variable
MEDIA_DIR = settings.MEDIA_ROOT

def upload_to_github(file_path, github_path):
    """Upload a file to GitHub repository"""
    if not GITHUB_TOKEN:
        print("Error: GITHUB_TOKEN environment variable not set")
        return False
        
    api_url = f"https://api.github.com/repos/{GITHUB_USERNAME}/{GITHUB_REPO}/contents/{github_path}"
    
    with open(file_path, 'rb') as file:
        content = base64.b64encode(file.read()).decode('utf-8')
    
    # Check if file already exists
    headers = {
        "Authorization": f"token {GITHUB_TOKEN}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    try:
        response = requests.get(api_url, headers=headers)
        if response.status_code == 200:
            # File exists, update it
            sha = response.json()["sha"]
            data = {
                "message": f"Update {github_path}",
                "content": content,
                "sha": sha
            }
        else:
            # File doesn't exist, create it
            data = {
                "message": f"Add {github_path}",
                "content": content
            }
            
        response = requests.put(api_url, headers=headers, json=data)
        if response.status_code in [200, 201]:
            print(f"✅ Successfully uploaded {github_path}")
            return True
        else:
            print(f"❌ Failed to upload {github_path}: {response.status_code} {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error uploading {github_path}: {str(e)}")
        return False

def main():
    # Check rentals directory
    rentals_dir = os.path.join(MEDIA_DIR, 'rentals')
    if not os.path.exists(rentals_dir):
        print(f"Error: Rentals directory not found at {rentals_dir}")
        return
        
    # Create image map
    image_map = {}
    successful_uploads = 0
    
    for filename in os.listdir(rentals_dir):
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif')):
            file_path = os.path.join(rentals_dir, filename)
            if upload_to_github(file_path, filename):
                # Add to image map with raw GitHub URL
                image_map[filename] = f"https://raw.githubusercontent.com/{GITHUB_USERNAME}/{GITHUB_REPO}/main/{filename}"
                successful_uploads += 1
                # Avoid GitHub API rate limits
                time.sleep(1)
    
    # Save the image map to media-config.json
    config_file = os.path.join(settings.BASE_DIR, 'media-config.json')
    with open(config_file, 'w') as f:
        json.dump({"image_map": image_map}, f, indent=2)
    
    print(f"\nUploaded {successful_uploads} images to GitHub")
    print(f"Image map saved to {config_file}")
    print("\nEnsure to commit and push media-config.json to your repository")
    print(f"Raw GitHub URLs will be like: https://raw.githubusercontent.com/{GITHUB_USERNAME}/{GITHUB_REPO}/main/filename.jpg")

if __name__ == "__main__":
    main()
