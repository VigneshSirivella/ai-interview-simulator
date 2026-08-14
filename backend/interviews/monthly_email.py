from datetime import timedelta

from django.conf import settings
from django.core.mail import send_mail
from django.db.models import Avg, Max
from django.utils import timezone

from accounts.models import User
from interviews.models import InterviewSession


def send_monthly_progress_email(user):
    now = timezone.now()
    start_date = now - timedelta(days=30)

    sessions = InterviewSession.objects.filter(
        user=user,
        status="completed",
        created_at__gte=start_date,
    )

    total_interviews = sessions.count()

    average_score = sessions.aggregate(
        avg=Avg("score")
    )["avg"] or 0

    best_score = sessions.aggregate(
        best=Max("score")
    )["best"] or 0

    technical_score = sessions.aggregate(
        avg=Avg("technical_score")
    )["avg"] or 0

    communication_score = sessions.aggregate(
        avg=Avg("communication_score")
    )["avg"] or 0

    strengths = []
    improvements = []

    for session in sessions:
        strengths.extend(
            session.strengths or []
        )

        improvements.extend(
            session.improvements or []
        )

    unique_strengths = list(
        dict.fromkeys(strengths)
    )[:3]

    unique_improvements = list(
        dict.fromkeys(improvements)
    )[:3]

    if total_interviews == 0:
        motivation = (
            "You did not complete an interview this month. "
            "Start with one mock interview this week and build momentum."
        )
    elif average_score >= 80:
        motivation = (
            "Excellent progress! Your interview performance is strong. "
            "Keep practicing consistently and challenge yourself with harder interviews."
        )
    elif average_score >= 60:
        motivation = (
            "Good progress. You are moving in the right direction. "
            "Focus on your weaker areas and continue practicing regularly."
        )
    else:
        motivation = (
            "Every practice session is helping you improve. "
            "Focus on fundamentals, review feedback carefully, and keep going."
        )

    strengths_text = (
        "\n".join(
            f"- {item}"
            for item in unique_strengths
        )
        if unique_strengths
        else "- Keep practicing to identify your strongest areas."
    )

    improvements_text = (
        "\n".join(
            f"- {item}"
            for item in unique_improvements
        )
        if unique_improvements
        else "- Complete more interviews to receive improvement suggestions."
    )

    subject = (
        "Your Monthly AI Interview Progress Report"
    )

    message = f"""
Hello {user.full_name or user.email},

Here is your AI Interview Simulator progress for the last 30 days.

INTERVIEW SUMMARY
-----------------
Interviews Completed: {total_interviews}
Average Score: {round(average_score)}%
Best Score: {round(best_score)}%
Technical Score: {round(technical_score)}%
Communication Score: {round(communication_score)}%

YOUR STRENGTHS
--------------
{strengths_text}

FOCUS AREAS
-----------
{improvements_text}

MOTIVATION
----------
{motivation}

Keep practicing, learning, and improving.

AI Interview Simulator
"""

    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
        fail_silently=False,
    )


def send_monthly_progress_to_all_users():
    users = User.objects.filter(
        is_active=True
    )

    for user in users:
        if user.email:
            send_monthly_progress_email(
                user
            )
