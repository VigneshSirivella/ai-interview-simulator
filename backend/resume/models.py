from django.db import models
from accounts.models import User


class Resume(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="resume_data",
    )

    file = models.FileField(upload_to="resumes/")

    uploaded_at = models.DateTimeField(auto_now_add=True)

    extracted_text = models.TextField(blank=True)

    skills = models.TextField(blank=True)

    experience = models.TextField(blank=True)

    education = models.TextField(blank=True)

    def __str__(self):
        return self.user.email
