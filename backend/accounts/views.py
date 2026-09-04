import os
import random
import uuid

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import update_last_login
from django.db import IntegrityError, transaction
from google.auth.exceptions import GoogleAuthError
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import (
    ForgotPasswordSerializer,
    OTPVerifySerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
)
from .utils import send_otp


@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    serializer = RegisterSerializer(data=request.data)

    if serializer.is_valid():
        try:
            with transaction.atomic():
                user = serializer.save()

                otp = str(random.randint(100000, 999999))

                user.otp = otp
                user.otp_verified = False
                user.is_active = False
                user.save()

                send_otp(user.email, otp)

            return Response({"message": "OTP sent successfully"})

        except Exception as e:
            return Response(
                {"error": "Unable to send OTP. Please try again."},
                status=500,
            )

    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def verify_otp(request):
    serializer = OTPVerifySerializer(data=request.data)

    if serializer.is_valid():

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]

        try:
            user = User.objects.get(email=email)

        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.otp == otp:

            user.otp_verified = True
            user.is_active = True
            user.otp = ""
            user.save()

            return Response({"message": "OTP verified successfully"})

        return Response({"error": "Invalid OTP"}, status=400)

    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    email = request.data.get("email")
    password = request.data.get("password")

    user = authenticate(username=email, password=password)

    if user is None:
        return Response(
            {"error": "Invalid Email or Password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.otp_verified:
        return Response(
            {"error": "Verify your email first"},
            status=status.HTTP_403_FORBIDDEN,
        )

    update_last_login(None, user)

    refresh = RefreshToken.for_user(user)

    return Response(
        {
            "message": "Login Successful",
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "name": user.full_name,
                "email": user.email,
            },
        }
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def forgot_password(request):
    serializer = ForgotPasswordSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data["email"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        otp = str(random.randint(100000, 999999))

        user.otp = otp
        user.save()

        send_otp(user.email, otp)

        return Response({"message": "OTP sent successfully"})

    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    serializer = ResetPasswordSerializer(data=request.data)

    if serializer.is_valid():
        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        if user.otp != otp:
            return Response({"error": "Invalid OTP"}, status=400)

        user.set_password(new_password)
        user.otp = ""
        user.is_active = True
        user.otp_verified = True
        user.save()

        return Response({"message": "Password updated successfully"})

    return Response(serializer.errors, status=400)


@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    credential = request.data.get("credential")

    if not credential:
        return Response(
            {"error": "Google credential is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    google_client_id = os.getenv("GOOGLE_CLIENT_ID") or getattr(
        settings, "GOOGLE_CLIENT_ID", None
    )

    if not google_client_id:
        return Response(
            {
                "error": "Google Client ID is not configured on the backend server. "
                "Please configure GOOGLE_CLIENT_ID in the Render environment variables."
            },
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            google_client_id,
        )

        email = google_user.get("email")
        email_verified = google_user.get("email_verified", False)

        if not email:
            return Response(
                {"error": "Google account has no email address"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not email_verified:
            return Response(
                {"error": "Google email is not verified"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        normalized_email = email.strip().lower()
        full_name = (google_user.get("name") or "").strip()
        first_name = (google_user.get("given_name") or "").strip()
        last_name = (google_user.get("family_name") or "").strip()

        if not full_name:
            full_name = f"{first_name} {last_name}".strip()

        if full_name and not first_name:
            name_parts = full_name.split(None, 1)
            first_name = name_parts[0]
            if len(name_parts) > 1:
                last_name = name_parts[1]

        if not full_name:
            email_username = normalized_email.split("@")[0]
            full_name = email_username
            if not first_name:
                first_name = email_username

        try:
            with transaction.atomic():
                user = User.objects.filter(
                    email__iexact=normalized_email
                ).first()

                if user:
                    updated = False
                    if not user.is_active:
                        user.is_active = True
                        updated = True
                    if not user.otp_verified:
                        user.otp_verified = True
                        updated = True
                    if not user.full_name and full_name:
                        user.full_name = full_name
                        updated = True
                    if not user.first_name and first_name:
                        user.first_name = first_name
                        updated = True
                    if not user.last_name and last_name:
                        user.last_name = last_name
                        updated = True

                    if updated:
                        user.save()
                else:
                    email_username = normalized_email.split("@")[0]
                    base_username = (
                        email_username[:130] if email_username else "user"
                    )
                    username = base_username

                    if User.objects.filter(username__iexact=username).exists():
                        username = f"{base_username}_{uuid.uuid4().hex[:8]}"
                        while User.objects.filter(
                            username__iexact=username
                        ).exists():
                            username = (
                                f"{base_username}_{uuid.uuid4().hex[:8]}"
                            )

                    user = User(
                        username=username,
                        email=normalized_email,
                        full_name=full_name,
                        first_name=first_name,
                        last_name=last_name,
                        is_active=True,
                        otp_verified=True,
                    )
                    user.set_unusable_password()
                    user.save()

                update_last_login(None, user)

        except IntegrityError:
            user = User.objects.filter(
                email__iexact=normalized_email
            ).first()
            if user:
                update_last_login(None, user)
            else:
                raise

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Google login successful",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "user": {
                    "id": user.id,
                    "name": user.full_name,
                    "email": user.email,
                },
            },
            status=status.HTTP_200_OK,
        )

    except ValueError:
        return Response(
            {"error": "Invalid or expired Google credential"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    except GoogleAuthError:
        return Response(
            {"error": "Google authentication failed"},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    except Exception as error:
        print("Google login error:", error)

        return Response(
            {"error": "Unable to complete Google login"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )
