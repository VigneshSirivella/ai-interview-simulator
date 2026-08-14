from django.conf import settings
from django.core.mail import send_mail


def send_otp(email, otp):
    subject = "AI Interview Simulator - Email Verification OTP"

    message = f"""
Hello,

Your OTP for AI Interview Simulator is:

{otp}

This OTP is valid for 10 minutes.

Do not share this OTP with anyone.

Regards,
AI Interview Simulator Team
"""

    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [email],
        fail_silently=False,
    )
