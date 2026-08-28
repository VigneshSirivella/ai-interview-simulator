import ast
import json
import random

from .gemini import client, MODEL_NAME


GENERAL_HR_QUESTION_BANK = [
    "Tell me about yourself.",
    "Why should we hire you?",
    "What are your greatest strengths?",
    "What is one weakness you are actively working to improve?",
    "Why do you want this job?",
    "Where do you see yourself in five years?",
    "What motivates you to perform at your best?",
    "How do you handle high-pressure situations or tight deadlines?",
    "Tell me about a significant challenge you faced and how you overcame it.",
    "Tell me about a time you worked successfully as part of a team.",
    "How do you handle disagreements or conflicts with colleagues?",
    "What do you consider your greatest personal or professional achievement?",
    "Tell me about a mistake you made and what you learned from it.",
    "How do you prioritize your tasks and manage your time effectively?",
    "What are your long-term career goals?",
    "How do you handle constructive criticism or feedback?",
    "What type of work environment brings out your best performance?",
    "What makes you a unique and qualified candidate for this position?",
    "How do you adapt when unexpected changes occur in your workload?",
    "Why are you looking for a new opportunity at this point in your career?",
    "Describe a situation where you had to take initiative to complete a task.",
    "How do you ensure clear and effective communication with team members?",
    "What steps do you take to stay motivated during repetitive tasks?",
    "How do you handle working with someone who has a different work style than yours?",
    "Tell me about a time you had to learn something new quickly.",
    "What does success look like to you in your daily work?",
    "How do you maintain focus when dealing with multiple competing priorities?",
    "Tell me about a time you went above and beyond what was expected of you.",
    "How do you react when a project plan changes suddenly?",
    "What qualities do you value most in a leader or supervisor?",
    "How do you approach solving a problem when you do not have all the information?",
    "Describe a time you helped a teammate who was struggling with their workload.",
    "How do you make sure your work is accurate and of high quality?",
    "What strategy do you use when facing a task you find difficult?",
    "Tell me about a time you received difficult feedback and how you responded.",
    "What role do you typically take on when working in a group?",
    "How do you handle work-related stress outside of work hours?",
    "What values are most important to you in a workplace culture?",
    "Tell me about a time you set a professional goal for yourself and achieved it.",
    "How do you ensure you meet commitments when deadlines are tight?",
    "What experience has had the biggest impact on your professional growth?",
    "How do you handle feeling overwhelmed at work?",
    "Describe a situation where you had to explain a complex topic simply.",
    "What keeps you engaged and enthusiastic about your work?",
    "How do you build strong working relationships with new colleagues?",
    "Tell me about a time you had to adjust to a new team or environment.",
    "What action do you take when you realize you made an error in your work?",
    "How do you define effective leadership?",
    "What do you hope to gain from your next professional experience?",
    "Do you have any questions for us about the position or workplace?"
]


def generate_questions(
    resume_text,
    interview_type,
    difficulty,
    total_questions=5,
    company="General Company",
    role="Software Engineer",
    preferred_languages=None,
    mode=None,
):
    if preferred_languages is None:
        preferred_languages = []

    type_str = str(interview_type).lower()
    mode_str = str(mode).lower() if mode else ""

    is_general_hr = (
        mode in ["general_hr", "one-on-one", "1-on-1", "1-to-1"]
        or mode_str in ["general_hr", "one-on-one", "1-on-1", "1-to-1"]
        or "1-on-1" in type_str
        or "1-to-1" in type_str
        or "hr" in type_str
        or "general" in type_str
        or "one-on-one" in type_str
    )

    if is_general_hr:
        first_question = "Tell me about yourself."
        second_question = "Why should we hire you for this job?"

        remaining_pool = [
            q for q in GENERAL_HR_QUESTION_BANK
            if q not in [first_question, second_question]
        ]

        needed = total_questions - 2
        if needed > 0:
            others = random.sample(remaining_pool, min(needed, len(remaining_pool)))
            selected_questions = [first_question, second_question] + others
        else:
            selected_questions = [first_question, second_question][:total_questions]

        print("=========================================")
        print("INTERVIEW MODE: general_hr")
        print("QUESTION SOURCE: general_hr_question_bank")
        print(f"QUESTION COUNT: {len(selected_questions)}")
        print("SELECTED QUESTIONS:", selected_questions)
        print("=========================================")

        return selected_questions

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
- Questions must match the selected difficulty.
- Questions must match the candidate's resume, role, company and preferred languages.
- Keep questions realistic and interview-oriented.
- Return ONLY a valid Python list of strings.

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
        "Explain the difference between a list and a tuple in Python.",
        "What is the difference between a process and a thread?",
        "Explain how indexing improves database query performance.",
        "What is the difference between TCP and UDP?",
        "Explain the concept of inheritance in object-oriented programming.",
        "What is the time complexity of searching in a Python set?",
        "How would you detect duplicate elements in an array efficiently?",
        "Explain shallow copy and deep copy in Python.",
        "What happens when you type a URL into a browser?",
        "Explain normalization in DBMS.",
        "What is deadlock in an operating system?",
        "Explain REST API and how frontend communicates with backend.",
        "How would you debug a slow web application?",
        "Tell me about a difficult bug you fixed in one of your projects.",
        "Where do you see yourself improving technically over the next two years?",
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
        print("QUESTION GENERATION GEMINI ERROR:", repr(error))

        if total_questions <= len(fallback_questions):
            return random.sample(fallback_questions, total_questions)
        else:
            selected = list(fallback_questions)
            while len(selected) < total_questions:
                selected.append(random.choice(fallback_questions))
            return selected[:total_questions]


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

    answer_text = str(answer or "").strip()
    word_count = len(answer_text.split())

    if word_count >= 80:
        fallback_score = 70
    elif word_count >= 40:
        fallback_score = 60
    elif word_count >= 15:
        fallback_score = 50
    else:
        fallback_score = 35

    fallback_evaluation = {
        "score": fallback_score,
        "feedback": (
            "AI evaluation could not be completed right now. "
            "A provisional score was generated based on the "
            "completeness of your submitted answer."
        ),
        "strengths": ["You attempted the question and submitted an answer."],
        "improvements": [
            "Review the topic and strengthen your answer with "
            "clear technical details, reasoning, and examples."
        ],
    }

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        result = json.loads(response.text.strip())

        if not isinstance(result, dict):
            raise ValueError("Gemini did not return a JSON object")

        return result

    except Exception as error:
        print(
            "ANSWER EVALUATION GEMINI ERROR:",
            repr(error),
        )

        return fallback_evaluation


def evaluate_answers_batch(
    answers,
    difficulty,
):
    if not answers:
        return []

    prompt = f"""
You are an expert technical interviewer.

Difficulty:
{difficulty}

Candidate interview responses:

{answers}

Evaluate every response.

Return ONLY valid JSON as a list using this exact structure:

[
  {{
    "question_number": 1,
    "score": 0,
    "feedback": "",
    "strengths": [],
    "improvements": []
  }}
]

Rules:

- Return one result for every supplied answer.
- Keep the original question_number.
- Score must be between 0 and 100.
- Judge correctness, relevance, clarity and completeness.
- 90-100 = excellent.
- 75-89 = good.
- 60-74 = acceptable but incomplete.
- 40-59 = weak.
- 0-39 = incorrect or very poor.
- Keep feedback concise.
- Do not return markdown.
- Return JSON only.
"""

    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
        )

        result = json.loads(response.text.strip())

        if not isinstance(result, list):
            raise ValueError("Gemini did not return a list")

        return result

    except Exception as error:
        print(
            "BATCH EVALUATION GEMINI ERROR:",
            repr(error),
        )

        fallback_results = []

        for item in answers:
            answer_text = str(item.get("answer", "")).strip()

            # Local provisional fallback.
            # Avoid a fake fixed score such as 70 for every answer.
            word_count = len(answer_text.split())

            if word_count >= 80:
                score = 70
            elif word_count >= 40:
                score = 60
            elif word_count >= 15:
                score = 50
            else:
                score = 35

            fallback_results.append(
                {
                    "question_number": item.get("question_number"),
                    "score": score,
                    "feedback": (
                        "A provisional evaluation was generated "
                        "from the completeness of your submitted answer. "
                        "Review the feedback and continue improving "
                        "the technical depth of your response."
                    ),
                    "strengths": [
                        "You attempted the question and provided a response."
                    ],
                    "improvements": [
                        "Strengthen the answer with accurate technical "
                        "details, clear reasoning, and relevant examples."
                    ],
                }
            )

        return fallback_results


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
