from django.urls import path

from .views import (
    upload_resume,
    my_resume,
    delete_resume,
    job_recommendations,
    analyze_resume,
)

urlpatterns = [
    path("upload/", upload_resume),
    path("my-resume/", my_resume),
    path("delete/", delete_resume),
    path(
        "job-recommendations/",
        job_recommendations,
    ),
    path(
        "analyze/",
        analyze_resume,
    ),
]
