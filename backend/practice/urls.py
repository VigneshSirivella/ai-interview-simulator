from django.urls import path

from .views import (
    get_practice_questions,
    generate_practice_questions,
    evaluate_practice_answer,
    get_practice_attempt,
    get_practice_attempts,
    evaluate_interview_practice,
)

urlpatterns = [
    path(
        "questions/",
        get_practice_questions,
    ),
    path(
        "generate/",
        generate_practice_questions,
    ),
    path(
        "evaluate/",
        evaluate_practice_answer,
    ),
    path(
        "attempt/<str:question_id>/",
        get_practice_attempt,
    ),
    path(
        "attempts/",
        get_practice_attempts,
    ),
    path(
        "interview/evaluate/",
        evaluate_interview_practice,
    ),
]
