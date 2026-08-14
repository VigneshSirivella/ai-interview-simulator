from django.db import models
from accounts.models import User


class InterviewSession(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="interview_sessions",
    )

    # Interview configuration
    company = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    role = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    interview_type = models.CharField(max_length=50)

    difficulty = models.CharField(max_length=20)

    preferred_languages = models.JSONField(
        default=list,
        blank=True,
    )

    # Questions generated for this interview
    questions = models.JSONField(default=list)

    # Interview status
    status = models.CharField(
        max_length=20,
        default="in_progress",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    ended_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # Early interview ending
    end_reason = models.CharField(
        max_length=100,
        blank=True,
    )

    end_note = models.TextField(blank=True)

    # Camera information
    camera_enabled = models.BooleanField(default=False)

    camera_feedback = models.JSONField(
        default=dict,
        blank=True,
    )

    # Final interview scoring
    score = models.FloatField(default=0)

    technical_score = models.FloatField(default=0)

    communication_score = models.FloatField(default=0)

    # Final interview feedback
    feedback = models.TextField(blank=True)

    strengths = models.JSONField(
        default=list,
        blank=True,
    )

    weaknesses = models.JSONField(
        default=list,
        blank=True,
    )

    improvements = models.JSONField(
        default=list,
        blank=True,
    )

    # Candidate feedback about the simulator
    feedback_rating = models.IntegerField(
        null=True,
        blank=True,
    )

    feedback_text = models.TextField(blank=True)

    def __str__(self):
        return (
            f"{self.user.email} - "
            f"{self.company} - "
            f"{self.role} - "
            f"{self.interview_type}"
        )


class InterviewAnswer(models.Model):
    session = models.ForeignKey(
        InterviewSession,
        on_delete=models.CASCADE,
        related_name="answers",
    )

    question_number = models.IntegerField()

    question = models.TextField()

    answer = models.TextField()

    score = models.FloatField(default=0)

    feedback = models.TextField(blank=True)

    strengths = models.JSONField(
        default=list,
        blank=True,
    )

    improvements = models.JSONField(
        default=list,
        blank=True,
    )

    time_spent_seconds = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session {self.session.id} - " f"Question {self.question_number}"
