import os
import sys
from django.core.wsgi import get_wsgi_application

# Debug information
print("WSGI.py is being executed")
print(f"Python version: {sys.version}")
print(f"Current working directory: {os.getcwd()}")
print(f"DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE', 'Not set')}")

# Explicitly set the path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)
    print(f"Added {BASE_DIR} to Python path")

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backends.settings')
print(f"After setting: DJANGO_SETTINGS_MODULE={os.environ.get('DJANGO_SETTINGS_MODULE')}")

try:
    application = get_wsgi_application()
    print("WSGI application loaded successfully")
except Exception as e:
    print(f"Error loading WSGI application: {str(e)}")
    import traceback
    traceback.print_exc()
    raise
