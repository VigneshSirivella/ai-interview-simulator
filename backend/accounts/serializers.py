from rest_framework import serializers

from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    phone = serializers.CharField(required=False, allow_blank=True, default="")

    college = serializers.CharField(required=False, allow_blank=True, default="")

    degree = serializers.CharField(required=False, allow_blank=True, default="")

    specialization = serializers.CharField(required=False, allow_blank=True, default="")

    graduation_year = serializers.CharField(
        required=False, allow_blank=True, default=""
    )

    class Meta:
        model = User

        fields = [
            "full_name",
            "email",
            "password",
            "phone",
            "college",
            "degree",
            "specialization",
            "graduation_year",
        ]

    def validate_email(self, value):
        email = value.strip().lower()

        if User.objects.filter(email=email).exists():
            raise serializers.ValidationError(
                "An account with this email already exists."
            )

        return email

    def create(self, validated_data):
        password = validated_data.pop("password")
        email = validated_data["email"]

        user = User(
            username=email,
            email=email,
            full_name=validated_data.get("full_name", "").strip(),
            phone=validated_data.get("phone", ""),
            college=validated_data.get("college", ""),
            degree=validated_data.get("degree", ""),
            specialization=validated_data.get("specialization", ""),
            graduation_year=validated_data.get("graduation_year", ""),
        )

        user.set_password(password)
        user.save()

        return user


from rest_framework import serializers


class OTPVerifySerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6, max_length=6)
    new_password = serializers.CharField(write_only=True, min_length=8)
