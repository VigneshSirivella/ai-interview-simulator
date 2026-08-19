# 🎯 AI Interview Simulator

An AI-powered full-stack web application designed to help candidates prepare for technical and HR interviews through realistic mock interviews, coding practice, resume analysis, AI-generated feedback, performance tracking, and career guidance.

## 🌐 Live Application

Frontend:
https://ai-interview-simulator-five-pink.vercel.app/

Backend API:
https://ai-interview-simulator-docker.onrender.com/api/

---

## 📌 About the Project

AI Interview Simulator provides an interactive environment where users can prepare for interviews and improve their technical and communication skills.

The platform combines interview simulation, coding practice, resume ATS analysis, AI evaluation, performance reports, and personalized feedback in one application.

Users can create an account, practice questions, attend mock interviews, analyze their resume, view detailed reports, and monitor their progress from the dashboard.

---

## ✨ Main Features

### 🎤 AI Mock Interviews

- Technical and HR interview practice
- AI-generated interview questions
- Candidate answer evaluation
- Score-based performance analysis
- Strength and improvement identification
- Detailed interview feedback
- Interview history and reports

### 💻 Practice Lab

Practice different types of technical questions:

- Technical questions
- Coding problems
- Multiple-choice questions
- Fill-in-the-blank questions
- Multiple difficulty levels
- Multiple programming topics/languages

Each submitted attempt can store:

- Question
- Candidate answer
- Submitted code
- Programming language
- Score
- Feedback
- Strengths
- Areas for improvement

### 📄 ATS Resume Analyzer

Users can upload or paste their resume and receive AI-assisted analysis including:

- ATS score
- Extracted skills
- Missing skills
- Formatting score
- Keyword analysis
- Resume feedback
- Actionable improvement suggestions
- Suggested job roles
- Recommended interview preparation topics

### 📊 Performance Dashboard

The dashboard provides:

- Total completed interviews
- Average interview score
- Practice statistics
- Recent practice attempts
- Performance score history
- Strong topics
- Recommended focus areas
- Interview history

### 📑 Interview Reports

After completing an interview, candidates can view detailed feedback containing their performance information and download a PDF report.

### 🏆 Leaderboard

Candidate performance can be compared through the application leaderboard.

### 👤 User Profile

Users can manage profile information such as their name, email, education and other career-related details.

---

## 🛠️ Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router

### Backend

- Python
- Django
- Django REST Framework
- REST APIs
- JWT Authentication

### Database

- PostgreSQL

### Artificial Intelligence

- Google Gemini API

### Deployment

- Vercel — Frontend
- Render — Django Backend
- Render PostgreSQL — Production Database

### Development Tools

- Git
- GitHub
- VS Code
- pgAdmin 4

---

## 🏗️ System Architecture

```text
User
 │
 ▼
React + TypeScript Frontend
(Vercel)
 │
 │ HTTPS / REST API
 ▼
Django REST Framework Backend
(Render)
 │
 ├──────────────► Google Gemini API
 │
 ▼
PostgreSQL Database
(Render PostgreSQL)
```

---

## 🔄 Application Workflow

```text
Register / Login
       │
       ▼
    Dashboard
       │
       ├──► Mock Interview
       │       │
       │       ▼
       │   AI Evaluation
       │       │
       │       ▼
       │   Final Report
       │
       ├──► Practice Lab
       │       │
       │       ▼
       │   Submit Answer
       │       │
       │       ▼
       │   Score + Feedback
       │
       ├──► ATS Resume Analyzer
       │       │
       │       ▼
       │   Gemini Analysis
       │       │
       │       ▼
       │   ATS Results
       │
       ├──► Reports
       │
       └──► Leaderboard
```

---

## 🔐 Authentication

The application provides authenticated user access for protected features.

Authentication includes:

- User registration
- Login
- OTP verification
- JWT-based authentication
- Protected API endpoints
- User-specific interview and practice data

---

## 🗄️ Database

PostgreSQL stores application data including:

- User accounts
- Interview sessions
- Interview answers
- Interview reports
- Practice questions
- Practice attempts
- Scores
- Feedback
- User progress

Production data is stored using Render PostgreSQL.

---

## 🚀 Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/VigneshSirivella/ai-interview-simulator.git
cd ai-interview-simulator
```

### 2. Start the Backend

```bash
cd backend
```

Create and activate a Python virtual environment, install the required dependencies, configure the required environment variables, and then run:

```bash
python manage.py migrate
python manage.py runserver
```

The backend will normally run at:

```text
http://127.0.0.1:8000/
```

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173/
```

---

## 🔑 Environment Variables

The project uses environment variables for sensitive configuration such as:

```text
DATABASE_URL
GEMINI_API_KEY
VITE_DJANGO_API
```

Other backend configuration variables may also be required depending on the deployment environment.

> Never commit API keys, database passwords, JWT secrets, email passwords, or other credentials to GitHub.

---

## 📁 Project Structure

```text
ai-interview-simulator/
│
├── backend/
│   ├── accounts/
│   ├── interviews/
│   ├── practice/
│   ├── resume/
│   └── manage.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   └── components/
│   └── package.json
│
├── README.md
└── requirements.txt
```

---

## 🎯 Project Objective

The objective of the AI Interview Simulator is to provide students and job seekers with an intelligent interview preparation platform where they can repeatedly practice, receive immediate feedback, identify weak areas, improve their resumes, and track their progress before attending real interviews.

---

## 👨‍💻 Developer

**S Vignesh**

B.Tech Computer Science and Engineering  
RGUKT RK Valley

GitHub: https://github.com/VigneshSirivella

---

## 📌 Project Status

✅ Authentication  
✅ AI Mock Interviews  
✅ Practice Lab  
✅ AI Answer Evaluation  
✅ ATS Resume Analysis  
✅ Performance Dashboard  
✅ Interview Reports  
✅ PDF Report Generation  
✅ Leaderboard  
✅ PostgreSQL Database  
✅ Render Backend Deployment  
✅ Vercel Frontend Deployment  

**Project is deployed and operational.**
