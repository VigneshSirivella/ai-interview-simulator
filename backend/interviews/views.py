from urllib import request

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


from .models import InterviewSession, InterviewAnswer
from resume.models import Resume
from .models import InterviewSession
from .serializers import GenerateInterviewSerializer
from .ai_generator import (
    generate_questions,
    evaluate_answer,
    generate_final_report,
)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_interview(request):
    serializer = GenerateInterviewSerializer(data=request.data)

    if serializer.is_valid():
        interview_type = serializer.validated_data["interview_type"]
        difficulty = serializer.validated_data["difficulty"]
        total_questions = int(request.data.get("total_questions", 10))

        try:
            resume = Resume.objects.get(user=request.user)
            resume_text = resume.extracted_text
        except Resume.DoesNotExist:
            resume_text = ""

        company = request.data.get("company", "General Company")

        role = request.data.get("role", "Software Engineer")

        preferred_languages = request.data.get("preferred_languages", [])

        camera_enabled = request.data.get("camera_enabled", False)

        questions = generate_questions(
            resume_text,
            interview_type,
            difficulty,
            total_questions,
            company,
            role,
            preferred_languages,
        )

        interview = InterviewSession.objects.create(
            user=request.user,
            company=company,
            role=role,
            interview_type=interview_type,
            difficulty=difficulty,
            preferred_languages=preferred_languages,
            camera_enabled=camera_enabled,
            questions=questions,
        )

        return Response(
            {
                "session_id": interview.id,
                "questions": questions,
            }
        )

    return Response(serializer.errors, status=400)


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_interview(request):
    session_id = request.data.get("session_id")
    question_number = int(request.data.get("question_number", 1))

    try:
        session = InterviewSession.objects.get(
            id=session_id,
            user=request.user,
        )
    except InterviewSession.DoesNotExist:
        return Response(
            {"error": "Interview session not found"},
            status=404,
        )

    if question_number < 1 or question_number > len(session.questions):
        return Response(
            {"error": "Invalid question number"},
            status=400,
        )

    question = session.questions[question_number - 1]

    return Response(
        {
            "session_id": session.id,
            "current_question": question,
            "question_number": question_number,
            "total_questions": len(session.questions),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_answer(request):
    session_id = request.data.get("session_id")
    question_number = request.data.get("question_number")
    answer = request.data.get("answer")

    if not session_id or not question_number or not answer:
        return Response(
            {"error": "session_id, question_number and answer are required"}, status=400
        )

    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
    except InterviewSession.DoesNotExist:
        return Response({"error": "Interview session not found"}, status=404)

    try:
        question = session.questions[int(question_number) - 1]
    except (IndexError, ValueError, TypeError):
        return Response({"error": "Invalid question number"}, status=400)

    evaluation = evaluate_answer(
        question,
        answer,
        session.difficulty,
    )

    interview_answer, created = InterviewAnswer.objects.update_or_create(
        session=session,
        question_number=question_number,
        defaults={
            "question": question,
            "answer": answer,
            "score": evaluation.get("score", 0),
            "feedback": evaluation.get("feedback", ""),
        },
    )

    next_question_number = int(question_number) + 1

    if next_question_number <= len(session.questions):
        return Response(
            {
                "message": "Answer evaluated successfully",
                "session_id": session.id,
                "score": evaluation.get("score", 0),
                "feedback": evaluation.get("feedback", ""),
                "strengths": evaluation.get("strengths", []),
                "improvements": evaluation.get("improvements", []),
                "next_question": session.questions[next_question_number - 1],
                "question_number": next_question_number,
                "total_questions": len(session.questions),
            }
        )

    return Response(
        {
            "message": "Answer evaluated successfully",
            "session_id": session.id,
            "score": evaluation.get("score", 0),
            "feedback": evaluation.get("feedback", ""),
            "strengths": evaluation.get("strengths", []),
            "improvements": evaluation.get("improvements", []),
            "interview_completed": True,
            "total_questions": len(session.questions),
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def final_report(request, session_id):
    try:
        session = InterviewSession.objects.get(id=session_id, user=request.user)
    except InterviewSession.DoesNotExist:
        return Response({"error": "Interview session not found"}, status=404)

    answers = session.answers.all().order_by("question_number")

    if answers.count() < len(session.questions):
        return Response({"error": "Interview is not completed yet"}, status=400)

    questions_and_answers = []

    for item in answers:
        questions_and_answers.append(
            {
                "question": item.question,
                "answer": item.answer,
                "score": item.score,
                "feedback": item.feedback,
            }
        )

    report = generate_final_report(questions_and_answers)

    session.score = report.get("overall_score", 0)

    session.technical_score = report.get("technical_score", 0)

    session.communication_score = report.get("communication_score", 0)

    session.feedback = report.get("final_feedback", "")

    session.strengths = report.get("strengths", [])

    session.weaknesses = report.get("weaknesses", [])

    session.improvements = report.get("improvements", [])

    session.status = "completed"
    session.ended_at = timezone.now()

    session.save()

    report_data = {
        "id": str(session.id),
        "interviewId": str(session.id),
        "userId": str(session.user.id),
        "company": session.company or "General Company",
        "role": session.role or "Software Engineer",
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
        "topStrengths": session.strengths,
        "keyWeaknesses": session.weaknesses,
        "actionableSuggestions": session.improvements,
        "finalAiRemark": session.feedback,
        "questions": [
            {
                "id": f"question-{item.question_number}",
                "questionNumber": item.question_number,
                "category": session.interview_type,
                "question": item.question,
                "userAnswer": item.answer,
                "evaluation": {
                    "score": item.score,
                    "feedback": item.feedback,
                    "strengths": item.strengths,
                    "weaknesses": item.improvements,
                },
            }
            for item in answers
        ],
        "cameraEnabled": session.camera_enabled,
        "cameraFeedback": session.camera_feedback,
    }

    return Response({"report": report_data})


from django.utils import timezone


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def end_interview(request):
    session_id = request.data.get("session_id")
    reason = request.data.get("reason", "")
    note = request.data.get("note", "")

    try:
        session = InterviewSession.objects.get(
            id=session_id,
            user=request.user,
        )
    except InterviewSession.DoesNotExist:
        return Response(
            {"error": "Interview session not found"},
            status=404,
        )

    session.status = "ended"
    session.end_reason = reason
    session.end_note = note
    session.ended_at = timezone.now()
    session.save()

    return Response({"message": "Interview ended successfully"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_feedback(request):
    session_id = request.data.get("session_id")
    rating = request.data.get("rating")
    feedback = request.data.get("feedback", "")

    try:
        session = InterviewSession.objects.get(
            id=session_id,
            user=request.user,
        )
    except InterviewSession.DoesNotExist:
        return Response(
            {"error": "Interview session not found"},
            status=404,
        )

    session.feedback_rating = rating
    session.feedback_text = feedback
    session.save()

    return Response({"message": "Feedback saved successfully"})
