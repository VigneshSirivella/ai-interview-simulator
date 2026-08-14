import os
import requests


def send_otp(email, otp):
    api_key = os.getenv("RESEND_API_KEY")

    response = requests.post(
        "https://api.resend.com/emails",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        json={
            "from": "AI Interview Simulator <onboarding@resend.dev>",
            "to": [email],
            "subject": "AI Interview Simulator - Email Verification OTP",
            "html": f"""
                <h2>Email Verification</h2>
                <p>Your OTP is:</p>
                <h1>{otp}</h1>
                <p>This OTP is valid for 10 minutes.</p>
            """,
        },
        timeout=15,
    )

    response.raise_for_status()
