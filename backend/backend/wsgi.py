"""
WSGI config for backend project.

It exposes the WSGI callable as a module-level variable named ``application``.
"""

import os
import sys
import logging
from django.core.wsgi import get_wsgi_application

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('wsgi')
logger.info("Initializing WSGI application")

# Add the project directory to the Python path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BASE_DIR)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# Get the base WSGI application
base_application = get_wsgi_application()

# Create a wrapper application that logs all requests and forces HTTP
def application(environ, start_response):
    # Log the incoming request
    path_info = environ.get('PATH_INFO', '')
    logger.info(f"Processing request: {path_info}")
    
    # Force HTTP protocol in development
    if os.environ.get('DEBUG', 'True') == 'True':
        environ['wsgi.url_scheme'] = 'http'
        
        # Check and fix HTTPS indicator headers
        if environ.get('HTTP_X_FORWARDED_PROTO') == 'https':
            environ['HTTP_X_FORWARDED_PROTO'] = 'http'
            
        if environ.get('HTTP_X_FORWARDED_SSL') == 'on':
            environ['HTTP_X_FORWARDED_SSL'] = 'off'
    
    # Call the base Django application
    return base_application(environ, start_response)
