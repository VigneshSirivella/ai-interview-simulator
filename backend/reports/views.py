from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from interviews.models import InterviewSession


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def report_list(request):
    sessions = InterviewSession.objects.filter(
        user=request.user,
        status="completed",
    ).order_by("-created_at")

    search = request.GET.get("search", "").strip().lower()

    reports = []

    for session in sessions:
        company = session.company or "General Company"
        role = session.role or "Software Engineer"

        if search:
            if search not in company.lower() and search not in role.lower():
                continue

        reports.append(
            {
                "id": str(session.id),
                "interviewId": str(session.id),
                "userId": str(session.user.id),
                "company": company,
                "role": role,
                "difficulty": session.difficulty,
                "type": session.interview_type,
                "date": session.created_at.isoformat(),
                "overallScore": session.score,
                "radarMetrics": {
                    "technical": session.technical_score,
                    "communication": session.communication_score,
                    "problemSolving": session.score,
                    "confidence": session.score,
                    "systemDesignCulture": session.score,
                },
                "topStrengths": session.strengths or [],
                "keyWeaknesses": session.weaknesses or [],
                "actionableSuggestions": session.improvements or [],
                "finalAiRemark": session.feedback or "",
                "questions": [],
            }
        )

    return Response({"reports": reports})
