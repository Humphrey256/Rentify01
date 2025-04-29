import os
import sys

# Add the current directory to the Python path
# This helps Python find your Django project's modules
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
print(f"Base directory added to Python path: {BASE_DIR}")
print(f"Current Python path: {sys.path}")