import random
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import InterviewSession, InterviewAnswer
from resume.models import Resume
from .serializers import GenerateInterviewSerializer
from .ai_generator import (
    generate_questions,
    evaluate_answer,
    evaluate_answers_batch,
    generate_final_report,
    GENERAL_HR_QUESTION_BANK,
)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_interview(request):
    serializer = GenerateInterviewSerializer(data=request.data)

    if serializer.is_valid():
        interview_type = serializer.validated_data["interview_type"]
        difficulty = serializer.validated_data["difficulty"]
        total_questions = int(request.data.get("total_questions", 10))

        mode = request.data.get("mode")
        type_str = str(interview_type).lower()

        is_one_on_one = (
            mode in ["general_hr", "one-on-one", "1-on-1", "1-to-1"]
            or "1-on-1" in type_str
            or "1-to-1" in type_str
            or "hr" in type_str
            or "general" in type_str
            or "one-on-one" in type_str
        )

        if is_one_on_one:
            resume_text = ""
            company = "General"
            role = "General Candidate"
            preferred_languages = []
            interview_mode = "general_hr"
        else:
            try:
                resume = Resume.objects.get(user=request.user)
                resume_text = (resume.extracted_text or "")[:8000]
            except Resume.DoesNotExist:
                resume_text = ""

            company = request.data.get("company", "General Company")
            role = request.data.get("role", "Software Engineer")
            preferred_languages = request.data.get("preferred_languages", [])
            interview_mode = "technical"

        camera_enabled = request.data.get("camera_enabled", False)

        questions = generate_questions(
            resume_text,
            interview_type,
            difficulty,
            total_questions,
            company,
            role,
            preferred_languages,
            mode=interview_mode,
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

    is_one_on_one = (
        session.company == "General"
        or "1-on-1" in str(session.interview_type)
        or "1-to-1" in str(session.interview_type)
        or "HR" in str(session.interview_type)
        or "general" in str(session.interview_type).lower()
        or "one-on-one" in str(session.interview_type).lower()
    )

    if is_one_on_one:
        questions_text = " ".join([str(q).lower() for q in session.questions])
        forbidden = [
            "foodz",
            "mysql",
            "javascript frontend",
            "python backend",
            "cart state",
            "schema",
            "database",
            "integration",
        ]
        if any(k in questions_text for k in forbidden):
            first_q = "Tell me about yourself."
            second_q = "Why should we hire you for this job?"
            pool = [
                q for q in GENERAL_HR_QUESTION_BANK if q not in [first_q, second_q]
            ]
            count = len(session.questions)
            needed = count - 2
            if needed > 0:
                clean_qs = [first_q, second_q] + random.sample(
                    pool, min(needed, len(pool))
                )
            else:
                clean_qs = [first_q, second_q][:count]

            session.questions = clean_qs
            session.save(update_fields=["questions"])

    if session.status in ["completed", "ended"]:
        return Response(
            {
                "error": "Interview session is already finished",
                "session_status": session.status,
            },
            status=409,
        )

    if question_number < 1 or question_number > len(session.questions):
        return Response(
            {"error": "Invalid question number"},
            status=400,
        )

    question = session.questions[question_number - 1]

    saved_answer = InterviewAnswer.objects.filter(
        session=session,
        question_number=question_number,
    ).first()

    return Response(
        {
            "session_id": session.id,
            "current_question": question,
            "question_number": question_number,
            "total_questions": len(session.questions),
            "saved_answer": (saved_answer.answer if saved_answer else ""),
            "saved_score": (saved_answer.score if saved_answer else None),
            "saved_feedback": (saved_answer.feedback if saved_answer else ""),
            "saved_strengths": (saved_answer.strengths if saved_answer else []),
            "saved_improvements": (saved_answer.improvements if saved_answer else []),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def submit_answer(request):
    session_id = request.data.get("session_id")
    question_number = request.data.get("question_number")
    answer = request.data.get("answer")

    should_evaluate = request.data.get("evaluate", True)

    time_spent_seconds = int(
        request.data.get(
            "time_spent_seconds",
            0,
        )
    )

    if isinstance(should_evaluate, str):
        should_evaluate = should_evaluate.lower() == "true"

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

    if answer == "[SKIPPED]":
        evaluation = {
            "score": 0,
            "feedback": (
                "You skipped this question. Attempting it could "
                "have improved your overall interview score."
            ),
            "strengths": [],
            "improvements": [
                "Review this topic and try answering a similar question in your next practice session."
            ],
        }

    elif should_evaluate:
        evaluation = evaluate_answer(
            question,
            answer,
            session.difficulty,
        )

    else:
        evaluation = {
            "score": 0,
            "feedback": (
                "Answer saved successfully. "
                "It will be evaluated when the interview is completed."
            ),
            "strengths": [],
            "improvements": [],
        }

    interview_answer, created = InterviewAnswer.objects.update_or_create(
        session=session,
        question_number=question_number,
        defaults={
            "question": question,
            "answer": answer,
            "score": evaluation.get("score", 0),
            "feedback": evaluation.get("feedback", ""),
            "strengths": evaluation.get(
                "strengths",
                [],
            ),
            "improvements": evaluation.get(
                "improvements",
                [],
            ),
            "time_spent_seconds": time_spent_seconds,
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

    # =====================================================
    # LAST QUESTION - FINALIZE INTERVIEW
    # =====================================================

    answers = session.answers.all().order_by("question_number")

    pending_answers = []

    for item in answers:
        if item.answer != "[SKIPPED]" and item.feedback.startswith(
            "Answer saved successfully."
        ):
            pending_answers.append(
                {
                    "question_number": item.question_number,
                    "question": item.question,
                    "answer": item.answer,
                }
            )

    if pending_answers:
        batch_results = evaluate_answers_batch(
            pending_answers,
            session.difficulty,
        )

        result_map = {
            int(result.get("question_number")): result
            for result in batch_results
            if result.get("question_number") is not None
        }

        for item in answers:
            result = result_map.get(item.question_number)

            if not result:
                continue

            item.score = result.get(
                "score",
                0,
            )

            item.feedback = result.get(
                "feedback",
                "",
            )

            item.strengths = result.get(
                "strengths",
                [],
            )

            item.improvements = result.get(
                "improvements",
                [],
            )

            item.save()

    questions_and_answers = []

    for item in answers:
        questions_and_answers.append(
            {
                "question_number": item.question_number,
                "question": item.question,
                "answer": item.answer,
                "score": item.score,
                "feedback": item.feedback,
                "strengths": item.strengths,
                "improvements": item.improvements,
            }
        )

    final_evaluation = generate_final_report(questions_and_answers)

    session.score = final_evaluation.get(
        "overall_score",
        0,
    )

    session.technical_score = final_evaluation.get(
        "technical_score",
        0,
    )

    session.communication_score = final_evaluation.get(
        "communication_score",
        0,
    )

    session.feedback = final_evaluation.get(
        "final_feedback",
        "",
    )

    session.strengths = final_evaluation.get(
        "strengths",
        [],
    )

    session.weaknesses = final_evaluation.get(
        "weaknesses",
        [],
    )

    session.improvements = final_evaluation.get(
        "improvements",
        [],
    )

    session.status = "completed"
    session.ended_at = timezone.now()

    session.save()

    return Response(
        {
            "message": "Interview completed successfully",
            "session_id": session.id,
            "score": evaluation.get("score", 0),
            "feedback": evaluation.get("feedback", ""),
            "strengths": evaluation.get("strengths", []),
            "improvements": evaluation.get(
                "improvements",
                [],
            ),
            "interview_completed": True,
            "total_questions": len(session.questions),
        }
    )


@api_view(["GET", "DELETE"])
@permission_classes([IsAuthenticated])
def final_report(request, session_id):
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

    if request.method == "DELETE":
        session.delete()

        return Response(
            {"message": "Interview deleted successfully"},
            status=200,
        )

    # Only completed interviews should have a final report
    if session.status != "completed":
        return Response(
            {"error": "Interview is not completed yet"},
            status=400,
        )

    answers = session.answers.all().order_by("question_number")

    # Read the already-saved interview results.
    # Do NOT regenerate the AI report every time
    # the candidate opens View Feedback.

    candidate_name = (
        getattr(request.user, "name", "") or getattr(request.user, "username", "") or ""
    )

    candidate_email = getattr(request.user, "email", "") or ""

    report_data = {
        "id": str(session.id),
        "interviewId": str(session.id),
        "userId": str(session.user.id),
        "candidateName": candidate_name,
        "candidateEmail": candidate_email,
        "company": session.company or "General Company",
        "role": session.role or "Software Engineer",
        "difficulty": session.difficulty,
        "type": session.interview_type,
        "date": (session.created_at.isoformat() if session.created_at else None),
        "overallScore": session.score or 0,
        "radarMetrics": {
            "technical": session.technical_score or 0,
            "communication": session.communication_score or 0,
            "problemSolving": session.score or 0,
            "confidence": session.score or 0,
            "systemDesignCulture": session.score or 0,
        },
        "topStrengths": session.strengths or [],
        "keyWeaknesses": session.weaknesses or [],
        "actionableSuggestions": session.improvements or [],
        "finalAiRemark": session.feedback or "",
        "questions": [
            {
                "id": f"question-{item.question_number}",
                "questionNumber": item.question_number,
                "category": session.interview_type,
                "question": item.question,
                "userAnswer": item.answer,
                "evaluation": {
                    "score": item.score or 0,
                    "feedback": item.feedback or "",
                    "strengths": item.strengths or [],
                    "weaknesses": item.improvements or [],
                },
            }
            for item in answers
        ],
        "cameraEnabled": session.camera_enabled,
        "cameraFeedback": session.camera_feedback,
    }

    return Response({"report": report_data})


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

    answers = session.answers.all().order_by("question_number")
    if answers.exists():
        questions_and_answers = [
            {
                "question_number": item.question_number,
                "question": item.question,
                "answer": item.answer,
                "score": item.score,
                "feedback": item.feedback,
                "strengths": item.strengths,
                "improvements": item.improvements,
            }
            for item in answers
        ]
        final_eval = generate_final_report(questions_and_answers)
        session.score = final_eval.get("overall_score", 0)
        session.technical_score = final_eval.get("technical_score", 0)
        session.communication_score = final_eval.get("communication_score", 0)
        session.feedback = final_eval.get("final_feedback", "")
        session.strengths = final_eval.get("strengths", [])
        session.weaknesses = final_eval.get("weaknesses", [])
        session.improvements = final_eval.get("improvements", [])
        session.status = "completed"
    else:
        session.status = "ended"

    session.end_reason = reason
    session.end_note = note
    session.ended_at = timezone.now()
    session.save()

    return Response({
        "message": "Interview processed successfully",
        "status": session.status,
        "has_answers": answers.exists()
    })


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
