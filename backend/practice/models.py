from django.db import models
from accounts.models import User


class PracticeAttempt(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="practice_attempts",
    )

    question_id = models.CharField(
        max_length=120,
    )

    question_title = models.CharField(
        max_length=255,
    )

    question_type = models.CharField(
        max_length=50,
    )

    topic_or_language = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    difficulty = models.CharField(
        max_length=20,
        blank=True,
        default="",
    )

    question_data = models.JSONField(
        default=dict,
        blank=True,
    )

    user_answer = models.TextField(
        blank=True,
        default="",
    )

    submitted_code = models.TextField(
        blank=True,
        default="",
    )

    programming_language = models.CharField(
        max_length=50,
        blank=True,
        default="",
    )

    score = models.FloatField(
        default=0,
    )

    feedback = models.TextField(
        blank=True,
        default="",
    )

    strengths = models.JSONField(
        default=list,
        blank=True,
    )

    improvements = models.JSONField(
        default=list,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=[
                    "user",
                    "question_id",
                ],
                name="unique_user_practice_question",
            )
        ]

    def __str__(self):
        return f"{self.user.email} - " f"{self.question_title}"


class InterviewPracticeAttempt(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="interview_practice_attempts",
    )

    topic = models.CharField(
        max_length=120,
        default="Tell Me About Yourself",
    )

    question = models.CharField(
        max_length=500,
    )

    transcript = models.TextField(
        blank=True,
        default="",
    )

    camera_used = models.BooleanField(
        default=False,
    )

    overall_score = models.FloatField(
        default=0,
    )

    content_score = models.FloatField(
        default=0,
    )

    structure_score = models.FloatField(
        default=0,
    )

    clarity_score = models.FloatField(
        default=0,
    )

    communication_score = models.FloatField(
        default=0,
    )

    feedback = models.TextField(
        blank=True,
        default="",
    )

    strengths = models.JSONField(
        default=list,
        blank=True,
    )

    improvements = models.JSONField(
        default=list,
        blank=True,
    )

    better_answer = models.TextField(
        blank=True,
        default="",
    )

    camera_feedback = models.JSONField(
        default=dict,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.user.email} - " f"{self.question}"


class PracticeQuestion(models.Model):
    question_id = models.CharField(
        max_length=120,
        unique=True,
    )

    title = models.CharField(
        max_length=255,
    )

    question_type = models.CharField(
        max_length=50,
    )

    topic_or_language = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )

    difficulty = models.CharField(
        max_length=20,
        blank=True,
        default="",
    )

    question = models.TextField()

    options = models.JSONField(
        default=list,
        blank=True,
    )

    correct_answer = models.TextField(
        blank=True,
        default="",
    )

    explanation = models.TextField(
        blank=True,
        default="",
    )

    fill_blank_snippet = models.TextField(
        blank=True,
        default="",
    )

    fill_blank_answer = models.TextField(
        blank=True,
        default="",
    )

    initial_code = models.TextField(
        blank=True,
        default="",
    )

    language_templates = models.JSONField(
        default=dict,
        blank=True,
    )

    hints = models.JSONField(
        default=list,
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"{self.question_id} - {self.title}"
