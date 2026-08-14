import re


def extract_skills(text):
    skills = []

    skill_list = [
        "Python",
        "Java",
        "JavaScript",
        "HTML",
        "CSS",
        "React",
        "Django",
        "Flask",
        "Node.js",
        "MySQL",
        "PostgreSQL",
        "SQL",
        "MongoDB",
        "Git",
        "GitHub",
        "Docker",
        "AWS",
        "Linux",
        "DBMS",
        "OOP",
        "Data Structures",
        "Machine Learning",
        "TensorFlow",
        "PyTorch",
    ]

    for skill in skill_list:
        if re.search(r"\b" + re.escape(skill) + r"\b", text, re.IGNORECASE):
            skills.append(skill)

    return ", ".join(skills)


def extract_education(text):
    lines = text.split("\n")

    education = []

    keywords = [
        "B.Tech",
        "Bachelor",
        "University",
        "College",
        "CGPA",
        "Degree",
        "Engineering",
    ]

    for line in lines:
        if any(k.lower() in line.lower() for k in keywords):
            education.append(line.strip())

    return "\n".join(education)


def extract_experience(text):
    lines = text.split("\n")

    experience = []

    capture = False

    for line in lines:

        if "experience" in line.lower():
            capture = True
            continue

        if capture:
            if line.strip() == "":
                break
            experience.append(line)

    if not experience:
        return "Fresher"

    return "\n".join(experience)
