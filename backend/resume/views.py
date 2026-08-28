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

    try:
        text = extract_text(resume.file.path)
    except Exception as e:
        print("RESUME UPLOAD ERROR:", repr(e))
        return Response(
            {"error": str(e)},
            status=500,
        )

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


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def job_recommendations(request):
    import random
    import time

    target_role = (
        request.GET.get("role")
        or (request.data.get("targetRole") if isinstance(request.data, dict) else None)
        or "Software Engineer"
    )
    seed_param = (
        request.GET.get("seed")
        or (request.data.get("seed") if isinstance(request.data, dict) else None)
        or str(int(time.time() * 1000))
    )

    try:
        resume = Resume.objects.get(user=request.user)
        skills_text = (resume.skills or resume.extracted_text or "").lower()
    except Resume.DoesNotExist:
        skills_text = ""

    # Comprehensive role-tailored active internship pools
    role_internships_pool = {
        "Full Stack Developer": [
            {
                "title": "Full-Stack Software Engineering Intern",
                "company": "Microsoft",
                "category": "Active Internship",
                "reason": "Matches your React, Node.js, and SQL full-stack capabilities.",
                "deadline": "Active • Closes in 14 days",
            },
            {
                "title": "MERN Stack Developer Intern",
                "company": "Stripe",
                "category": "Active Internship",
                "reason": "Tailored for web application development and payment API integration.",
                "deadline": "Posted 2 days ago • Active",
            },
            {
                "title": "Cloud Full-Stack Systems Intern",
                "company": "Amazon AWS",
                "category": "Active Internship",
                "reason": "Ideal for building scalable web interfaces and serverless microservices.",
                "deadline": "Active • Closes in 18 days",
            },
            {
                "title": "Web Platform Engineering Intern",
                "company": "Vercel",
                "category": "Active Internship",
                "reason": "Perfect match for TypeScript, Next.js, and modern web apps.",
                "deadline": "Posted yesterday • Active",
            },
            {
                "title": "Full-Stack Application Intern",
                "company": "Meta",
                "category": "Active Internship",
                "reason": "Matches high-scale UI component and backend database architecture.",
                "deadline": "Active • Closes in 8 days",
            },
            {
                "title": "Frontend & Backend Systems Intern",
                "company": "Uber",
                "category": "Active Internship",
                "reason": "Recommended for end-to-end web software engineering.",
                "deadline": "Active • Closes in 15 days",
            },
        ],
        "Frontend Developer": [
            {
                "title": "Frontend Software Engineering Intern",
                "company": "Meta",
                "category": "Active Internship",
                "reason": "Matches your React, JavaScript, and modern UI design skills.",
                "deadline": "Active • Closes in 12 days",
            },
            {
                "title": "UI & Design Systems Intern",
                "company": "Figma",
                "category": "Active Internship",
                "reason": "Tailored for CSS, responsive layouts, and reusable components.",
                "deadline": "Posted 3 days ago • Active",
            },
            {
                "title": "Web Experience Developer Intern",
                "company": "Airbnb",
                "category": "Active Internship",
                "reason": "Ideal for building intuitive, high-performance web interfaces.",
                "deadline": "Active • Closes in 9 days",
            },
            {
                "title": "Next.js & React Core Developer Intern",
                "company": "Vercel",
                "category": "Active Internship",
                "reason": "Matches client-side state management and performance tuning.",
                "deadline": "Posted 1 day ago • Active",
            },
            {
                "title": "Frontend Platform Engineering Intern",
                "company": "Netflix",
                "category": "Active Internship",
                "reason": "Matches client rendering and interactive UI framework skills.",
                "deadline": "Active • Closes in 16 days",
            },
        ],
        "Backend Developer": [
            {
                "title": "Backend Systems & API Intern",
                "company": "Google",
                "category": "Active Internship",
                "reason": "Matches your Python, Django/Node, and database architecture skills.",
                "deadline": "Active • Closes in 11 days",
            },
            {
                "title": "Microservices & Distributed Systems Intern",
                "company": "Stripe",
                "category": "Active Internship",
                "reason": "Tailored for high-reliability financial APIs and server logic.",
                "deadline": "Posted 2 days ago • Active",
            },
            {
                "title": "Cloud Backend & Database Intern",
                "company": "Amazon AWS",
                "category": "Active Internship",
                "reason": "Ideal for data modeling, PostgreSQL, and cloud service processing.",
                "deadline": "Active • Closes in 20 days",
            },
            {
                "title": "Python & REST API Engineering Intern",
                "company": "DoorDash",
                "category": "Active Internship",
                "reason": "Matches server-side business logic and scalable backend flow.",
                "deadline": "Posted yesterday • Active",
            },
            {
                "title": "High-Performance Backend Intern",
                "company": "Datadog",
                "category": "Active Internship",
                "reason": "Tailored for scalable server logging, caching, and database queries.",
                "deadline": "Active • Closes in 7 days",
            },
        ],
        "Data Scientist": [
            {
                "title": "AI & Machine Learning Research Intern",
                "company": "OpenAI",
                "category": "Active Internship",
                "reason": "Matches your Python, Machine Learning, and mathematics background.",
                "deadline": "Active • Closes in 15 days",
            },
            {
                "title": "Data Analytics & Modeling Intern",
                "company": "Google",
                "category": "Active Internship",
                "reason": "Tailored for statistical analysis, SQL, and data visualization.",
                "deadline": "Posted 3 days ago • Active",
            },
            {
                "title": "NLP & Language Model Engineer Intern",
                "company": "Anthropic",
                "category": "Active Internship",
                "reason": "Ideal for LLM fine-tuning, PyTorch, and NLP processing pipelines.",
                "deadline": "Active • Closes in 10 days",
            },
            {
                "title": "Computer Vision & ML Systems Intern",
                "company": "Tesla AI",
                "category": "Active Internship",
                "reason": "Matches deep learning, OpenCV, and automated perception systems.",
                "deadline": "Posted 1 day ago • Active",
            },
        ],
        "DevOps Engineer": [
            {
                "title": "Cloud Infrastructure & SRE Intern",
                "company": "Amazon AWS",
                "category": "Active Internship",
                "reason": "Matches Docker, Kubernetes, and Cloud automation operations.",
                "deadline": "Active • Closes in 14 days",
            },
            {
                "title": "CI/CD & Platform Automation Intern",
                "company": "GitHub",
                "category": "Active Internship",
                "reason": "Tailored for Linux systems, build pipelines, and shell scripting.",
                "deadline": "Posted 2 days ago • Active",
            },
            {
                "title": "Systems Security & Edge Infrastructure Intern",
                "company": "Cloudflare",
                "category": "Active Internship",
                "reason": "Ideal for network security, edge computing, and system monitoring.",
                "deadline": "Active • Closes in 12 days",
            },
        ],
        "Software Engineer": [
            {
                "title": "Software Engineering Intern",
                "company": "Google",
                "category": "Active Internship",
                "reason": "Matches Data Structures, Algorithms, and Core Engineering logic.",
                "deadline": "Active • Closes in 14 days",
            },
            {
                "title": "Software Development Engineering (SDE) Intern",
                "company": "Amazon",
                "category": "Active Internship",
                "reason": "Tailored for object-oriented design and distributed software.",
                "deadline": "Posted 2 days ago • Active",
            },
            {
                "title": "Core Operating Systems Intern",
                "company": "Apple",
                "category": "Active Internship",
                "reason": "Matches high-performance C++/Java/Python software engineering.",
                "deadline": "Active • Closes in 18 days",
            },
            {
                "title": "Full-Stack Software Engineering Intern",
                "company": "Microsoft",
                "category": "Active Internship",
                "reason": "Ideal for cross-platform app creation and cloud developer tools.",
                "deadline": "Posted 1 day ago • Active",
            },
            {
                "title": "Platform Software Engineer Intern",
                "company": "Uber",
                "category": "Active Internship",
                "reason": "Matches modern software architecture and scalable database design.",
                "deadline": "Active • Closes in 9 days",
            },
        ],
    }

    # Find matching pool for target role
    matched_pool = role_internships_pool.get(target_role)
    if not matched_pool:
        for role_key, pool in role_internships_pool.items():
            if role_key.lower() in target_role.lower() or target_role.lower() in role_key.lower():
                matched_pool = pool
                break

    if not matched_pool:
        matched_pool = role_internships_pool["Software Engineer"]

    # Use seed to randomize sample so re-analyzing/re-uploading gives NEW internships every time
    rnd = random.Random(str(seed_param) + str(target_role) + str(skills_text))
    sample_size = min(4, len(matched_pool))
    recommendations = rnd.sample(matched_pool, sample_size)

    return Response(
        {
            "recommendations": recommendations,
            "total": len(recommendations),
            "targetRole": target_role,
            "seed": seed_param,
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

        # Local fallback when Gemini is unavailable or quota is exhausted
        words = resume_text.lower()

        common_skills = [
            "python",
            "java",
            "javascript",
            "react",
            "django",
            "flask",
            "mysql",
            "postgresql",
            "html",
            "css",
            "git",
            "github",
            "docker",
            "aws",
            "machine learning",
            "deep learning",
            "data structures",
            "algorithms",
        ]

        extracted_skills = [skill for skill in common_skills if skill in words]

        role_skill_map = {
            "Software Engineer": [
                "python",
                "java",
                "data structures",
                "algorithms",
                "git",
                "sql",
            ],
            "Data Scientist": [
                "python",
                "machine learning",
                "deep learning",
                "sql",
                "statistics",
                "pandas",
            ],
            "Frontend Developer": [
                "html",
                "css",
                "javascript",
                "react",
                "git",
            ],
            "Backend Developer": [
                "python",
                "django",
                "flask",
                "mysql",
                "postgresql",
                "docker",
            ],
        }

        expected_skills = role_skill_map.get(
            target_role,
            [],
        )

        missing_skills = [
            skill for skill in expected_skills if skill not in extracted_skills
        ]

        ats_score = min(
            100,
            55 + (len(extracted_skills) * 5),
        )

        fallback_result = {
            "atsScore": ats_score,
            "extractedName": "",
            "extractedEmail": "",
            "extractedSkills": extracted_skills,
            "missingSkills": missing_skills,
            "formattingScore": 75,
            "keywordDensityScore": min(
                100,
                50 + (len(extracted_skills) * 5),
            ),
            "bulletPointFeedback": [
                "Use clear and concise bullet points.",
                "Add measurable achievements where possible.",
            ],
            "actionableTips": [
                "Add role-specific technical keywords.",
                "Highlight projects with clear responsibilities and outcomes.",
                "Keep the resume concise and ATS friendly.",
            ],
            "suggestedRoles": [
                target_role,
            ],
            "parsedSummary": (
                "Resume analyzed using local fallback because "
                "AI analysis is temporarily unavailable."
            ),
            "candidateExperience": "",
            "recommendedPrepTopics": missing_skills,
        }

        return Response(
            {
                "result": fallback_result,
                "fallback": True,
                "message": (
                    "AI analysis is temporarily unavailable. "
                    "Local ATS analysis was used instead."
                ),
            }
        )
