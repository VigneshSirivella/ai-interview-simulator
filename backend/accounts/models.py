from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):

    full_name = models.CharField(max_length=150)

    email = models.EmailField(unique=True)

    phone = models.CharField(max_length=30, blank=True, default="")
    preferred_language = models.CharField(
        max_length=50,
        blank=True,
        default="Python",
    )

    profile_picture = models.ImageField(
        upload_to="profiles/",
        blank=True,
        null=True,
    )

    resume = models.FileField(
        upload_to="resumes/",
        blank=True,
        null=True,
    )

    otp = models.CharField(max_length=6, blank=True)

    otp_verified = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.email
