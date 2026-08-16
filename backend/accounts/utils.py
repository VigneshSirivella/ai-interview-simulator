import os
import requests


def send_otp(email, otp):
    api_key = os.getenv("BREVO_API_KEY")
    response = requests.post(
        "https://api.brevo.com/v3/smtp/email",
        headers={
            "accept": "application/json",
            "api-key": api_key,
            "content-type": "application/json",
        },
        json={
            "sender": {
                "name": "AI Interview Simulator",
                "email": "vigni9866@gmail.com",
            },
            "to": [{"email": email}],
            "subject": "AI Interview Simulator - Email Verification OTP",
            "htmlContent": f"""
                <h2>AI Interview Simulator</h2>
                <p>Your verification OTP is:</p>
                <h1>{otp}</h1>
                <p>Do not share this OTP with anyone.</p>
            """,
        },
        timeout=15,
    )

    response.raise_for_status()
