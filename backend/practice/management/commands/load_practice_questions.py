from django.core.management.base import BaseCommand

from practice.models import PracticeQuestion
from practice.views import PRACTICE_QUESTIONS


class Command(BaseCommand):
    help = "Load built-in practice questions into PostgreSQL."

    def handle(self, *args, **options):
        created_count = 0
        updated_count = 0

        for item in PRACTICE_QUESTIONS:
            question, created = PracticeQuestion.objects.update_or_create(
                question_id=item.get("id", ""),
                defaults={
                    "title": item.get("title", ""),
                    "question_type": item.get("type", ""),
                    "topic_or_language": item.get(
                        "topicOrLanguage",
                        "",
                    ),
                    "difficulty": item.get(
                        "difficulty",
                        "",
                    ),
                    "question": item.get(
                        "question",
                        "",
                    ),
                    "options": item.get(
                        "options",
                        [],
                    ),
                    "correct_answer": item.get(
                        "correctAnswer",
                        "",
                    ),
                    "explanation": item.get(
                        "explanation",
                        "",
                    ),
                    "fill_blank_snippet": item.get(
                        "fillBlankSnippet",
                        "",
                    ),
                    "fill_blank_answer": item.get(
                        "fillBlankAnswer",
                        "",
                    ),
                    "initial_code": item.get(
                        "initialCode",
                        "",
                    ),
                    "language_templates": item.get(
                        "languageTemplates",
                        {},
                    ),
                    "hints": item.get(
                        "hints",
                        [],
                    ),
                },
            )

            if created:
                created_count += 1
            else:
                updated_count += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Created: {created_count}, Updated: {updated_count}"
            )
        )
