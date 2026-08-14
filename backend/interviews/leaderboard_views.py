from django.db.models import Avg, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import User
from interviews.models import InterviewSession


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def leaderboard(request):
    users = (
        User.objects.filter(interview_sessions__status="completed")
        .annotate(
            average_score=Avg("interview_sessions__score"),
            total_interviews=Count(
                "interview_sessions",
                distinct=True,
            ),
        )
        .order_by(
            "-average_score",
            "-total_interviews",
        )
    )

    leaderboard_data = []

    for rank, user in enumerate(users, start=1):
        completed_sessions = InterviewSession.objects.filter(
            user=user,
            status="completed",
        )

        latest_session = completed_sessions.order_by("-created_at").first()

        avatar = ""

        if user.profile_picture:
            avatar = request.build_absolute_uri(user.profile_picture.url)

        leaderboard_data.append(
            {
                "id": str(user.id),
                "rank": rank,
                "name": user.full_name or user.username,
                "email": user.email,
                "avatar": avatar,
                "targetRole": (
                    latest_session.role if latest_session else "Software Engineer"
                ),
                "averageScore": round(user.average_score or 0),
                "totalInterviews": user.total_interviews,
                "topSkills": (
                    user.resume.skills.split(",")
                    if hasattr(user, "resume") and getattr(user.resume, "skills", "")
                    else []
                ),
            }
        )

    achievements = [
        {
            "id": "first-interview",
            "title": "First Interview",
            "description": "Complete your first AI interview.",
            "icon": "🎯",
            "unlocked": InterviewSession.objects.filter(
                user=request.user,
                status="completed",
            ).exists(),
        },
        {
            "id": "high-scorer",
            "title": "High Scorer",
            "description": "Achieve an interview score of 80 or above.",
            "icon": "🏆",
            "unlocked": InterviewSession.objects.filter(
                user=request.user,
                status="completed",
                score__gte=80,
            ).exists(),
        },
    ]

    return Response(
        {
            "leaderboard": leaderboard_data,
            "achievements": achievements,
        }
    )
