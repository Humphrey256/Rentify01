import os

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1']
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Add this to handle long-running requests
import socket
from django.core.servers.basehttp import WSGIServer

class CustomWSGIServer(WSGIServer):
    timeout = 120  # Increase timeout to 120 seconds

WSGIServer = CustomWSGIServer
