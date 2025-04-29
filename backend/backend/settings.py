import os
from pathlib import Path
from dotenv import load_dotenv
import socket
from django.core.servers.basehttp import WSGIServer
import logging
from datetime import timedelta
import dj_database_url
from django.http import HttpResponseRedirect

# Configure logging at the top to catch early issues
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('django')
logger.info("Starting settings.py")

# Define middleware classes at the top level
class SSLRedirectMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        
    def __call__(self, request):
        # Check for HTTPS requests in development mode
        if DEBUG:
            https_flags = [
                request.META.get('HTTP_X_FORWARDED_PROTO') == 'https',
                request.META.get('wsgi.url_scheme') == 'https',
                request.is_secure(),
                request.META.get('SERVER_PORT') == '443',
                request.META.get('HTTP_X_FORWARDED_SSL') == 'on',
                request.META.get('HTTPS') == 'on'
            ]
            
            if any(https_flags):
                logger.warning(f"Detected HTTPS request in development for {request.path}, redirecting to HTTP")
                url = request.build_absolute_uri()
                url = url.replace('https://', 'http://')
                response = HttpResponseRedirect(url)
                response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
                return response
                
        return self.get_response(request)

# Load environment variables
load_dotenv()
logger.info("Environment variables loaded")

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')
DEBUG = os.getenv('DEBUG', 'True').lower() in ('true', '1', 't', 'yes')

# Always force debug mode during development to ensure HTTP
IS_LOCAL = (socket.gethostname().startswith(('localhost', '127.0.0.1')) or 
           os.environ.get('ENV') == 'development' or
           'RENDER' not in os.environ)

if IS_LOCAL:
    DEBUG = True
    logger.info("Local environment detected, forcing DEBUG=True")

# ALLOWED_HOSTS configuration
ALLOWED_HOSTS = ['*']  # Allow all hosts for development
logger.info(f"ALLOWED_HOSTS: {ALLOWED_HOSTS}")

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third-party
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'oauth2_provider',
    'social_django',
    # 'drf_social_oauth2',  # Temporarily commented out
    'rest_framework_simplejwt.token_blacklist',

    # Local apps
    'auth_app',
    'rentals_app',
    'registration_app',
    'booking_app',
    'reviews_app',
    'issues_app',
    'notifications_app',
]

# Our SSL middleware needs to be first to catch any HTTPS requests
MIDDLEWARE = [
    'backend.settings.SSLRedirectMiddleware',  # Custom SSL redirect must be first
    'corsheaders.middleware.CorsMiddleware',   # CORS headers should be early
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'social_django.middleware.SocialAuthExceptionMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, '..', 'frontend', 'build')],  # Look for templates in React build
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Custom WSGI timeout
class CustomWSGIServer(WSGIServer):
    timeout = 120
WSGIServer = CustomWSGIServer

# Database configuration
DB_TYPE = os.getenv('DB_TYPE', 'sqlite').lower()

if DB_TYPE == 'postgresql':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': os.getenv('DB_NAME', 'rentify'),
            'USER': os.getenv('DB_USER', 'postgres'),
            'PASSWORD': os.getenv('DB_PASSWORD', 'postgres'),
            'HOST': os.getenv('DB_HOST', 'localhost'),
            'PORT': os.getenv('DB_PORT', '5432'),
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

DATABASE_URL = os.getenv('DATABASE_URL')
if DATABASE_URL:
    DATABASES['default'] = dj_database_url.parse(DATABASE_URL)

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static and media files configuration
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Add frontend build directory to STATICFILES_DIRS
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, '..', 'frontend', 'build', 'static'),
    os.path.join(BASE_DIR, '..', 'frontend', 'build', 'dist'),
]

# Create directories if they don't exist
os.makedirs(os.path.join(BASE_DIR, 'staticfiles'), exist_ok=True)
os.makedirs(os.path.join(BASE_DIR, '..', 'frontend', 'build', 'dist'), exist_ok=True)

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
os.makedirs(MEDIA_ROOT, exist_ok=True)

# Whitenoise configuration - use a simpler storage for development
STATICFILES_STORAGE = 'whitenoise.storage.CompressedStaticFilesStorage'

# Additional directory for serving non-static files from the React build
WHITENOISE_ROOT = os.path.join(BASE_DIR, '..', 'frontend', 'build')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.10.162.38:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'https://rentify01-yfnu.onrender.com',
    'https://rentify01-1.onrender.com',
]

# For development, allow all origins
CORS_ALLOW_ALL_ORIGINS = DEBUG

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]

# Allow credentials for requests
CORS_ALLOW_CREDENTIALS = True

# Additional CORS headers for debugging
CORS_EXPOSE_HEADERS = ['Content-Type', 'X-Requested-With', 'Authorization']

# Allow all headers
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

CSRF_TRUSTED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost:8000',
    'http://127.0.0.1:8000',
    'http://10.10.162.38:3000',
    'https://rentify01-yfnu.onrender.com',
    'https://rentify01-1.onrender.com',
]

# Django REST framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',  # Add session auth for browser testing
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'rest_framework.parsers.JSONParser',
        'rest_framework.parsers.FormParser',
        'rest_framework.parsers.MultiPartParser',
    ),
    'EXCEPTION_HANDLER': 'rest_framework.views.exception_handler',
}

# Authentication backends
AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    'social_core.backends.github.GithubOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

# OAuth credentials
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('GOOGLE_OAUTH2_KEY', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_OAUTH2_SECRET', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = ['email', 'profile']

SOCIAL_AUTH_FACEBOOK_KEY = os.getenv('FACEBOOK_KEY', '')
SOCIAL_AUTH_FACEBOOK_SECRET = os.getenv('FACEBOOK_SECRET', '')
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {'fields': 'id, name, email'}

SOCIAL_AUTH_GITHUB_KEY = os.getenv('GITHUB_KEY', '')
SOCIAL_AUTH_GITHUB_SECRET = os.getenv('GITHUB_SECRET', '')
SOCIAL_AUTH_GITHUB_SCOPE = ['user:email']

# OAuth2 pipeline and redirect URLs
SOCIAL_AUTH_PIPELINE = (
    'social_core.pipeline.social_auth.social_details',
    'social_core.pipeline.social_auth.social_uid',
    'social_core.pipeline.social_auth.auth_allowed',
    'social_core.pipeline.social_auth.social_user',
    'social_core.pipeline.user.get_username',
    'social_core.pipeline.user.create_user',
    'social_core.pipeline.social_auth.associate_user',
    'social_core.pipeline.social_auth.load_extra_data',
    'social_core.pipeline.user.user_details',
    'auth_app.views.oauth_redirect',
)

# Dynamic OAuth redirect URLs based on environment
if DEBUG:
    # Development URLs
    SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://localhost:3000/auth-success'
    SOCIAL_AUTH_LOGIN_ERROR_URL = 'http://localhost:3000/login'
    SOCIAL_AUTH_NEW_USER_REDIRECT_URL = 'http://localhost:3000/register-success'
    SOCIAL_AUTH_REDIRECT_IS_HTTPS = False
else:
    # Production URLs
    SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'https://rentify01-yfnu.onrender.com/auth-success'
    SOCIAL_AUTH_LOGIN_ERROR_URL = 'https://rentify01-yfnu.onrender.com/login'
    SOCIAL_AUTH_NEW_USER_REDIRECT_URL = 'https://rentify01-yfnu.onrender.com/register-success'
    SOCIAL_AUTH_REDIRECT_IS_HTTPS = True

AUTH_USER_MODEL = 'auth_app.User'

APPEND_SLASH = True
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# SECURITY SETTINGS - ONE PLACE FOR ALL HTTPS/HTTP CONFIGURATION
# In development, forcefully disable all HTTPS-related security settings
if DEBUG:
    # Force HTTP for local development
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_PROXY_SSL_HEADER = None
    SECURE_HSTS_SECONDS = 0
    SECURE_HSTS_INCLUDE_SUBDOMAINS = False
    SECURE_HSTS_PRELOAD = False
    SECURE_CONTENT_TYPE_NOSNIFF = False
    
    # Allow OAuth over HTTP for development
    os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'
    logger.info("Development mode: SSL/HTTPS settings forcibly disabled")
else:
    # Production settings - require HTTPS
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    logger.info("Production mode: HTTPS enforced")

# Tell Django we're behind a proxy for development
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

# Logging configuration
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
        },
        'social_django': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'DEBUG' if DEBUG else 'INFO',
            'propagate': False,
        },
    },
}

# Debug logging for static files (only in DEBUG mode)
if DEBUG:
    # Set up detailed logging for static files
    staticfiles_logger = logging.getLogger('django.contrib.staticfiles')
    staticfiles_logger.setLevel(logging.DEBUG)
    staticfiles_logger.addHandler(logging.StreamHandler())
    
    # Add WhiteNoise logging for detailed static file serving info
    whitenoise_logger = logging.getLogger('whitenoise')
    whitenoise_logger.setLevel(logging.DEBUG)
    whitenoise_logger.addHandler(logging.StreamHandler())
    
    # Log static file configuration
    logger.info(f"Static files configuration:")
    logger.info(f"STATIC_URL: {STATIC_URL}")
    logger.info(f"STATIC_ROOT: {STATIC_ROOT}")
    logger.info(f"STATICFILES_DIRS: {STATICFILES_DIRS}")
    logger.info(f"WHITENOISE_ROOT: {WHITENOISE_ROOT}")
    logger.info(f"Frontend build dir exists: {os.path.exists(os.path.join(BASE_DIR, '..', 'frontend', 'build'))}")
    logger.info(f"dist dir exists: {os.path.exists(os.path.join(BASE_DIR, '..', 'frontend', 'build', 'dist'))}")
    
    # Log every static file request
    def log_static_request(sender, **kwargs):
        request = kwargs.get('request')
        if request and request.path.startswith(('/static/', '/dist/')):
            logger.debug(f"Static file request: {request.path}")
    
    # Use request_started signal from django.core.signals
    from django.core.signals import request_started
    request_started.connect(log_static_request)