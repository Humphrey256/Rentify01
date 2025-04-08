import os
from pathlib import Path
from dotenv import load_dotenv
import socket
from django.core.servers.basehttp import WSGIServer

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent  # Change BASE_DIR to match the new structure

# SECURITY WARNING: Keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')

# SECURITY WARNING: Don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',  # Ensure this line is included
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',  # Ensure this line is included
    'corsheaders',
    'auth_app',  # Ensure this line is included
    'rentals_app',  # Ensure this line is included
    'registration_app',  # Ensure this line is included
    'booking_app',  # Ensure this line is included
    'reviews_app',  # Add reviews_app to the installed apps
    'issues_app',  # Add issues_app to the installed apps
    'notifications_app',  # Add this line
    # Social Auth apps
    'oauth2_provider',
    'social_django',
    'drf_social_oauth2',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Move CORS middleware before CommonMiddleware
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    # Social Auth middleware
    'social_django.middleware.SocialAuthExceptionMiddleware',
]

ROOT_URLCONF = 'backends.urls'  # Instead of 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',  # Corrected backend
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                # Social Auth context processors
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

WSGI_APPLICATION = 'backends.wsgi.application'  # Instead of 'backend.wsgi.application'

# Custom WSGI server to handle long-running requests
class CustomWSGIServer(WSGIServer):
    timeout = 120  # Increase timeout to 120 seconds

WSGIServer = CustomWSGIServer

# DATABASE SETTINGS
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'

# Media settings
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS SETTINGS (Allow only specific front-end domains)
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # React frontend
    'https://your-production-domain.com',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.TokenAuthentication',  # Ensure this line is included
        # Social OAuth2
        'oauth2_provider.contrib.rest_framework.OAuth2Authentication',
        'drf_social_oauth2.authentication.SocialAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',  # Allow registration without authentication
    ],
}

# Social Auth settings
AUTHENTICATION_BACKENDS = (
    # Google OAuth2
    'social_core.backends.google.GoogleOAuth2',
    # Facebook OAuth2
    'social_core.backends.facebook.FacebookOAuth2',
    # GitHub OAuth2
    'social_core.backends.github.GithubOAuth2',
    # Django default
    'django.contrib.auth.backends.ModelBackend',
    # drf-social-oauth2
    'drf_social_oauth2.backends.DjangoOAuth2',
)

# Google configuration
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('GOOGLE_OAUTH2_KEY', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_OAUTH2_SECRET', '')
SOCIAL_AUTH_GOOGLE_OAUTH2_SCOPE = ['email', 'profile']

# Facebook configuration
SOCIAL_AUTH_FACEBOOK_KEY = os.getenv('FACEBOOK_KEY', '')
SOCIAL_AUTH_FACEBOOK_SECRET = os.getenv('FACEBOOK_SECRET', '')
SOCIAL_AUTH_FACEBOOK_SCOPE = ['email']
SOCIAL_AUTH_FACEBOOK_PROFILE_EXTRA_PARAMS = {'fields': 'id, name, email'}

# GitHub configuration
SOCIAL_AUTH_GITHUB_KEY = os.getenv('GITHUB_KEY', '')
SOCIAL_AUTH_GITHUB_SECRET = os.getenv('GITHUB_SECRET', '')
SOCIAL_AUTH_GITHUB_SCOPE = ['user:email']

# Social Auth pipeline
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
)

# Social Auth URL configuration
SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://localhost:3000/auth-success'
SOCIAL_AUTH_LOGIN_ERROR_URL = 'http://localhost:3000/login'

AUTH_USER_MODEL = 'auth_app.User'  # Corrected model reference

APPEND_SLASH = True
