from django.urls import path
from .leaderboard_views import leaderboard

from .views import (
    generate_interview,
    start_interview,
    submit_answer,
    final_report,
    end_interview,
    submit_feedback,
)

urlpatterns = [
    path("generate/", generate_interview),
    path("start/", start_interview),
    path("answer/", submit_answer),
    path("report/<int:session_id>/", final_report),
    path("end/", end_interview),
    path("feedback/", submit_feedback),
    path("leaderboard/", leaderboard),
]
