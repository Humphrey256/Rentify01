#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('manage')

def main():
    """Run administrative tasks."""
    # Force development mode and HTTP protocol
    os.environ['DEBUG'] = 'True'
    os.environ['HTTPS'] = 'off'
    os.environ['wsgi.url_scheme'] = 'http'
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'
    
    # Set the correct path to the settings module
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
    
    logger.info("Starting Django with DEBUG=True and HTTP mode")
    
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
        
    # Check for runserver command and add options to force insecure mode
    if len(sys.argv) > 1 and sys.argv[1] == 'runserver':
        logger.info("Running development server in insecure mode")
        if '--insecure' not in sys.argv:
            sys.argv.append('--insecure')
            
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
