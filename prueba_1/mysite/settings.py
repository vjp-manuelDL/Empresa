"""
Django settings for mysite project.
"""

from pathlib import Path
import os
from datetime import timedelta

# Ruta base del proyecto
BASE_DIR = Path(__file__).resolve().parent.parent

# --- SEGURIDAD ---
SECRET_KEY = 'django-insecure-n(@pqi^*^2i#ad+@%1zp*1(3gio#a4ah_b-*nw%mfvm)(thyni'
DEBUG = True
ALLOWED_HOSTS = ['*']

# --- APLICACIONES INSTALADAS ---
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Librerías externas
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    # Tus Apps
    'coches', 
]

# --- MIDDLEWARE ---
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware', # Debe ir lo más arriba posible
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'mysite.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mysite.wsgi.application'

# --- BASE DE DATOS ---
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# --- VALIDACIÓN DE CONTRASEÑAS ---
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# --- INTERNACIONALIZACIÓN ---
LANGUAGE_CODE = 'es-es' # Cambiado a español
TIME_ZONE = 'Europe/Madrid' # Ajustado a tu zona
USE_I18N = True
USE_TZ = True

# --- ARCHIVOS ESTÁTICOS Y MULTIMEDIA ---
STATIC_URL = 'static/'

# Carpeta para fotos de coches subidas por usuarios
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# --- CONFIGURACIÓN CORS (Comunicación con Next.js) ---
CORS_ALLOW_ALL_ORIGINS = True 

# --- DJANGO REST FRAMEWORK & JWT ---
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=7),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': False,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
}

# ------------------------------------------------------------------
# CONFIGURACIÓN DE ENVÍO DE EMAIL (Recuperación de contraseña)
# ------------------------------------------------------------------

# OPCIÓN 1: Solo para pruebas (Muestra el email en la consola de VS Code)
# EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'

# OPCIÓN 2: Envío real mediante GMAIL
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'tu-correo@gmail.com'  # <--- TU CORREO REAL AQUÍ
EMAIL_HOST_PASSWORD = 'xxxx xxxx xxxx xxxx' # <--- TU CONTRASEÑA DE APLICACIÓN GMAIL
DEFAULT_FROM_EMAIL = 'Tienda de Coches <tu-correo@gmail.com>'

# ------------------------------------------------------------------
# OPCIONAL: URL de redirección para el reset de contraseña
# ------------------------------------------------------------------
# Esto ayuda a que Django sepa a dónde mandar al usuario en el email
PASSWORD_RESET_TIMEOUT = 3600 # El enlace expira en 1 hora (3600 seg)