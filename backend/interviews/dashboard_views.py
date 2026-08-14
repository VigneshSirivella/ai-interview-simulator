from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import InterviewSession
from practice.models import PracticeAttempt


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    # =====================================================
    # Interview statistics
    # =====================================================

    sessions = InterviewSession.objects.filter(user=request.user).order_by(
        "-created_at"
    )

    completed = sessions.filter(status="completed")

    total_interviews = completed.count()

    if total_interviews > 0:
        average_score = round(
            sum(session.score for session in completed) / total_interviews
        )
    else:
        average_score = 0

    interview_history = []

    for index, session in enumerate(
        completed,
        start=1,
    ):
        interview_history.append(
            {
                "id": session.id,
                "interviewNumber": index,
                "company": session.company,
                "role": session.role,
                "interviewType": session.interview_type,
                "difficulty": session.difficulty,
                "score": session.score,
                "technicalScore": session.technical_score,
                "communicationScore": session.communication_score,
                "strengths": session.strengths,
                "weaknesses": session.weaknesses,
                "improvements": session.improvements,
                "feedback": session.feedback,
                "cameraEnabled": session.camera_enabled,
                "cameraFeedback": session.camera_feedback,
                "createdAt": session.created_at,
                "endedAt": session.ended_at,
            }
        )

    # =====================================================
    # Practice statistics
    # =====================================================

    practice_attempts = PracticeAttempt.objects.filter(user=request.user).order_by(
        "-updated_at"
    )

    total_practice_questions = practice_attempts.count()

    if total_practice_questions > 0:
        practice_average_score = round(
            sum(attempt.score for attempt in practice_attempts)
            / total_practice_questions
        )
    else:
        practice_average_score = 0

    # Difficulty-wise statistics
    difficulty_stats = {}

    for difficulty in [
        "Easy",
        "Medium",
        "Hard",
    ]:
        difficulty_attempts = practice_attempts.filter(difficulty__iexact=difficulty)

        count = difficulty_attempts.count()

        if count > 0:
            avg_score = round(
                sum(attempt.score for attempt in difficulty_attempts) / count
            )
        else:
            avg_score = 0

        difficulty_stats[difficulty.lower()] = {
            "count": count,
            "averageScore": avg_score,
        }

    # Recent practice history
    practice_history = []

    for attempt in practice_attempts[:10]:
        practice_history.append(
            {
                "id": attempt.id,
                "questionId": attempt.question_id,
                "questionTitle": attempt.question_title,
                "questionType": attempt.question_type,
                "topicOrLanguage": attempt.topic_or_language,
                "difficulty": attempt.difficulty,
                "score": attempt.score,
                "feedback": attempt.feedback,
                "strengths": attempt.strengths,
                "improvements": attempt.improvements,
                "programmingLanguage": attempt.programming_language,
                "updatedAt": attempt.updated_at,
            }
        )

    # =====================================================
    # Response
    # =====================================================

    return Response(
        {
            "stats": {
                "totalInterviews": total_interviews,
                "averageScore": average_score,
                "strongTopics": [],
                "weakTopics": [],
                "overallAccuracy": average_score,
                "completionRate": (100 if total_interviews > 0 else 0),
                "weeklyProgress": [],
                "monthlyProgress": [],
                "recentReports": [],
                "interviewHistory": interview_history,
                # Practice Lab
                "practiceStats": {
                    "totalSolved": total_practice_questions,
                    "averageScore": practice_average_score,
                    "easy": difficulty_stats["easy"],
                    "medium": difficulty_stats["medium"],
                    "hard": difficulty_stats["hard"],
                    "recentAttempts": practice_history,
                },
            }
        }
    )
