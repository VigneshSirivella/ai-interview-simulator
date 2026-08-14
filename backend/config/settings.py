from pathlib import Path
from datetime import timedelta

import environ
import dj_database_url

# ---------------------------------------------------
# BASE DIRECTORY
# ---------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent


# ---------------------------------------------------
# ENVIRONMENT VARIABLES
# ---------------------------------------------------

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")


# ---------------------------------------------------
# SECURITY
# ---------------------------------------------------

SECRET_KEY = env(
    "SECRET_KEY",
    default="temporary-dev-secret-key-change-this",
)

DEBUG = env.bool("DEBUG", default=True)

ALLOWED_HOSTS = env.list(
    "ALLOWED_HOSTS",
    default=[
        "127.0.0.1",
        "localhost",
        ".onrender.com",
    ],
)


# ---------------------------------------------------
# APPLICATIONS
# ---------------------------------------------------

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework.authtoken",
    "rest_framework_simplejwt",
    "corsheaders",
    "accounts",
    "ai",
    "interviews",
    "notifications",
    "reports",
    "resume",
    "practice",
]


# ---------------------------------------------------
# MIDDLEWARE
# ---------------------------------------------------

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ---------------------------------------------------
# URLS / WSGI
# ---------------------------------------------------

ROOT_URLCONF = "config.urls"

WSGI_APPLICATION = "config.wsgi.application"


# ---------------------------------------------------
# TEMPLATES
# ---------------------------------------------------

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ---------------------------------------------------
# DATABASE
# ---------------------------------------------------

DATABASE_URL = env(
    "DATABASE_URL",
    default="",
)

if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": env("DB_NAME", default="ai_interview"),
            "USER": env("DB_USER", default="postgres"),
            "PASSWORD": env("DB_PASSWORD", default=""),
            "HOST": env("DB_HOST", default="localhost"),
            "PORT": env("DB_PORT", default="5432"),
        }
    }


# ---------------------------------------------------
# CUSTOM USER MODEL
# ---------------------------------------------------

AUTH_USER_MODEL = "accounts.User"


# ---------------------------------------------------
# PASSWORD VALIDATORS
# ---------------------------------------------------

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ---------------------------------------------------
# INTERNATIONALIZATION
# ---------------------------------------------------

LANGUAGE_CODE = "en-us"

TIME_ZONE = "Asia/Kolkata"

USE_I18N = True

USE_TZ = True


# ---------------------------------------------------
# STATIC FILES
# ---------------------------------------------------

STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"


# ---------------------------------------------------
# MEDIA FILES
# ---------------------------------------------------

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"


# ---------------------------------------------------
# DEFAULT PRIMARY KEY
# ---------------------------------------------------

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ---------------------------------------------------
# DJANGO REST FRAMEWORK
# ---------------------------------------------------

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "accounts.authentication.CustomJWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
}


# ---------------------------------------------------
# JWT
# ---------------------------------------------------

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=2),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
}


# ---------------------------------------------------
# CORS
# ---------------------------------------------------

CORS_ALLOW_ALL_ORIGINS = env.bool(
    "CORS_ALLOW_ALL_ORIGINS",
    default=True,
)

CORS_ALLOWED_ORIGINS = env.list(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)


# ---------------------------------------------------
# CSRF
# ---------------------------------------------------

CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=[
        "https://*.onrender.com",
    ],
)


# ---------------------------------------------------
# EMAIL CONFIGURATION
# ---------------------------------------------------

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"

EMAIL_HOST = env(
    "EMAIL_HOST",
    default="smtp.gmail.com",
)

EMAIL_PORT = env.int(
    "EMAIL_PORT",
    default=587,
)

EMAIL_HOST_USER = env(
    "EMAIL_HOST_USER",
    default="",
)

EMAIL_HOST_PASSWORD = env(
    "EMAIL_HOST_PASSWORD",
    default="",
)

EMAIL_USE_TLS = env.bool(
    "EMAIL_USE_TLS",
    default=True,
)

DEFAULT_FROM_EMAIL = EMAIL_HOST_USER


# ---------------------------------------------------
# PRODUCTION SECURITY
# ---------------------------------------------------

SECURE_SSL_REDIRECT = env.bool(
    "SECURE_SSL_REDIRECT",
    default=False,
)

SESSION_COOKIE_SECURE = env.bool(
    "SESSION_COOKIE_SECURE",
    default=False,
)

CSRF_COOKIE_SECURE = env.bool(
    "CSRF_COOKIE_SECURE",
    default=False,
)

SECURE_HSTS_SECONDS = env.int(
    "SECURE_HSTS_SECONDS",
    default=0,
)

SECURE_HSTS_INCLUDE_SUBDOMAINS = env.bool(
    "SECURE_HSTS_INCLUDE_SUBDOMAINS",
    default=False,
)

SECURE_HSTS_PRELOAD = env.bool(
    "SECURE_HSTS_PRELOAD",
    default=False,
)
