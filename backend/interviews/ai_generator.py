import ast
import json
import random

from .gemini import client, MODEL_NAME


def generate_questions(
    resume_text,
    interview_type,
    difficulty,
    total_questions=5,
    company="General Company",
    role="Software Engineer",
    preferred_languages=None,
):
    if preferred_languages is None:
        preferred_languages = []

    languages_text = (
        ", ".join(preferred_languages)
        if preferred_languages
        else "Any suitable programming language"
    )

    random_seed = random.randint(1000, 999999)

    prompt = f"""
You are an expert real-world job interviewer.

Candidate Resume:
{resume_text}

Target Company:
{company}

Target Role:
{role}

Interview Type:
{interview_type}

Difficulty:
{difficulty}

Preferred Programming Languages:
{languages_text}

Number of Questions:
{total_questions}

Random Interview Seed:
{random_seed}

Generate exactly {total_questions} DIFFERENT interview questions.

The interview must feel like a real company interview.

Question mix should include suitable questions from these areas:

1. Programming language questions based mainly on:
   {languages_text}

2. Core Computer Science topics when suitable:
   - Data Structures and Algorithms
   - DBMS
   - Operating Systems
   - Computer Networks
   - OOP
   - Software Engineering

3. Resume and project questions.
   Ask about projects, technologies, responsibilities,
   implementation decisions, database connection,
   frontend/backend integration, problems faced, etc.

4. HR and company questions such as:
   - Why should we hire you?
   - Why do you want to join {company}?
   - Why did you choose this role?
   - What are your strengths?
   - What are your career goals?
   - What salary are you expecting?
   - Tell me about a difficult problem you solved.

5. Situational or behavioral questions when appropriate.

IMPORTANT RULES:

- Generate fresh questions every interview.
- Do NOT return the exact same common questions repeatedly.
- Avoid repeatedly asking basic questions such as
  "difference between list and tuple"
  unless the interview context genuinely requires it.
- Questions must match the selected difficulty.
- Questions must match the candidate's resume, role,
  company and preferred languages.
- Do not ask all questions from only one subject.
- Keep questions realistic and interview-oriented.
- Do not give answers.
- Do not number the questions.
- Return ONLY a valid Python list of strings.
- Do not add markdown.
- Do not add explanations.

Example format:

[
    "Tell me about one project from your resume and your role in it.",
    "Why do you want to work at this company?",
    "How would you implement a queue in Python?",
    "Explain how indexing improves database query performance.",
    "Describe a situation where you had to debug a difficult issue."
]
"""

    fallback_questions = [
        "Tell me about one of your projects and your contribution.",
        f"Why do you want to work at {company}?",
        f"Why should we hire you for the {role} role?",
        "Explain one technical problem you faced and how you solved it.",
        "What are your strongest technical skills and how have you used them?",
    ]

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        questions = ast.literal_eval(response.text.strip())

        if not isinstance(questions, list):
            raise ValueError("Gemini did not return a list")

        questions = [
            str(question).strip() for question in questions if str(question).strip()
        ]

        if not questions:
            raise ValueError("Gemini returned no questions")

        return questions[:total_questions]

    except Exception as error:
        print(
            "QUESTION GENERATION GEMINI ERROR:",
            repr(error),
        )

        return fallback_questions[:total_questions]


def evaluate_answer(
    question,
    answer,
    difficulty,
):
    prompt = f"""
You are an expert technical interviewer.

Question:
{question}

Candidate Answer:
{answer}

Difficulty:
{difficulty}

Evaluate the answer carefully.

Return ONLY valid JSON in this format:

{{
    "score": 0,
    "feedback": "",
    "strengths": [],
    "improvements": []
}}

Scoring Rules:

- Score must be between 0 and 100.
- 90-100 = excellent and complete answer.
- 75-89 = good answer with small improvements.
- 60-74 = acceptable but incomplete.
- 40-59 = weak understanding.
- 0-39 = incorrect or very poor answer.
- Judge correctness, clarity, completeness
  and relevance to the question.
- Do not give very low scores for a mostly correct answer.
- Keep feedback clear and concise.
- Do not add markdown.
"""

    response = client.models.generate_content(
        model=MODEL_NAME,
        contents=prompt,
    )

    return json.loads(response.text.strip())


def generate_final_report(questions_and_answers):
    scores = [float(item.get("score", 0) or 0) for item in questions_and_answers]

    average_score = round(sum(scores) / len(scores), 2) if scores else 0

    fallback_report = {
        "overall_score": average_score,
        "technical_score": average_score,
        "communication_score": average_score,
        "strengths": ["Completed the interview questions successfully."],
        "weaknesses": ["Review individual question feedback for improvement areas."],
        "improvements": [
            "Continue practicing technical concepts and clear communication."
        ],
        "final_feedback": (
            f"Interview completed with an average score of "
            f"{average_score}/100. Review the feedback for each "
            f"question to identify areas for improvement."
        ),
    }

    prompt = f"""
You are an expert technical interviewer.

Interview Responses:

{questions_and_answers}

Generate the final interview report.

Return ONLY valid JSON in this format:

{{
    "overall_score": 0,
    "technical_score": 0,
    "communication_score": 0,
    "strengths": [],
    "weaknesses": [],
    "improvements": [],
    "final_feedback": ""
}}

All scores must be between 0 and 100.
Base the report only on the candidate's actual answers.
Return valid JSON only.
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        return json.loads(response.text.strip())

    except Exception as error:
        print(
            "FINAL REPORT GEMINI ERROR:",
            repr(error),
        )

        return fallback_report
