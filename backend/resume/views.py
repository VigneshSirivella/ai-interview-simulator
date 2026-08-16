from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
import os

import json
import re

from interviews.gemini import client, MODEL_NAME

from .models import Resume
from .serializers import ResumeSerializer
from .parser import extract_text
from .ai_parser import (
    extract_skills,
    extract_experience,
    extract_education,
)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_resume(request):
    file = request.FILES.get("file")

    if not file:
        return Response({"error": "No file uploaded"}, status=400)

    resume, created = Resume.objects.get_or_create(user=request.user)

    resume.file = file
    resume.save()

    text = extract_text(resume.file.path)

    resume.extracted_text = text

    filename = os.path.basename(resume.file.name)

    resume.skills = extract_skills(resume.extracted_text)
    resume.experience = extract_experience(resume.extracted_text)
    resume.education = extract_education(resume.extracted_text)

    resume.save()

    serializer = ResumeSerializer(resume)

    return Response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_resume(request):
    try:
        resume = Resume.objects.get(user=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=404)

    serializer = ResumeSerializer(resume)

    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_resume(request):
    try:
        resume = Resume.objects.get(user=request.user)
    except Resume.DoesNotExist:
        return Response({"error": "Resume not found"}, status=404)

    resume.delete()

    return Response({"message": "Resume deleted successfully"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def job_recommendations(request):
    try:
        resume = Resume.objects.get(user=request.user)
    except Resume.DoesNotExist:
        return Response(
            {"error": "Upload and analyze your resume first."},
            status=404,
        )

    skills_text = (resume.skills or resume.extracted_text or "").lower()

    recommendations = []

    def add_role(title, category, reason):
        if not any(item["title"] == title for item in recommendations):
            recommendations.append(
                {
                    "title": title,
                    "category": category,
                    "reason": reason,
                }
            )

    if any(
        skill in skills_text
        for skill in [
            "html",
            "css",
            "javascript",
            "react",
        ]
    ):
        add_role(
            "Frontend Developer Intern",
            "Internship",
            "Matches your web development skills.",
        )

        add_role(
            "Web Developer Intern",
            "Internship",
            "Matches your HTML, CSS and JavaScript skills.",
        )

    if any(
        skill in skills_text
        for skill in [
            "python",
            "django",
            "flask",
            "node",
        ]
    ):
        add_role(
            "Backend Developer Intern",
            "Internship",
            "Matches your backend programming skills.",
        )

    if any(
        skill in skills_text
        for skill in [
            "mysql",
            "sql",
            "database",
        ]
    ):
        add_role(
            "Software Developer Intern",
            "Internship",
            "Matches your programming and database skills.",
        )

    if any(
        skill in skills_text
        for skill in [
            "python",
            "java",
            "javascript",
            "data structures",
            "oop",
        ]
    ):
        add_role(
            "Software Engineer Intern",
            "Internship",
            "Matches your core programming skills.",
        )

    if not recommendations:
        add_role(
            "Software Development Intern",
            "Internship",
            "A general software role suitable for building industry experience.",
        )

    return Response(
        {
            "recommendations": recommendations,
            "total": len(recommendations),
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def analyze_resume(request):
    resume_text = request.data.get(
        "resumeText",
        "",
    )

    target_role = request.data.get(
        "targetRole",
        "Software Engineer",
    )

    if not resume_text.strip():
        return Response(
            {"error": "Resume text is required."},
            status=400,
        )

    prompt = f"""
You are an expert ATS resume analyzer and career advisor.

Candidate Resume:
{resume_text}

Target Role:
{target_role}

Analyze the resume.

Return ONLY valid JSON using exactly this structure:

{{
  "atsScore": 0,
  "extractedName": "",
  "extractedEmail": "",
  "extractedSkills": [],
  "missingSkills": [],
  "formattingScore": 0,
  "keywordDensityScore": 0,
  "bulletPointFeedback": [],
  "actionableTips": [],
  "suggestedRoles": [],
  "parsedSummary": "",
  "candidateExperience": "",
  "recommendedPrepTopics": []
}}

Rules:
- Scores must be between 0 and 100.
- extractedSkills must come from the resume.
- missingSkills should be relevant to the target role.
- suggestedRoles should suit the candidate's skills.
- Give practical feedback.
- Do not return markdown.
- Return JSON only.
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        text = response.text.strip()

        text = re.sub(
            r"^```json",
            "",
            text,
            flags=re.IGNORECASE,
        )

        text = re.sub(
            r"^```",
            "",
            text,
        )

        text = re.sub(
            r"```$",
            "",
            text,
        )

        result = json.loads(text.strip())

        return Response({"result": result})

    except Exception as error:
        error_text = str(error)

        print(
            "Resume analysis error:",
            error,
        )

        if (
            "429" in error_text
            or "RESOURCE_EXHAUSTED" in error_text
            or "quota" in error_text.lower()
        ):
            return Response(
                {"error": "AI quota reached. Please try again after some time."},
                status=429,
            )

        return Response(
            {"error": "Unable to analyze resume right now."},
            status=500,
        )
