from django.urls import path

from .views import (
    register_user,
    verify_otp,
    login_user,
    forgot_password,
    reset_password,
    google_login,
)

from .profile_views import profile
from .career_views import career_intelligence

urlpatterns = [
    path("register/", register_user),
    path("verify-otp/", verify_otp),
    path("login/", login_user),
    path("google-login/", google_login),
    path("forgot-password/", forgot_password),
    path("reset-password/", reset_password),
    path("profile/", profile),
    path("career-intelligence/", career_intelligence),
]
