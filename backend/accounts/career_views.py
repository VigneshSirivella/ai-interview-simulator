import json
import re
import requests

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from interviews.gemini import client, MODEL_NAME


def extract_github_username(github_url):
    if not github_url:
        return ""

    github_url = github_url.strip().rstrip("/")

    match = re.search(
        r"github\.com/([^/?#]+)",
        github_url,
        re.IGNORECASE,
    )

    if not match:
        return ""

    return match.group(1)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def career_intelligence(request):
    user = request.user

    if not user.github:
        return Response(
            {"error": "Add your GitHub profile URL first."},
            status=400,
        )

    username = extract_github_username(user.github)

    if not username:
        return Response(
            {"error": "Invalid GitHub profile URL."},
            status=400,
        )

    headers = {
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }

    try:
        profile_response = requests.get(
            f"https://api.github.com/users/{username}",
            headers=headers,
            timeout=15,
        )

        if profile_response.status_code != 200:
            return Response(
                {"error": "Unable to load GitHub profile."},
                status=400,
            )

        github_profile = profile_response.json()

        repos_response = requests.get(
            f"https://api.github.com/users/{username}/repos",
            headers=headers,
            params={
                "sort": "updated",
                "per_page": 30,
            },
            timeout=15,
        )

        repositories = []

        if repos_response.status_code == 200:
            for repo in repos_response.json():
                repositories.append(
                    {
                        "name": repo.get("name"),
                        "description": repo.get("description"),
                        "language": repo.get("language"),
                        "stars": repo.get(
                            "stargazers_count",
                            0,
                        ),
                        "forks": repo.get(
                            "forks_count",
                            0,
                        ),
                        "url": repo.get("html_url"),
                    }
                )

        github_data = {
            "username": github_profile.get("login"),
            "name": github_profile.get("name"),
            "bio": github_profile.get("bio"),
            "public_repositories": github_profile.get(
                "public_repos",
                0,
            ),
            "followers": github_profile.get(
                "followers",
                0,
            ),
            "following": github_profile.get(
                "following",
                0,
            ),
            "repositories": repositories,
        }

        prompt = f"""
You are an expert software engineering career advisor.

Analyze the candidate's GitHub profile and suggest career improvements.

Candidate:
Name: {user.full_name}
Email: {user.email}

GitHub Profile:
{json.dumps(github_data, indent=2)}

LinkedIn URL:
{user.linkedin or "Not provided"}

Return ONLY valid JSON using exactly this structure:

{{
  "githubScore": 0,
  "profileSummary": "",
  "strongSkills": [],
  "missingSkills": [],
  "recommendedJobs": [],
  "recommendedInternships": [],
  "recommendedProjects": [],
  "githubImprovements": [],
  "resumeImprovements": [],
  "nextLearningSteps": []
}}

Rules:
- githubScore must be between 0 and 100.
- Base strongSkills on actual repository evidence.
- Recommended jobs must match current demonstrated skills.
- Recommended internships must be suitable for the candidate.
- Recommended projects should improve employability.
- Give practical GitHub improvement suggestions.
- Do not invent repositories.
- Return JSON only.
"""

        ai_response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        text = ai_response.text.strip()

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

        return Response(
            {
                "github": github_data,
                "analysis": result,
            }
        )

    except requests.RequestException as error:
        print(
            "GitHub request error:",
            error,
        )

        return Response(
            {"error": "GitHub service is unavailable right now."},
            status=503,
        )

    except Exception as error:
        print(
            "Career intelligence error:",
            error,
        )

        return Response(
            {"error": "Unable to analyze career profile right now."},
            status=500,
        )
