import json
import random
import re
import time

from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from interviews.gemini import client, MODEL_NAME
from .models import (
    PracticeAttempt,
    InterviewPracticeAttempt,
    PracticeQuestion,
)

# =====================================================
# Helper
# =====================================================


def clean_json_response(text):
    text = text.strip()

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

    return text.strip()


# =====================================================
# Built-in Question Library
# =====================================================

PRACTICE_QUESTIONS = [
    # =================================================
    # CODING - EASY
    # =================================================
    {
        "id": "coding-1",
        "title": "Two Sum",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Given an array of integers and a target, "
        "return the indices of two numbers whose sum equals the target.",
        "initialCode": (
            "def two_sum(nums, target):\n" "    # Write your code here\n" "    pass\n"
        ),
        "languageTemplates": {
            "python": ("def two_sum(nums, target):\n" "    pass\n"),
            "javascript": (
                "function twoSum(nums, target) {\n" "  // Write your code here\n" "}\n"
            ),
            "java": (
                "class Solution {\n"
                "    public int[] twoSum(int[] nums, int target) {\n"
                "        return new int[]{};\n"
                "    }\n"
                "}\n"
            ),
            "cpp": (
                "vector<int> twoSum(vector<int>& nums, int target) {\n"
                "    // Write your code here\n"
                "}\n"
            ),
        },
        "hints": [
            "Think about storing previously visited values.",
            "A hash map can reduce the time complexity.",
        ],
    },
    {
        "id": "coding-2",
        "title": "Reverse String",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Write a function that reverses a given string.",
        "initialCode": (
            "def reverse_string(text):\n" "    # Write your code here\n" "    pass\n"
        ),
        "hints": [
            "Think about two pointers.",
            "Python slicing is another possible approach.",
        ],
    },
    {
        "id": "coding-3",
        "title": "Valid Parentheses",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Given a string containing (), {}, and [], "
        "determine whether the brackets are valid and properly nested.",
        "initialCode": (
            "def is_valid(s):\n" "    # Write your code here\n" "    pass\n"
        ),
        "hints": [
            "Use a stack.",
            "When you see a closing bracket, compare it with the stack top.",
        ],
    },
    {
        "id": "coding-4",
        "title": "Binary Search",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Given a sorted array and a target value, "
        "return the index of the target using binary search.",
        "initialCode": (
            "def binary_search(nums, target):\n"
            "    # Write your code here\n"
            "    pass\n"
        ),
        "hints": [
            "Maintain low and high pointers.",
            "Compare the target with the middle element.",
        ],
    },
    {
        "id": "coding-5",
        "title": "Find Maximum Element",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Find the maximum value in an array without using the built-in max function.",
        "initialCode": (
            "def find_max(nums):\n" "    # Write your code here\n" "    pass\n"
        ),
        "hints": [
            "Keep one variable representing the current maximum.",
        ],
    },
    {
        "id": "coding-6",
        "title": "Palindrome Check",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Determine whether a given string is a palindrome.",
        "initialCode": ("def is_palindrome(text):\n" "    pass\n"),
        "hints": [
            "Compare characters from both ends.",
        ],
    },
    # =================================================
    # CODING - MEDIUM
    # =================================================
    {
        "id": "coding-7",
        "title": "Maximum Subarray",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "Find the contiguous subarray with the largest sum and return that sum.",
        "initialCode": (
            "def max_subarray(nums):\n" "    # Write your code here\n" "    pass\n"
        ),
        "hints": [
            "Think about Kadane's algorithm.",
            "Decide whether to continue the previous subarray or start a new one.",
        ],
    },
    {
        "id": "coding-8",
        "title": "Longest Substring Without Repeating Characters",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "Find the length of the longest substring "
        "that contains no repeated characters.",
        "initialCode": ("def longest_unique_substring(s):\n" "    pass\n"),
        "hints": [
            "Use a sliding window.",
            "Track the most recent position of each character.",
        ],
    },
    {
        "id": "coding-9",
        "title": "Merge Intervals",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "Given a list of intervals, merge all overlapping intervals.",
        "initialCode": ("def merge_intervals(intervals):\n" "    pass\n"),
        "hints": [
            "Sort the intervals first.",
            "Compare the current interval with the last merged interval.",
        ],
    },
    # =================================================
    # CODING - HARD
    # =================================================
    {
        "id": "coding-hard-1",
        "title": "Longest Increasing Subsequence",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Given an integer array, return the length of the longest strictly increasing subsequence.",
        "initialCode": (
            "def length_of_lis(nums):\n" "    # Write your code here\n" "    pass\n"
        ),
        "hints": [
            "Think about dynamic programming.",
            "Can binary search improve the O(n^2) approach?",
        ],
    },
    {
        "id": "coding-hard-2",
        "title": "Word Break",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Given a string and a dictionary of words, determine whether the string can be segmented into valid dictionary words.",
        "initialCode": (
            "def word_break(s, word_dict):\n"
            "    # Write your code here\n"
            "    pass\n"
        ),
        "hints": [
            "Think about dynamic programming.",
            "Let dp[i] represent whether the first i characters can be segmented.",
        ],
    },
    {
        "id": "coding-hard-3",
        "title": "Course Schedule",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Given course prerequisites, determine whether all courses can be completed.",
        "initialCode": (
            "def can_finish(num_courses, prerequisites):\n"
            "    # Write your code here\n"
            "    pass\n"
        ),
        "hints": [
            "Model the problem as a directed graph.",
            "Cycle detection or topological sorting can solve it.",
        ],
    },
    {
        "id": "coding-hard-4",
        "title": "LRU Cache",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Design an LRU cache supporting get and put operations in O(1) average time.",
        "initialCode": (
            "class LRUCache:\n"
            "    def __init__(self, capacity):\n"
            "        pass\n\n"
            "    def get(self, key):\n"
            "        pass\n\n"
            "    def put(self, key, value):\n"
            "        pass\n"
        ),
        "hints": [
            "Combine a hash map with a doubly linked list.",
            "The least recently used item should be removable in O(1).",
        ],
    },
    {
        "id": "python-hard-1",
        "title": "Python GIL and Concurrency",
        "type": "Technical",
        "topicOrLanguage": "Python",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Explain Python's Global Interpreter Lock and how it affects multithreading, multiprocessing, and CPU-bound workloads.",
        "hints": [
            "Think about execution of Python bytecode.",
            "Compare CPU-bound and I/O-bound tasks.",
        ],
    },
    {
        "id": "java-hard-1",
        "title": "Java Concurrency",
        "type": "Technical",
        "topicOrLanguage": "Java",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Explain race conditions, synchronization, and deadlocks in Java multithreaded applications.",
        "hints": [
            "Think about shared mutable state.",
            "Consider lock ordering.",
        ],
    },
    {
        "id": "sql-hard-1",
        "title": "SQL Query Optimization",
        "type": "Technical",
        "topicOrLanguage": "SQL",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "How would you diagnose and optimize a slow SQL query involving joins on large tables?",
        "hints": [
            "Think about indexes and execution plans.",
            "Consider join order and unnecessary data retrieval.",
        ],
    },
    {
        "id": "sql-hard-2",
        "title": "Transaction Isolation Levels",
        "type": "Technical",
        "topicOrLanguage": "SQL",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Explain transaction isolation levels and the problems of dirty reads, non-repeatable reads, and phantom reads.",
        "hints": [
            "Compare Read Uncommitted, Read Committed, Repeatable Read, and Serializable.",
        ],
    },
    {
        "id": "js-hard-1",
        "title": "JavaScript Event Loop",
        "type": "Technical",
        "topicOrLanguage": "JavaScript",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "Explain the JavaScript event loop, call stack, microtask queue, and macrotask queue, including Promise execution order.",
        "hints": [
            "Promises normally use the microtask queue.",
            "setTimeout callbacks are macrotasks.",
        ],
    },
    {
        "id": "system-hard-1",
        "title": "Design a URL Shortener",
        "type": "Technical",
        "topicOrLanguage": "DSA",
        "difficulty": "Hard",
        "role": "Software Engineer",
        "question": "How would you design a scalable URL shortening service? Discuss database design, unique key generation, caching, and scaling.",
        "hints": [
            "Think about Base62 encoding.",
            "Consider caching frequently accessed URLs.",
            "Discuss horizontal scaling.",
        ],
    },
    {
        "id": "coding-10",
        "title": "Group Anagrams",
        "type": "Coding",
        "topicOrLanguage": "DSA",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "Group together strings that are anagrams of one another.",
        "initialCode": ("def group_anagrams(words):\n" "    pass\n"),
        "hints": [
            "Words with the same sorted characters belong to the same group.",
            "A dictionary can store the groups.",
        ],
    },
    # =================================================
    # PYTHON
    # =================================================
    {
        "id": "python-1",
        "title": "List vs Tuple",
        "type": "Technical",
        "topicOrLanguage": "Python",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "What is the difference between a list and a tuple in Python?",
        "hints": [
            "Think about mutability.",
            "Think about [] and ().",
        ],
    },
    {
        "id": "python-2",
        "title": "Python Dictionary",
        "type": "Technical",
        "topicOrLanguage": "Python",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "What is a dictionary in Python and when would you use one?",
        "hints": [
            "Think about key-value pairs.",
        ],
    },
    {
        "id": "python-3",
        "title": "Shallow vs Deep Copy",
        "type": "Technical",
        "topicOrLanguage": "Python",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "Explain the difference between shallow copy and deep copy in Python.",
        "hints": [
            "Think about nested mutable objects.",
        ],
    },
    {
        "id": "python-4",
        "title": "Python Print",
        "type": "Fill in Blanks",
        "topicOrLanguage": "Python",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Complete the Python statement.",
        "fillBlankSnippet": "____('Hello World')",
        "fillBlankAnswer": "print",
        "hints": [
            "Use Python's built-in output function.",
        ],
    },
    # =================================================
    # SQL / DBMS
    # =================================================
    {
        "id": "sql-1",
        "title": "Primary Key",
        "type": "MCQ",
        "topicOrLanguage": "SQL",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Which key uniquely identifies each row in a database table?",
        "options": [
            "Primary Key",
            "Foreign Key",
            "Index",
            "View",
        ],
        "correctAnswer": "Primary Key",
        "explanation": "A primary key uniquely identifies each row.",
    },
    {
        "id": "sql-2",
        "title": "SQL WHERE Clause",
        "type": "Fill in Blanks",
        "topicOrLanguage": "SQL",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Complete the SQL query.",
        "fillBlankSnippet": "SELECT * FROM students ____ age > 18;",
        "fillBlankAnswer": "WHERE",
    },
    {
        "id": "sql-3",
        "title": "SQL JOIN",
        "type": "Technical",
        "topicOrLanguage": "SQL",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "What is a JOIN in SQL? Explain INNER JOIN and LEFT JOIN.",
        "hints": [
            "Think about combining rows from multiple tables.",
        ],
    },
    {
        "id": "sql-4",
        "title": "Database Index",
        "type": "Technical",
        "topicOrLanguage": "SQL",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "What is a database index and how does it improve query performance?",
    },
    # =================================================
    # JAVA
    # =================================================
    {
        "id": "java-1",
        "title": "Java Inheritance",
        "type": "Technical",
        "topicOrLanguage": "Java",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "What is inheritance in Java and why is it useful?",
    },
    {
        "id": "java-2",
        "title": "Java Interface",
        "type": "Technical",
        "topicOrLanguage": "Java",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "What is the difference between an interface and an abstract class in Java?",
    },
    # =================================================
    # JAVASCRIPT
    # =================================================
    {
        "id": "js-1",
        "title": "var let const",
        "type": "Technical",
        "topicOrLanguage": "JavaScript",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Explain the difference between var, let, and const in JavaScript.",
    },
    {
        "id": "js-2",
        "title": "JavaScript Promise",
        "type": "Technical",
        "topicOrLanguage": "JavaScript",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "What is a Promise in JavaScript and how does async/await use Promises?",
    },
    # =================================================
    # C / C++
    # =================================================
    {
        "id": "c-1",
        "title": "Pointer Basics",
        "type": "Technical",
        "topicOrLanguage": "C",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "What is a pointer in C and why is it useful?",
    },
    {
        "id": "cpp-1",
        "title": "C++ Virtual Function",
        "type": "Technical",
        "topicOrLanguage": "C++",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "What is a virtual function in C++ and how does it support runtime polymorphism?",
    },
    # =================================================
    # CORE CS / INTERVIEW
    # =================================================
    {
        "id": "cs-1",
        "title": "Process vs Thread",
        "type": "Technical",
        "topicOrLanguage": "DSA",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "What is the difference between a process and a thread?",
    },
    {
        "id": "cs-2",
        "title": "Stack vs Queue",
        "type": "Technical",
        "topicOrLanguage": "DSA",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "Explain the difference between stack and queue data structures.",
    },
    {
        "id": "hr-1",
        "title": "Why Should We Hire You",
        "type": "Behavioral",
        "topicOrLanguage": "Interview",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "Why should we hire you for a software engineering role?",
        "hints": [
            "Connect your skills with the role.",
            "Mention projects, learning ability, and teamwork.",
        ],
    },
    {
        "id": "hr-2",
        "title": "Project Challenge",
        "type": "Behavioral",
        "topicOrLanguage": "Interview",
        "difficulty": "Medium",
        "role": "Software Engineer",
        "question": "Describe a technical challenge you faced in a project and how you solved it.",
        "hints": [
            "Use situation, task, action, and result.",
        ],
    },
    {
        "id": "hr-3",
        "title": "Strengths",
        "type": "Behavioral",
        "topicOrLanguage": "Interview",
        "difficulty": "Easy",
        "role": "Software Engineer",
        "question": "What are your main strengths as a software engineering candidate?",
    },
]


# =====================================================
# GET QUESTION LIBRARY
# =====================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_practice_questions(request):
    database_questions = PracticeQuestion.objects.all()

    questions = []

    for item in database_questions:
        questions.append(
            {
                "id": item.question_id,
                "title": item.title,
                "type": item.question_type,
                "topicOrLanguage": item.topic_or_language,
                "difficulty": item.difficulty,
                "role": "Software Engineer",
                "question": item.question,
                "options": item.options,
                "correctAnswer": item.correct_answer,
                "explanation": item.explanation,
                "fillBlankSnippet": item.fill_blank_snippet,
                "fillBlankAnswer": item.fill_blank_answer,
                "initialCode": item.initial_code,
                "languageTemplates": item.language_templates,
                "hints": item.hints,
            }
        )

    random.shuffle(questions)

    return Response(
        {
            "questions": questions,
            "total": len(questions),
        }
    )


# =====================================================
# AI QUESTION GENERATION
# =====================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def generate_practice_questions(request):

    language = request.data.get(
        "language",
        "Python",
    )

    question_type = request.data.get(
        "type",
        "Technical",
    )

    difficulty = request.data.get(
        "difficulty",
        "Medium",
    )

    prompt = f"""
You are an expert software engineering interview
and competitive-programming practice coach.

Generate exactly 10 fresh practice questions.

Topic or Programming Language:
{language}

Question Type:
{question_type}

Difficulty:
{difficulty}

The generated questions should resemble
real technical interview and coding-practice
questions.

If Question Type is Coding:

- Create algorithmic coding problems.
- Include a clear problem statement.
- Include starter code.
- Include 2 or 3 useful hints.
- Do NOT include the final solution.
- Include Python, Java, C++, and JavaScript
  starter templates whenever possible.

If Question Type is MCQ:

- Give exactly 4 options.
- Include correctAnswer.
- Include a short explanation.

If Question Type is Fill in Blanks:

- Include fillBlankSnippet.
- Include fillBlankAnswer.

If Question Type is Technical:

- Ask realistic software-engineering
  interview questions.

If Question Type is Behavioral:

- Ask realistic HR or situational
  interview questions.

Return ONLY valid JSON:

{{
  "questions": [
    {{
      "id": "unique-random-id",
      "title": "Short title",
      "type": "{question_type}",
      "topicOrLanguage": "{language}",
      "difficulty": "{difficulty}",
      "role": "Software Engineer",
      "question": "Question text",
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

IMPORTANT:

- Generate NEW questions each time.
- Avoid repeating common questions.
- Match the selected difficulty.
- Easy questions should test fundamentals.
- Medium questions should require problem solving.
- Hard questions should require stronger algorithms,
  optimization or deeper technical understanding.
- Do not return markdown.
- Return JSON only.
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        cleaned = clean_json_response(response.text)

        data = json.loads(cleaned)

        questions = data.get(
            "questions",
            [],
        )

        saved_questions = []

        for item in questions:
            question_id = item.get("id", "")

            if not question_id:
                continue

            question, created = PracticeQuestion.objects.update_or_create(
                question_id=question_id,
                defaults={
                    "title": item.get("title", ""),
                    "question_type": item.get("type", ""),
                    "topic_or_language": item.get(
                        "topicOrLanguage",
                        language,
                    ),
                    "difficulty": item.get(
                        "difficulty",
                        difficulty,
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

            saved_questions.append(
                {
                    "id": question.question_id,
                    "title": question.title,
                    "type": question.question_type,
                    "topicOrLanguage": question.topic_or_language,
                    "difficulty": question.difficulty,
                    "role": "Software Engineer",
                    "question": question.question,
                    "options": question.options,
                    "correctAnswer": question.correct_answer,
                    "explanation": question.explanation,
                    "fillBlankSnippet": question.fill_blank_snippet,
                    "fillBlankAnswer": question.fill_blank_answer,
                    "initialCode": question.initial_code,
                    "languageTemplates": question.language_templates,
                    "hints": question.hints,
                }
            )

        return Response(
            {
                "questions": saved_questions,
                "saved": len(saved_questions),
                "totalInDatabase": PracticeQuestion.objects.count(),
            }
        )

    except Exception as error:
        print(
            "Practice generation error:",
            error,
        )

        error_text = str(error)

        if "429" in error_text or "RESOURCE_EXHAUSTED" in error_text:

            requested_language = language.strip()
            requested_language_lower = requested_language.lower()

            requested_difficulty = difficulty.strip()
            requested_difficulty_lower = requested_difficulty.lower()

            requested_type = question_type.strip()
            requested_type_lower = requested_type.lower()

            fallback_questions = []

            # =====================================================
            # Helper for unique IDs
            # =====================================================

            def local_id(prefix, index):
                return (
                    f"local-{prefix}-"
                    f"{requested_language_lower.replace('+', 'p')}-"
                    f"{requested_difficulty_lower}-"
                    f"{index}"
                )

            # =====================================================
            # CODING
            # =====================================================

            if requested_type_lower == "coding":

                coding_pool = [
                    question
                    for question in PRACTICE_QUESTIONS
                    if (
                        question.get("type", "").lower() == "coding"
                        and question.get(
                            "difficulty",
                            "",
                        ).lower()
                        == requested_difficulty_lower
                    )
                ]

                template_lookup = {
                    "python": "python",
                    "java": "java",
                    "c++": "cpp",
                    "javascript": "javascript",
                }

                template_key = template_lookup.get(requested_language_lower)

                for index, question in enumerate(
                    coding_pool[:10],
                    start=1,
                ):
                    new_question = question.copy()

                    new_question["id"] = local_id(
                        "coding",
                        index,
                    )

                    new_question["topicOrLanguage"] = requested_language

                    templates = question.get(
                        "languageTemplates",
                        {},
                    )

                    if template_key and templates.get(template_key):
                        new_question["initialCode"] = templates[template_key]

                    # Basic C starter fallback
                    if requested_language_lower == "c" and not new_question.get(
                        "initialCode"
                    ):
                        new_question["initialCode"] = (
                            "#include <stdio.h>\n\n"
                            "int main() {\n"
                            "    // Write your solution here\n"
                            "    return 0;\n"
                            "}\n"
                        )

                    fallback_questions.append(new_question)

            # =====================================================
            # TECHNICAL
            # =====================================================

            elif requested_type_lower == "technical":

                technical_bank = {
                    "python": [
                        "What is the difference between a list and a tuple in Python?",
                        "Explain shallow copy and deep copy in Python.",
                        "What is a dictionary in Python and when would you use it?",
                        "What are decorators in Python?",
                        "Explain the difference between == and is in Python.",
                        "What is the Global Interpreter Lock in Python?",
                        "Explain exception handling in Python.",
                        "What is the difference between a module and a package?",
                        "Explain list comprehensions in Python.",
                        "What are generators in Python?",
                    ],
                    "c": [
                        "What is a pointer in C and why is it useful?",
                        "What is the difference between malloc and calloc?",
                        "Explain pass by value in C.",
                        "What is a dangling pointer?",
                        "What is the difference between struct and union?",
                        "Explain static variables in C.",
                        "What is a segmentation fault?",
                        "What is pointer arithmetic?",
                        "Explain dynamic memory allocation in C.",
                        "What is the purpose of the const keyword in C?",
                    ],
                    "java": [
                        "What is inheritance in Java?",
                        "Explain method overloading and overriding.",
                        "What is the difference between interface and abstract class?",
                        "What is encapsulation in Java?",
                        "Explain exception handling in Java.",
                        "What is the difference between == and equals() in Java?",
                        "What is the Java Collections Framework?",
                        "What is a constructor in Java?",
                        "Explain multithreading in Java.",
                        "What is garbage collection in Java?",
                    ],
                    "c++": [
                        "What is the difference between C and C++?",
                        "Explain classes and objects in C++.",
                        "What is a virtual function?",
                        "What is function overloading?",
                        "Explain inheritance in C++.",
                        "What is the difference between pointer and reference?",
                        "What is a destructor?",
                        "Explain templates in C++.",
                        "What is runtime polymorphism?",
                        "What is the STL in C++?",
                    ],
                    "javascript": [
                        "Explain var, let and const.",
                        "What is a Promise in JavaScript?",
                        "Explain async and await.",
                        "What is the event loop?",
                        "What is closure in JavaScript?",
                        "Explain hoisting.",
                        "What is the difference between == and ===?",
                        "What are arrow functions?",
                        "Explain callback functions.",
                        "What is DOM manipulation?",
                    ],
                    "sql": [
                        "What is a Primary Key?",
                        "What is a Foreign Key?",
                        "Explain INNER JOIN and LEFT JOIN.",
                        "What is normalization?",
                        "What is an index in SQL?",
                        "Explain GROUP BY and HAVING.",
                        "What is a subquery?",
                        "Explain transaction isolation levels.",
                        "What is ACID?",
                        "How would you optimize a slow SQL query?",
                    ],
                    "dsa": [
                        "What is the difference between stack and queue?",
                        "Explain binary search.",
                        "What is a linked list?",
                        "Explain time complexity.",
                        "What is a binary tree?",
                        "What is a graph?",
                        "Explain BFS and DFS.",
                        "What is dynamic programming?",
                        "What is hashing?",
                        "Explain recursion.",
                    ],
                    "mixed computer science": [
                        "What is the difference between process and thread?",
                        "What is normalization in DBMS?",
                        "Explain TCP and UDP.",
                        "What is polymorphism?",
                        "What is binary search?",
                        "What is deadlock?",
                        "Explain REST API.",
                        "What is a database index?",
                        "Explain stack and queue.",
                        "What is virtual memory?",
                    ],
                }

                items = technical_bank.get(
                    requested_language_lower,
                    technical_bank["mixed computer science"],
                )

                for index, text in enumerate(
                    items,
                    start=1,
                ):
                    fallback_questions.append(
                        {
                            "id": local_id(
                                "technical",
                                index,
                            ),
                            "title": text.replace(
                                "?",
                                "",
                            )[:60],
                            "type": "Technical",
                            "topicOrLanguage": requested_language,
                            "difficulty": requested_difficulty,
                            "role": "Software Engineer",
                            "question": text,
                            "hints": [
                                "Start with the definition.",
                                "Give a simple example.",
                            ],
                        }
                    )

            # =====================================================
            # MCQ
            # =====================================================

            elif requested_type_lower == "mcq":

                mcq_bank = {
                    "python": [
                        (
                            "Which type is immutable?",
                            ["List", "Dictionary", "Tuple", "Set"],
                            "Tuple",
                        ),
                        (
                            "Which keyword defines a function?",
                            ["func", "define", "def", "function"],
                            "def",
                        ),
                    ],
                    "c": [
                        (
                            "Which symbol is used to access a pointer value?",
                            ["&", "*", "%", "#"],
                            "*",
                        ),
                        (
                            "Which function allocates memory dynamically?",
                            ["printf", "malloc", "scanf", "sizeof"],
                            "malloc",
                        ),
                    ],
                    "java": [
                        (
                            "Which keyword is used for inheritance?",
                            ["inherits", "extends", "implements", "super"],
                            "extends",
                        ),
                        (
                            "Which method starts a Java thread?",
                            ["run()", "start()", "begin()", "execute()"],
                            "start()",
                        ),
                    ],
                    "c++": [
                        (
                            "Which feature supports runtime polymorphism?",
                            [
                                "Macros",
                                "Virtual functions",
                                "Namespaces",
                                "Templates only",
                            ],
                            "Virtual functions",
                        ),
                    ],
                    "javascript": [
                        (
                            "Which declaration is block scoped?",
                            ["var", "let", "function", "global"],
                            "let",
                        ),
                    ],
                    "sql": [
                        (
                            "Which key uniquely identifies a row?",
                            ["Foreign Key", "Primary Key", "Index", "View"],
                            "Primary Key",
                        ),
                    ],
                    "dsa": [
                        (
                            "Which data structure follows FIFO?",
                            ["Stack", "Queue", "Tree", "Graph"],
                            "Queue",
                        ),
                    ],
                }

                source = mcq_bank.get(
                    requested_language_lower,
                    [],
                )

                for index, item in enumerate(
                    source,
                    start=1,
                ):
                    question_text, options, answer = item

                    fallback_questions.append(
                        {
                            "id": local_id(
                                "mcq",
                                index,
                            ),
                            "title": question_text,
                            "type": "MCQ",
                            "topicOrLanguage": requested_language,
                            "difficulty": requested_difficulty,
                            "role": "Software Engineer",
                            "question": question_text,
                            "options": options,
                            "correctAnswer": answer,
                            "explanation": f"The correct answer is {answer}.",
                        }
                    )

            # =====================================================
            # FILL IN BLANKS
            # =====================================================

            elif requested_type_lower == "fill in blanks":

                fill_bank = {
                    "python": [
                        ("____('Hello')", "print"),
                        ("for i ____ range(5):", "in"),
                        ("def add(a, b):\n    ____ a + b", "return"),
                    ],
                    "c": [
                        ('____("Hello");', "printf"),
                        ("int *p = ____;", "&x"),
                        ("____ main() { return 0; }", "int"),
                    ],
                    "java": [
                        ('System.out.____("Hello");', "println"),
                        ("class Test ____ Parent", "extends"),
                    ],
                    "c++": [
                        ('cout ____ "Hello";', "<<"),
                        ("class Child : public ____", "Parent"),
                    ],
                    "javascript": [
                        ('console.____("Hello");', "log"),
                        ("const add = (a,b) ____ a+b;", "=>"),
                    ],
                    "sql": [
                        (
                            "SELECT * FROM students ____ age > 18;",
                            "WHERE",
                        ),
                        (
                            "SELECT department, COUNT(*) FROM employees ____ BY department;",
                            "GROUP",
                        ),
                    ],
                }

                source = fill_bank.get(
                    requested_language_lower,
                    [],
                )

                for index, item in enumerate(
                    source,
                    start=1,
                ):
                    snippet, answer = item

                    fallback_questions.append(
                        {
                            "id": local_id(
                                "fill",
                                index,
                            ),
                            "title": f"{requested_language} Fill Blank {index}",
                            "type": "Fill in Blanks",
                            "topicOrLanguage": requested_language,
                            "difficulty": requested_difficulty,
                            "role": "Software Engineer",
                            "question": "Complete the missing part.",
                            "fillBlankSnippet": snippet,
                            "fillBlankAnswer": answer,
                            "hints": [
                                "Think about the correct syntax.",
                            ],
                        }
                    )

            # =====================================================
            # FINAL FALLBACK
            # =====================================================

            if not fallback_questions:
                fallback_questions = [
                    question.copy()
                    for question in PRACTICE_QUESTIONS
                    if (
                        question.get(
                            "difficulty",
                            "",
                        ).lower()
                        == requested_difficulty_lower
                    )
                ]

            # Remove duplicates by title + question
            unique_questions = []
            seen = set()

            for question in fallback_questions:
                key = (
                    question.get(
                        "title",
                        "",
                    ),
                    question.get(
                        "question",
                        "",
                    ),
                )

                if key not in seen:
                    seen.add(key)
                    unique_questions.append(question)

            random.shuffle(unique_questions)

            return Response(
                {
                    "questions": unique_questions[:10],
                    "fallback": True,
                    "message": "Gemini quota reached. Local generated practice questions are being used.",
                }
            )

        return Response(
            {"error": "Unable to generate practice questions"},
            status=500,
        )


# =====================================================
# PRACTICE ANSWER EVALUATION
# =====================================================


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def evaluate_practice_answer(request):

    question_title = request.data.get(
        "questionTitle",
        "",
    )

    question_type = request.data.get(
        "questionType",
        "",
    )

    question_id = request.data.get(
        "questionId",
        "",
    )

    topic_or_language = request.data.get(
        "topicOrLanguage",
        "",
    )

    difficulty = request.data.get(
        "difficulty",
        "",
    )

    programming_language = request.data.get(
        "programmingLanguage",
        "",
    )

    user_answer = request.data.get(
        "userAnswer",
        "",
    )

    code = request.data.get(
        "code",
        "",
    )

    question_data = request.data.get(
        "questionData",
        {},
    )

    if not question_id:
        question_id = question_title.strip().lower().replace(" ", "-")

    prompt = f"""
You are an expert software engineering
interview evaluator and coding reviewer.

Question:
{question_title}

Question Type:
{question_type}

Candidate Text Answer:
{user_answer}

Candidate Code:
{code}

Evaluate the candidate response.

For Coding questions:

- Check whether the algorithm is logically correct.
- Check edge cases.
- Check time complexity.
- Check space complexity.
- Check code readability.
- Do not penalize harmless syntax differences heavily.

For Technical questions:

- Check correctness.
- Check completeness.
- Check clarity.

For Behavioral questions:

- Check communication.
- Check structure.
- Check relevance.

For MCQ or Fill in the Blank:

- Judge correctness directly.

Return ONLY valid JSON:

{{
  "evaluation": {{
    "score": 0,
    "correct": false,
    "correctness": "",
    "feedback": "",
    "explanation": "",
    "timeComplexity": "",
    "spaceComplexity": "",
    "strengths": [],
    "improvements": []
  }}
}}

Scoring:

90-100 = Excellent
75-89 = Good
60-74 = Acceptable
40-59 = Needs Improvement
0-39 = Incorrect / weak response

Score must be between 0 and 100.

Return JSON only.
Do not add markdown.
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        cleaned = clean_json_response(response.text)

        data = json.loads(cleaned)

        evaluation = data.get(
            "evaluation",
            {},
        )

        attempt, created = PracticeAttempt.objects.update_or_create(
            user=request.user,
            question_id=question_id,
            defaults={
                "question_title": question_title,
                "question_type": question_type,
                "topic_or_language": topic_or_language,
                "difficulty": difficulty,
                "question_data": question_data,
                "user_answer": user_answer,
                "submitted_code": code,
                "programming_language": programming_language,
                "score": evaluation.get(
                    "score",
                    0,
                ),
                "feedback": evaluation.get(
                    "feedback",
                    "",
                ),
                "strengths": evaluation.get(
                    "strengths",
                    [],
                ),
                "improvements": evaluation.get(
                    "improvements",
                    [],
                ),
            },
        )

        data["attempt"] = {
            "id": attempt.id,
            "questionId": attempt.question_id,
            "score": attempt.score,
            "saved": True,
        }

        return Response(data)

    except Exception as error:

        print(
            "Practice evaluation error:",
            error,
        )

        return Response(
            {"error": "Unable to evaluate practice answer"},
            status=500,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_practice_attempt(request, question_id):
    try:
        attempt = PracticeAttempt.objects.get(
            user=request.user,
            question_id=question_id,
        )
    except PracticeAttempt.DoesNotExist:
        return Response({"attempt": None})

    return Response(
        {
            "attempt": {
                "id": attempt.id,
                "questionId": attempt.question_id,
                "questionTitle": attempt.question_title,
                "questionType": attempt.question_type,
                "topicOrLanguage": attempt.topic_or_language,
                "difficulty": attempt.difficulty,
                "userAnswer": attempt.user_answer,
                "code": attempt.submitted_code,
                "programmingLanguage": attempt.programming_language,
                "score": attempt.score,
                "feedback": attempt.feedback,
                "strengths": attempt.strengths,
                "improvements": attempt.improvements,
                "updatedAt": attempt.updated_at,
            }
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_practice_attempts(request):
    attempts = PracticeAttempt.objects.filter(user=request.user).order_by("-updated_at")

    data = []

    for attempt in attempts:
        data.append(
            {
                "id": attempt.id,
                "questionId": attempt.question_id,
                "score": attempt.score,
                "difficulty": attempt.difficulty,
                "questionType": attempt.question_type,
                "topicOrLanguage": attempt.topic_or_language,
            }
        )

    return Response({"attempts": data})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def evaluate_interview_practice(request):
    topic = request.data.get(
        "topic",
        "Tell Me About Yourself",
    )

    question = request.data.get(
        "question",
        "",
    )

    transcript = request.data.get(
        "transcript",
        "",
    )

    camera_used = request.data.get(
        "cameraUsed",
        False,
    )

    camera_metrics = request.data.get(
        "cameraMetrics",
        {},
    )

    if not transcript.strip():
        return Response(
            {"error": "Please provide an answer before finishing practice."},
            status=400,
        )

    prompt = f"""
You are an expert interview communication coach.

Interview Preparation Topic:
{topic}

Practice Question:
{question}

Candidate Answer:
{transcript}

Camera Was Used:
{camera_used}

Evaluate only what can be supported by the
candidate's spoken answer transcript.

Do NOT invent eye-contact, posture, facial-expression
or body-language scores just because cameraUsed is true.

Evaluate:

1. Overall interview answer quality
2. Content relevance
3. Answer structure
4. Clarity
5. Communication quality
6. Strengths
7. Improvements
8. A better sample answer

Return ONLY valid JSON:

{{
  "overall_score": 0,
  "content_score": 0,
  "structure_score": 0,
  "clarity_score": 0,
  "communication_score": 0,
  "feedback": "",
  "strengths": [],
  "improvements": [],
  "better_answer": ""
}}

Rules:

- Every score must be between 0 and 100.
- Keep feedback concise but useful.
- Strengths should be specific.
- Improvements should be actionable.
- The better answer should sound natural,
  professional and suitable for an interview.
- Do not include markdown.
- Return JSON only.
"""

    word_count = len(transcript.split())

    sentences = [
        sentence.strip()
        for sentence in re.split(r"[.!?]+", transcript)
        if sentence.strip()
    ]

    sentence_count = len(sentences)

    lower_answer = transcript.lower()

    # -----------------------------
    # Content Score
    # -----------------------------

    content_score = 50

    if word_count >= 20:
        content_score += 10

    if word_count >= 40:
        content_score += 10

    if word_count >= 70:
        content_score += 10

    if any(
        word in lower_answer
        for word in [
            "project",
            "experience",
            "skills",
            "python",
            "java",
            "javascript",
            "database",
            "sql",
            "development",
            "learning",
        ]
    ):
        content_score += 10

    content_score = min(content_score, 100)

    # -----------------------------
    # Structure Score
    # -----------------------------

    structure_score = 50

    if sentence_count >= 3:
        structure_score += 15

    if sentence_count >= 5:
        structure_score += 10

    if any(
        word in lower_answer
        for word in [
            "first",
            "currently",
            "during",
            "finally",
            "because",
            "therefore",
            "after",
        ]
    ):
        structure_score += 10

    if word_count >= 30:
        structure_score += 10

    structure_score = min(structure_score, 100)

    # -----------------------------
    # Clarity Score
    # -----------------------------

    clarity_score = 55

    if sentence_count >= 2:
        clarity_score += 10

    if 25 <= word_count <= 150:
        clarity_score += 15

    if sentence_count > 0:
        average_sentence_length = word_count / sentence_count

        if 6 <= average_sentence_length <= 25:
            clarity_score += 10

    clarity_score = min(clarity_score, 100)

    # -----------------------------
    # Communication Score
    # -----------------------------

    communication_score = 55

    if word_count >= 25:
        communication_score += 10

    if word_count >= 50:
        communication_score += 10

    if any(
        phrase in lower_answer
        for phrase in [
            "i am",
            "i have",
            "i worked",
            "i learned",
            "my goal",
            "i would",
        ]
    ):
        communication_score += 10

    communication_score = min(
        communication_score,
        100,
    )

    # -----------------------------
    # Overall Score
    # -----------------------------

    overall_score = round(
        (content_score + structure_score + clarity_score + communication_score) / 4
    )

    # -----------------------------
    # Feedback
    # -----------------------------

    strengths = []

    if word_count >= 40:
        strengths.append("You provided a reasonably detailed answer.")

    if content_score >= 70:
        strengths.append("Your answer contains relevant interview content.")

    if structure_score >= 70:
        strengths.append("Your answer has a clear structure.")

    if clarity_score >= 70:
        strengths.append("Your answer is clear and understandable.")

    if not strengths:
        strengths.append("You attempted the question and communicated your main idea.")

    improvements = []

    if word_count < 30:
        improvements.append("Add more detail and support your answer with an example.")

    if structure_score < 70:
        improvements.append(
            "Organize your answer with a clear beginning, explanation and conclusion."
        )

    if content_score < 70:
        improvements.append(
            "Include more relevant skills, experience or project details."
        )

    if clarity_score < 70:
        improvements.append("Use shorter and clearer sentences.")

    if not improvements:
        improvements.append(
            "Keep practicing to make the answer more concise and confident."
        )

    result = {
        "overall_score": overall_score,
        "content_score": content_score,
        "structure_score": structure_score,
        "clarity_score": clarity_score,
        "communication_score": communication_score,
        "feedback": (
            "Your answer was evaluated instantly based on "
            "content, structure, clarity and communication."
        ),
        "strengths": strengths,
        "improvements": improvements,
        "better_answer": transcript,
    }

    attempt = InterviewPracticeAttempt.objects.create(
        user=request.user,
        topic=topic,
        question=question,
        transcript=transcript,
        camera_used=camera_used,
        overall_score=result.get(
            "overall_score",
            0,
        ),
        content_score=result.get(
            "content_score",
            0,
        ),
        structure_score=result.get(
            "structure_score",
            0,
        ),
        clarity_score=result.get(
            "clarity_score",
            0,
        ),
        communication_score=result.get(
            "communication_score",
            0,
        ),
        feedback=result.get(
            "feedback",
            "",
        ),
        strengths=result.get(
            "strengths",
            [],
        ),
        improvements=result.get(
            "improvements",
            [],
        ),
        better_answer=result.get(
            "better_answer",
            "",
        ),
        camera_feedback=camera_metrics,
    )

    return Response(
        {
            "attempt": {
                "id": attempt.id,
                "topic": attempt.topic,
                "question": attempt.question,
                "transcript": attempt.transcript,
                "cameraUsed": attempt.camera_used,
                "cameraFeedback": attempt.camera_feedback,
                "overallScore": attempt.overall_score,
                "contentScore": attempt.content_score,
                "structureScore": attempt.structure_score,
                "clarityScore": attempt.clarity_score,
                "communicationScore": attempt.communication_score,
                "feedback": attempt.feedback,
                "strengths": attempt.strengths,
                "improvements": attempt.improvements,
                "betterAnswer": attempt.better_answer,
                "createdAt": attempt.created_at,
            }
        }
    )
