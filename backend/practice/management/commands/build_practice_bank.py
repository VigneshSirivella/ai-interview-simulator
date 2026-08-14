import json
import time
import uuid

from django.core.management.base import BaseCommand

from interviews.gemini import client, MODEL_NAME
from practice.models import PracticeQuestion
from practice.views import clean_json_response

LANGUAGES = [
    "C++",
    "JavaScript",
    "SQL",
    "DSA",
    "Java",
    "Python",
    "C",
]

DIFFICULTY_TARGETS = {
    "Easy": 35,
    "Medium": 40,
    "Hard": 25,
}


class Command(BaseCommand):
    help = "Build a 100-question practice bank for each language/topic."
    quota_exhausted = False

    def handle(self, *args, **options):
        self.quota_exhausted = False

        for language in LANGUAGES:
            if self.quota_exhausted:
                break

            self.stdout.write(f"\nBuilding question bank for {language}...")

            for difficulty, target in DIFFICULTY_TARGETS.items():
                if self.quota_exhausted:
                    break

                self.build_difficulty(
                    language,
                    difficulty,
                    target,
                )

        if self.quota_exhausted:
            self.stdout.write(
                self.style.WARNING(
                    "\nStopped because Gemini quota was exhausted. "
                    "Run this command again after the quota resets."
                )
            )
        else:
            self.stdout.write(
                self.style.SUCCESS("\nPractice bank generation completed.")
            )

    def build_difficulty(
        self,
        language,
        difficulty,
        target,
    ):

        existing = PracticeQuestion.objects.filter(
            topic_or_language__iexact=language,
            difficulty__iexact=difficulty,
        ).count()

        self.stdout.write(f"{language} - {difficulty}: " f"{existing}/{target}")

        while existing < target:
            remaining = target - existing
            batch_size = min(10, remaining)

            questions = self.generate_batch(
                language,
                difficulty,
                batch_size,
            )

            if not questions:
                self.stdout.write(
                    self.style.WARNING("No questions returned. Stopping this section.")
                )
                break

            created_count = 0

            for item in questions:
                title = item.get("title", "").strip()
                question_text = item.get(
                    "question",
                    "",
                ).strip()

                if not title or not question_text:
                    continue

                duplicate = PracticeQuestion.objects.filter(
                    topic_or_language__iexact=language,
                    difficulty__iexact=difficulty,
                    title__iexact=title,
                ).exists()

                if duplicate:
                    continue

                question_id = (
                    f"bank-"
                    f"{language.lower().replace('+', 'p').replace(' ', '-')}-"
                    f"{difficulty.lower()}-"
                    f"{uuid.uuid4().hex[:10]}"
                )

                PracticeQuestion.objects.create(
                    question_id=question_id,
                    title=title,
                    question_type=item.get(
                        "type",
                        "Coding",
                    ),
                    topic_or_language=language,
                    difficulty=difficulty,
                    question=question_text,
                    options=item.get(
                        "options",
                        [],
                    ),
                    correct_answer=item.get(
                        "correctAnswer",
                        "",
                    ),
                    explanation=item.get(
                        "explanation",
                        "",
                    ),
                    fill_blank_snippet=item.get(
                        "fillBlankSnippet",
                        "",
                    ),
                    fill_blank_answer=item.get(
                        "fillBlankAnswer",
                        "",
                    ),
                    initial_code=item.get(
                        "initialCode",
                        "",
                    ),
                    language_templates=item.get(
                        "languageTemplates",
                        {},
                    ),
                    hints=item.get(
                        "hints",
                        [],
                    ),
                )

                created_count += 1

            existing = PracticeQuestion.objects.filter(
                topic_or_language__iexact=language,
                difficulty__iexact=difficulty,
            ).count()

            self.stdout.write(
                self.style.SUCCESS(
                    f"Added {created_count}. " f"Now {existing}/{target}"
                )
            )

            if created_count == 0:
                self.stdout.write(
                    self.style.WARNING(
                        "Only duplicate questions were returned. "
                        "Stopping this section."
                    )
                )
                break

            time.sleep(2)

    def generate_batch(
        self,
        language,
        difficulty,
        batch_size,
    ):
        existing_titles = list(
            PracticeQuestion.objects.filter(
                topic_or_language__iexact=language,
                difficulty__iexact=difficulty,
            ).values_list("title", flat=True,)[:80]
        )

        prompt = f"""
You are an expert competitive-programming and
software-engineering practice question creator.

Generate exactly {batch_size} UNIQUE questions.

Language or Topic:
{language}

Difficulty:
{difficulty}

Create LeetCode-style practice questions.

For Python, C, Java, C++, JavaScript and DSA:
- Prefer coding and algorithmic problems.
- Include a clear problem statement.
- Include useful starter code where appropriate.
- Include 2 or 3 hints.
- Do not include the final solution.

For SQL:
- Create realistic SQL query problems.
- Include tables/scenario in the problem statement.
- Include no final SQL solution.

Avoid these existing titles:
{json.dumps(existing_titles)}

Return ONLY valid JSON:

{{
  "questions": [
    {{
      "title": "Short unique title",
      "type": "Coding",
      "question": "Full problem statement",
      "options": [],
      "correctAnswer": "",
      "explanation": "",
      "fillBlankSnippet": "",
      "fillBlankAnswer": "",
      "initialCode": "",
      "languageTemplates": {{
        "python": "",
        "javascript": "",
        "java": "",
        "cpp": ""
      }},
      "hints": []
    }}
  ]
}}

Rules:
- Match the requested difficulty.
- Do not repeat existing titles.
- Make every question meaningfully different.
- Return JSON only.
"""

        for attempt in range(2):
            try:
                response = client.models.generate_content(
                    model=MODEL_NAME,
                    contents=prompt,
                )

                cleaned = clean_json_response(response.text)

                data = json.loads(cleaned)

                return data.get(
                    "questions",
                    [],
                )

            except Exception as error:
                error_text = str(error)

                if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text:
                    self.quota_exhausted = True

                    self.stdout.write(
                        self.style.ERROR(
                            "Gemini quota exhausted. " "Stopping generation."
                        )
                    )

                    return []

                if attempt == 0:
                    self.stdout.write(
                        self.style.WARNING(
                            "Invalid Gemini response. " "Retrying once..."
                        )
                    )

                    time.sleep(2)
                    continue

                self.stdout.write(self.style.ERROR(f"Generation error: {error}"))

                return []
