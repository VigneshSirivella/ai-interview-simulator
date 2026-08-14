from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.db import transaction
import random
import os
import uuid

from google.auth.transport import requests as google_requests
from google.oauth2 import id_token
from google.auth.exceptions import GoogleAuthError

from .models import User
from .serializers import (
    RegisterSerializer,
    OTPVerifySerializer,
    ForgotPasswordSerializer,
    ResetPasswordSerializer,
)
from .utils import send_otp
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


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

    google_client_id = os.getenv("GOOGLE_CLIENT_ID")

    if not google_client_id:
        return Response(
            {"error": "Google Client ID is not configured"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    try:
        google_user = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            google_client_id,
        )

        email = google_user.get("email")
        full_name = google_user.get("name", "")
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

        email = email.strip().lower()

        try:
            user = User.objects.get(email=email)

            user.is_active = True
            user.otp_verified = True

            if not user.full_name and full_name:
                user.full_name = full_name

            user.save()

        except User.DoesNotExist:
            email_username = email.split("@")[0]

            username = f"{email_username}_" f"{uuid.uuid4().hex[:8]}"

            user = User(
                username=username,
                email=email,
                full_name=full_name or email_username,
                is_active=True,
                otp_verified=True,
            )

            user.set_unusable_password()
            user.save()

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
