import os
from pathlib import Path
from dotenv import load_dotenv
import socket
from django.core.servers.basehttp import WSGIServer
import logging
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: Keep the secret key used in production secret!
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'your-secret-key-here')

# SECURITY WARNING: Don't run with debug turned on in production!
DEBUG = os.getenv('DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'corsheaders',
    'auth_app',
    'rentals_app',
    'registration_app',
    'booking_app',
    'reviews_app',
    'issues_app',
    'notifications_app',
    'oauth2_provider',
    'social_django',
    'drf_social_oauth2',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'social_django.middleware.SocialAuthExceptionMiddleware',
]

ROOT_URLCONF = 'backends.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
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

WSGI_APPLICATION = 'backends.wsgi.application'

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

# CORS SETTINGS
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'https://your-production-domain.com',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Ensure JWT is included
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Require authentication by default
    ],
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),  # Adjust as needed
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

# Social Auth settings
AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    'social_core.backends.github.GithubOAuth2',
    'django.contrib.auth.backends.ModelBackend',
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
    'auth_app.views.oauth_redirect',
)

# Social Auth URL configuration
SOCIAL_AUTH_LOGIN_REDIRECT_URL = 'http://localhost:3000/auth-success'
SOCIAL_AUTH_LOGIN_ERROR_URL = 'http://localhost:3000/login'
SOCIAL_AUTH_NEW_USER_REDIRECT_URL = 'http://localhost:3000/register-success'

SOCIAL_AUTH_REDIRECT_IS_HTTPS = False

AUTH_USER_MODEL = 'auth_app.User'

APPEND_SLASH = True

SESSION_ENGINE = 'django.contrib.sessions.backends.db'

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'social_django': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
