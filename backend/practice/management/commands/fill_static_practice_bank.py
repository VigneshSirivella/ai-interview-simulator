import uuid

from django.core.management.base import BaseCommand

from practice.models import PracticeQuestion


LANGUAGES = [
    "Python",
    "C",
    "Java",
    "C++",
    "JavaScript",
    "SQL",
    "DSA",
]

TARGETS = {
    "Easy": 35,
    "Medium": 40,
    "Hard": 25,
}


QUESTION_TEMPLATES = {
    "Easy": [
        "Reverse a string",
        "Find maximum element",
        "Count vowels",
        "Check palindrome",
        "Find duplicate values",
        "Merge two arrays",
        "Remove duplicates",
        "Find second largest",
        "Count frequency",
        "Find missing number",
        "Check anagram",
        "Linear search",
        "Binary search",
        "Sum of array",
        "Rotate array",
        "Move zeros",
        "Find intersection",
        "Find union",
        "Count words",
        "Reverse words",
        "Check balanced brackets",
        "Find minimum element",
        "Sort array",
        "Find common elements",
        "Prefix sum",
        "Find unique element",
        "Count digits",
        "Fibonacci sequence",
        "Factorial",
        "Prime check",
        "GCD calculation",
        "LCM calculation",
        "Swap values",
        "Character frequency",
        "Matrix transpose",
    ],
    "Medium": [
        "Longest substring without repeating characters",
        "Two sum variations",
        "Three sum",
        "Maximum subarray",
        "Merge intervals",
        "Product of array except self",
        "Group anagrams",
        "Top K frequent elements",
        "Longest consecutive sequence",
        "Container with most water",
        "Spiral matrix",
        "Search rotated sorted array",
        "Find peak element",
        "Subarray sum equals K",
        "Longest increasing subsequence",
        "Coin change",
        "House robber",
        "Decode ways",
        "Word break",
        "Number of islands",
        "Flood fill",
        "Course schedule",
        "Clone graph",
        "Binary tree level order",
        "Lowest common ancestor",
        "Validate BST",
        "Kth smallest in BST",
        "Diameter of binary tree",
        "Linked list cycle",
        "Remove nth node",
        "Reorder list",
        "LRU cache basics",
        "Queue using stacks",
        "Stack using queues",
        "Evaluate postfix expression",
        "Sliding window maximum",
        "Minimum window substring",
        "Generate parentheses",
        "Permutations",
        "Combination sum",
    ],
    "Hard": [
        "Median of two sorted arrays",
        "Trapping rain water",
        "Regular expression matching",
        "Edit distance",
        "Longest valid parentheses",
        "Minimum path sum with constraints",
        "Word ladder",
        "N queens",
        "Sudoku solver",
        "Serialize deserialize binary tree",
        "Maximum path sum in binary tree",
        "Alien dictionary",
        "Minimum spanning tree",
        "Dijkstra advanced variant",
        "Bellman Ford negative cycle",
        "Floyd Warshall optimization",
        "Travelling salesman",
        "Segment tree range query",
        "Fenwick tree operations",
        "Trie word search",
        "Dynamic programming on trees",
        "Matrix chain multiplication",
        "Longest palindromic subsequence",
        "Wildcard matching",
        "Minimum cost maximum flow",
    ],
}


def build_question(language, difficulty, title, index):
    if language == "SQL":
        question_text = (
            f"Write an SQL query for the problem: {title}. "
            "Use suitable tables and return the required result."
        )

        initial_code = "-- Write your SQL query here\n"

    elif language == "DSA":
        question_text = (
            f"Solve the following DSA problem: {title}. "
            "Explain the approach and write an efficient solution."
        )

        initial_code = ""

    else:
        question_text = (
            f"Using {language}, solve this problem: {title}. "
            "Write a correct and efficient program."
        )

        initial_code = "// Write your solution here\n"

    return {
        "question_id": (
            f"static-{language.lower().replace('+', 'p').replace(' ', '-')}-"
            f"{difficulty.lower()}-{index}-{uuid.uuid4().hex[:6]}"
        ),
        "title": f"{title} - {language}",
        "question_type": "Coding",
        "topic_or_language": language,
        "difficulty": difficulty,
        "question": question_text,
        "options": [],
        "correct_answer": "",
        "explanation": "",
        "fill_blank_snippet": "",
        "fill_blank_answer": "",
        "initial_code": initial_code,
        "language_templates": {},
        "hints": [
            "Start with a simple brute-force idea.",
            "Then think about reducing time or space complexity.",
        ],
    }


class Command(BaseCommand):
    help = "Fill missing practice questions up to 100 per language."

    def handle(self, *args, **options):
        for language in LANGUAGES:
            self.stdout.write(
                f"\nFilling {language}..."
            )

            for difficulty, target in TARGETS.items():
                current = PracticeQuestion.objects.filter(
                    topic_or_language__iexact=language,
                    difficulty__iexact=difficulty,
                ).count()

                self.stdout.write(
                    f"{difficulty}: {current}/{target}"
                )

                needed = target - current

                if needed <= 0:
                    continue

                templates = QUESTION_TEMPLATES[difficulty]

                created = 0
                template_index = 0

                while created < needed:
                    base_title = templates[
                        template_index % len(templates)
                    ]

                    variation = (
                        base_title
                        if template_index < len(templates)
                        else f"{base_title} Variant {template_index + 1}"
                    )

                    exists = PracticeQuestion.objects.filter(
                        topic_or_language__iexact=language,
                        difficulty__iexact=difficulty,
                        title__iexact=f"{variation} - {language}",
                    ).exists()

                    if not exists:
                        data = build_question(
                            language,
                            difficulty,
                            variation,
                            template_index + 1,
                        )

                        PracticeQuestion.objects.create(
                            **data
                        )

                        created += 1

                    template_index += 1

                final_count = PracticeQuestion.objects.filter(
                    topic_or_language__iexact=language,
                    difficulty__iexact=difficulty,
                ).count()

                self.stdout.write(
                    self.style.SUCCESS(
                        f"Added {created}. Now {final_count}/{target}"
                    )
                )

        self.stdout.write(
            self.style.SUCCESS(
                "\nStatic practice bank completed."
            )
        )
