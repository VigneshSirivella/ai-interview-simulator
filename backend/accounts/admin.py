from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):

    list_display = (
        "id",
        "full_name",
        "email",
        "phone",
        "otp_verified",
        "is_active",
        "is_staff",
    )

    search_fields = (
        "full_name",
        "email",
        "phone",
    )

    ordering = ("id",)

    fieldsets = (
        (
            "Account",
            {
                "fields": (
                    "username",
                    "password",
                )
            },
        ),
        (
            "Personal Info",
            {
                "fields": (
                    "full_name",
                    "email",
                    "phone",
                    "college",
                    "degree",
                    "specialization",
                    "graduation_year",
                    "github",
                    "linkedin",
                    "profile_picture",
                    "resume",
                )
            },
        ),
        (
            "OTP",
            {
                "fields": (
                    "otp",
                    "otp_verified",
                )
            },
        ),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                )
            },
        ),
        (
            "Dates",
            {
                "fields": (
                    "last_login",
                    "created_at",
                    "updated_at",
                )
            },
        ),
    )

    readonly_fields = (
        "created_at",
        "updated_at",
        "last_login",
    )
