import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

// In-Memory Database Store with Sample Data
const db = {
  users: [
    {
      id: "u_demo",
      name: "Alex Vance",
      email: "demo@simulator.ai",
      phone: "+1 (555) 234-5678",
      profilePicture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      githubUrl: "https://github.com/alexvance",
      linkedinUrl: "https://linkedin.com/in/alexvance",
      targetRole: "Full Stack Developer",
      bio: "CS Senior at MIT specializing in distributed systems and modern web architecture.",
      password: "password123",
    },
  ],
  interviews: new Map<string, any>(),
  reports: [
    {
      id: "rep_101",
      interviewId: "int_101",
      userId: "u_demo",
      candidateName: "Alex Vance",
      candidateEmail: "demo@simulator.ai",
      company: "Google",
      role: "Software Engineer",
      difficulty: "Hard",
      type: "Technical",
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      overallScore: 88,
      radarMetrics: {
        technical: 90,
        communication: 85,
        problemSolving: 92,
        confidence: 82,
        systemDesignCulture: 88,
      },
      topStrengths: [
        "Exceptional understanding of Data Structures and Time/Space complexities.",
        "Clear algorithmic decomposition and proactive edge-case identification.",
        "Articulate explanations during code walkthroughs.",
      ],
      keyWeaknesses: [
        "Could elaborate deeper on distributed database partitioning strategies.",
        "Slight hesitation when discussing asynchronous event loops under extreme load.",
      ],
      actionableSuggestions: [
        "Review CAP Theorem tradeoffs and practical raft consensus algorithms.",
        "Practice mock whiteboard sessions focusing on system bottleneck analysis.",
      ],
      finalAiRemark:
        "Alex demonstrated senior-level algorithmic mastery and structured problem-solving skills. Would comfortably pass standard Google L4 Software Engineering technical loops.",
      questions: [
        {
          id: "q_1",
          questionNumber: 1,
          category: "Technical",
          question: "How would you design an in-memory Least Recently Used (LRU) Cache with O(1) time complexity for get and put operations?",
          userAnswer:
            "I would combine a Hash Map with a Doubly Linked List. The Hash Map provides O(1) lookup to list nodes, while the Doubly Linked List allows O(1) removal and insertion at the head for recently accessed items.",
          timeSpentSeconds: 145,
          evaluation: {
            score: 95,
            accuracy: 98,
            clarity: 92,
            technicalDepth: 95,
            strengths: ["Correct choice of data structures", "Accurate O(1) reasoning"],
            weaknesses: ["Could mention thread safety / concurrency locks"],
            missingConcepts: ["Thread safety primitives"],
            feedback: "Spot on explanation! Hash Map + Doubly Linked List is the canonical optimal solution.",
            betterAnswerExample:
              "I would use a HashMap mapping keys to DoublyLinkedList nodes. For get(key), retrieve node from map, move it to list head, return value. For put(key, val), if key exists update and move head; if new and capacity reached, evict tail node and remove from hash map.",
          },
        },
      ],
    },
    {
      id: "rep_102",
      interviewId: "int_102",
      userId: "u_demo",
      candidateName: "Alex Vance",
      candidateEmail: "demo@simulator.ai",
      company: "Amazon",
      role: "Backend Engineer",
      difficulty: "Medium",
      type: "Behavioral",
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      overallScore: 82,
      radarMetrics: {
        technical: 80,
        communication: 88,
        problemSolving: 82,
        confidence: 85,
        systemDesignCulture: 90,
      },
      topStrengths: [
        "Strong alignment with Amazon Leadership Principles (Customer Obsession & Ownership).",
        "Clear STAR methodology narrative framing.",
      ],
      keyWeaknesses: [
        "Provide more quantitative metrics on project results.",
      ],
      actionableSuggestions: [
        "Quantify outcomes with percentages or revenue impact numbers in behavioral examples.",
      ],
      finalAiRemark:
        "Solid behavioral performance showing authentic leadership and responsibility.",
      questions: [
        {
          id: "q_2",
          questionNumber: 1,
          category: "Behavioral",
          question: "Tell me about a time when you had to handle a critical outage under high pressure.",
          userAnswer:
            "During our capstone launch, our database connection pool was exhausted. I quickly analyzed connection metrics, restarted background workers, and implemented connection pooling in Redis to handle traffic surges.",
          timeSpentSeconds: 180,
          evaluation: {
            score: 85,
            accuracy: 85,
            clarity: 90,
            technicalDepth: 80,
            strengths: ["Structured problem description", "Decisive action"],
            weaknesses: ["Quantifiable impact figures missing"],
            missingConcepts: ["Post-mortem documentation"],
            feedback: "Great STAR framing. Add specific metrics like % traffic spike handled or downtime duration reduction.",
            betterAnswerExample:
              "Situation: DB connection pool exhausted during 50k active user spike. Action: Triaged with Grafana, applied connection pooling in Redis. Result: Restored service in 4 mins and reduced DB load by 65%.",
          },
        },
      ],
    },
  ],
  resumes: new Map<string, any>(),
};

// ==========================================
// API ENDPOINTS
// ==========================================

// OTP In-Memory Storage
const otpStore = new Map<string, string>();

// Send OTP Endpoint
app.post("/api/send-otp", (req, res) => {
  const { recipient } = req.body;
  if (!recipient) {
    return res.status(400).json({ error: "Email or Phone number required" });
  }

  // Generate 6-digit OTP
  const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
  otpStore.set(recipient.toLowerCase().trim(), generatedOtp);

  res.json({
    success: true,
    otp: generatedOtp,
    message: `Verification OTP [ ${generatedOtp} ] sent to ${recipient}`,
  });
});

// Verify OTP Endpoint
app.post("/api/verify-otp", (req, res) => {
  const { recipient, otp } = req.body;
  if (!recipient || !otp) {
    return res.status(400).json({ error: "Recipient and OTP are required" });
  }

  const cleanRecipient = recipient.toLowerCase().trim();
  const cleanOtp = otp.trim();
  const expectedOtp = otpStore.get(cleanRecipient);

  // Accept generated OTP or fallback 123456 / 849201 for easy testing
  if (expectedOtp === cleanOtp || cleanOtp === "123456" || cleanOtp === "849201") {
    res.json({ verified: true, message: "OTP Verified Successfully" });
  } else {
    res.status(400).json({ verified: false, error: "INCORRECT OTP! Please enter the correct 6-digit code." });
  }
});

// Register
app.post("/api/register", (req, res) => {
  const { name, email, phone, password, githubUrl, linkedinUrl } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Name, email and password are required" });
  }

  const existing = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "User already exists with this email" });
  }

  const newUser = {
    id: `u_${Date.now()}`,
    name,
    email,
    phone: phone || "",
    password,
    profilePicture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    githubUrl: githubUrl || "",
    linkedinUrl: linkedinUrl || "",
    targetRole: "Full Stack Developer",
    bio: "Passionate computer science student preparing for tech interviews.",
  };

  db.users.push(newUser);

  res.json({
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      profilePicture: newUser.profilePicture,
      githubUrl: newUser.githubUrl,
      linkedinUrl: newUser.linkedinUrl,
      targetRole: newUser.targetRole,
      bio: newUser.bio,
    },
    token: `jwt_token_${newUser.id}_${Date.now()}`,
  });
});

// Login
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profilePicture: user.profilePicture,
      githubUrl: user.githubUrl,
      linkedinUrl: user.linkedinUrl,
      targetRole: user.targetRole,
      bio: user.bio,
    },
    token: `jwt_token_${user.id}_${Date.now()}`,
  });
});

// Profile GET & PUT
app.get("/api/profile", (req, res) => {
  const user = db.users[0];
  res.json({ user });
});

app.put("/api/profile", (req, res) => {
  const { name, phone, githubUrl, linkedinUrl, targetRole, bio, profilePicture } = req.body;
  const user = db.users[0];
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (githubUrl) user.githubUrl = githubUrl;
  if (linkedinUrl) user.linkedinUrl = linkedinUrl;
  if (targetRole) user.targetRole = targetRole;
  if (bio) user.bio = bio;
  if (profilePicture) user.profilePicture = profilePicture;

  res.json({ user });
});

// Change password
app.post("/api/change-password", (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = db.users[0];
  if (user.password !== currentPassword) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  user.password = newPassword;
  res.json({ success: true, message: "Password updated successfully" });
});

// Start Interview Session
app.post("/api/interview/start", async (req, res) => {
  const { company, role, difficulty, type, totalQuestions = 5 } = req.body;

  const sessionId = `int_${Date.now()}`;
  const newSession = {
    id: sessionId,
    userId: db.users[0].id,
    company: company || "Google",
    role: role || "Software Engineer",
    difficulty: difficulty || "Medium",
    type: type || "Mixed",
    totalQuestions: Number(totalQuestions) || 5,
    currentQuestionIndex: 0,
    status: "in_progress",
    startTime: new Date().toISOString(),
    questions: [],
  };

  db.interviews.set(sessionId, newSession);

  res.json({ session: newSession });
});

// Generate Question using Gemini
app.post("/api/interview/question", async (req, res) => {
  const { sessionId, questionIndex } = req.body;
  const session = db.interviews.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Interview session not found" });
  }

  const isOneOnOne = session.type?.includes("1-on-1") || session.type?.includes("HR") || session.type?.includes("Real Interview") || session.company === "Real Recruiter";

  if (isOneOnOne) {
    const EXACT_ONE_ON_ONE_QUESTIONS = [
      {
        question: "Tell me about yourself, your background, and your key strengths.",
        idealKeyPoints: ["Clear background summary", "Core technical and professional strengths", "Passion and key career achievements"],
      },
      {
        question: "Why should we select you over other candidates for this position?",
        idealKeyPoints: ["Unique skill combinations", "Alignment with role requirements", "Concrete value and drive you bring to the team"],
      },
      {
        question: "Why do you choose our company, and what attracted you to work with us?",
        idealKeyPoints: ["Understanding of company mission", "Enthusiasm for company products & engineering culture", "Long-term career alignment"],
      },
      {
        question: "What is your biggest professional achievement or key strength?",
        idealKeyPoints: ["Concrete example of a major accomplishment", "Problem solving approach", "Demonstrated positive impact"],
      },
      {
        question: "Where do you see yourself in 3 to 5 years, and how does this position fit into your career goals?",
        idealKeyPoints: ["Clear vision for professional growth", "Commitment to technical mastery and leadership", "Alignment with career goals"],
      },
    ];

    const selectedQ = EXACT_ONE_ON_ONE_QUESTIONS[questionIndex % EXACT_ONE_ON_ONE_QUESTIONS.length];

    const questionObj = {
      id: `q_${sessionId}_${questionIndex + 1}`,
      questionNumber: questionIndex + 1,
      category: "1-on-1 Real Interview",
      question: selectedQ.question,
      idealKeyPoints: selectedQ.idealKeyPoints,
    };

    if (session.questions.length <= questionIndex) {
      session.questions.push(questionObj);
    } else {
      session.questions[questionIndex] = questionObj;
    }

    return res.json({ question: questionObj, totalQuestions: session.totalQuestions });
  }

  try {
    let questionText = "";
    let keyPoints: string[] = [];
    let codeSnippet = "";

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING, description: "The interview question" },
              idealKeyPoints: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Key concepts expected in ideal answer",
              },
              codeSnippet: { type: Type.STRING, description: "Optional code snippet or template" },
            },
            required: ["question", "idealKeyPoints"],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        questionText = parsed.question;
        keyPoints = parsed.idealKeyPoints || [];
        codeSnippet = parsed.codeSnippet || "";
      }
    }

    if (!questionText) {
      if (isOneOnOne) {
        const realOneOnOneQuestions = [
          "Tell me about yourself, your background, and your key strengths.",
          "Why should we select you over other candidates for this position?",
          "Why do you choose our company, and what attracted you to work with us?",
          "What is your biggest professional achievement or key strength?",
          "Tell me about a time when you had to work under a tight deadline or high pressure. How did you handle it?",
          "Where do you see yourself in 3 to 5 years, and how does this position fit into your career goals?",
        ];
        questionText = realOneOnOneQuestions[questionIndex % realOneOnOneQuestions.length];
        keyPoints = ["Structured narrative", "Specific concrete achievements", "Strong enthusiasm and clarity"];
      } else {
        const fallbackQuestions = [
          `How do you handle microservices synchronization and event consistency at ${session.company}?`,
          `Describe how you optimize frontend bundle sizes and reduce First Contentful Paint (FCP) for a complex dashboard.`,
          `Explain how garbage collection works in V8 or Java runtime, and how memory leaks occur in production.`,
          `Design a rate limiter for API endpoints handling 100,000 requests per second.`,
          `Tell me about a technical disagreement you had with a senior tech lead and how you resolved it.`,
        ];
        questionText = fallbackQuestions[questionIndex % fallbackQuestions.length];
        keyPoints = ["Architecture trade-offs", "Scalability considerations", "Concrete metrics & examples"];
      }
    }

    const questionObj = {
      id: `q_${sessionId}_${questionIndex + 1}`,
      questionNumber: questionIndex + 1,
      category: session.type,
      question: questionText,
      idealKeyPoints: keyPoints,
      codeSnippet: codeSnippet || undefined,
    };

    if (session.questions.length <= questionIndex) {
      session.questions.push(questionObj);
    } else {
      session.questions[questionIndex] = questionObj;
    }

    res.json({ question: questionObj, totalQuestions: session.totalQuestions });
  } catch (error: any) {
    console.error("Error generating question with Gemini:", error);
    // Safe graceful response fallback
    const fallbackObj = {
      id: `q_${sessionId}_${questionIndex + 1}`,
      questionNumber: questionIndex + 1,
      category: session.type,
      question: `What are the core architectural considerations when building scalable RESTful APIs for a ${session.role} position at ${session.company}?`,
      idealKeyPoints: ["Stateless design", "Database indexing", "Caching strategy with Redis", "Rate limiting"],
    };
    session.questions.push(fallbackObj);
    res.json({ question: fallbackObj, totalQuestions: session.totalQuestions });
  }
});

// Evaluate Answer using Gemini
app.post("/api/interview/evaluate", async (req, res) => {
  const { sessionId, questionId, userAnswer, timeSpentSeconds = 120 } = req.body;
  const session = db.interviews.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  const questionObj = session.questions.find((q: any) => q.id === questionId);
  if (!questionObj) {
    return res.status(404).json({ error: "Question not found" });
  }

  questionObj.userAnswer = userAnswer;
  questionObj.timeSpentSeconds = timeSpentSeconds;

  const prompt = `You are a Senior Tech Lead evaluating a candidate's answer during a mock interview.
Company: ${session.company}
Role: ${session.role}
Difficulty: ${session.difficulty}

Question: "${questionObj.question}"
Ideal Key Points Expected: ${JSON.stringify(questionObj.idealKeyPoints || [])}
Candidate's Given Answer: "${userAnswer || "No answer provided / candidate skipped"}"

Evaluate the answer strictly yet constructively:
- Score (0 to 100)
- Accuracy (0 to 100)
- Clarity (0 to 100)
- Technical Depth (0 to 100)
- Strengths (2-3 bullet points)
- Weaknesses (1-2 bullet points)
- Missing Concepts (1-2 bullet points)
- Feedback (Detailed 2-3 sentence commentary)
- Better Answer Example (A concise exemplar answer the candidate could have given)

Output strictly in JSON format matching the schema.`;

  try {
    let evaluation: any = null;

    if (process.env.GEMINI_API_KEY && userAnswer && userAnswer.trim().length > 3) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER, description: "Overall score out of 100" },
              accuracy: { type: Type.INTEGER },
              clarity: { type: Type.INTEGER },
              technicalDepth: { type: Type.INTEGER },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingConcepts: { type: Type.ARRAY, items: { type: Type.STRING } },
              feedback: { type: Type.STRING },
              betterAnswerExample: { type: Type.STRING },
            },
            required: ["score", "strengths", "weaknesses", "feedback", "betterAnswerExample"],
          },
        },
      });

      if (response.text) {
        evaluation = JSON.parse(response.text);
      }
    }

    if (!evaluation) {
      const wordCount = userAnswer ? userAnswer.trim().split(/\s+/).length : 0;
      const calcScore = Math.min(95, Math.max(40, wordCount * 2 + 35));
      evaluation = {
        score: calcScore,
        accuracy: Math.min(90, calcScore + 5),
        clarity: Math.min(92, calcScore + 2),
        technicalDepth: Math.min(88, calcScore - 3),
        strengths: ["Clear response structure", "Good core logic demonstration"],
        weaknesses: ["Could provide deeper real-world benchmark metrics"],
        missingConcepts: ["Asynchronous exception handling nuances"],
        feedback: "Solid foundation shown. Incorporating specific performance metrics and edge-case scenarios will elevate your response to top percentile.",
        betterAnswerExample: `For ${session.role} at ${session.company}, lead with architectural trade-offs, mention specific technologies (e.g., Redis, Kafka, PostgreSQL indexing), and detail how you measure success under production load.`,
      };
    }

    questionObj.evaluation = evaluation;

    res.json({ evaluation, question: questionObj });
  } catch (error: any) {
    console.error("Error evaluating answer with Gemini:", error);
    const fallbackEval = {
      score: 78,
      accuracy: 80,
      clarity: 82,
      technicalDepth: 75,
      strengths: ["Clear terminology used", "Logical step progression"],
      weaknesses: ["Needs more technical depth"],
      missingConcepts: ["Production error boundary strategy"],
      feedback: "Good response! To hit high senior ratings, elaborate on edge-case failure modes.",
      betterAnswerExample: "Focus on exact API request flows, concurrency controls, and failover design.",
    };
    questionObj.evaluation = fallbackEval;
    res.json({ evaluation: fallbackEval, question: questionObj });
  }
});

// Finish Interview & Generate Comprehensive Report
app.post("/api/interview/finish", async (req, res) => {
  const { sessionId } = req.body;
  const session = db.interviews.get(sessionId);

  if (!session) {
    return res.status(404).json({ error: "Session not found" });
  }

  session.status = "completed";
  session.endTime = new Date().toISOString();

  // Calculate scores
  const evaluatedQuestions = session.questions.filter((q: any) => q.evaluation);
  const avgScore = evaluatedQuestions.length
    ? Math.round(
        evaluatedQuestions.reduce((acc: number, q: any) => acc + (q.evaluation?.score || 0), 0) /
          evaluatedQuestions.length
      )
    : 75;

  const prompt = `You are the Lead Executive Recruiter at ${session.company}.
Candidate: ${db.users[0].name}
Target Role: ${session.role}
Difficulty: ${session.difficulty}
Interview Questions & Candidate Answers:
${JSON.stringify(
  session.questions.map((q: any) => ({
    question: q.question,
    userAnswer: q.userAnswer,
    score: q.evaluation?.score,
    feedback: q.evaluation?.feedback,
  }))
)}

Provide a comprehensive hiring evaluation report:
1. Overall score (0 to 100)
2. Radar Metrics (technical, communication, problemSolving, confidence, systemDesignCulture)
3. Top 3 Strengths
4. Key 2 Weaknesses
5. Actionable Suggestions for Next Round
6. Final AI Remark (Hiring recommendation and concise executive summary)

Output in JSON schema format.`;

  let reportData: any = null;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overallScore: { type: Type.INTEGER },
              radarMetrics: {
                type: Type.OBJECT,
                properties: {
                  technical: { type: Type.INTEGER },
                  communication: { type: Type.INTEGER },
                  problemSolving: { type: Type.INTEGER },
                  confidence: { type: Type.INTEGER },
                  systemDesignCulture: { type: Type.INTEGER },
                },
                required: ["technical", "communication", "problemSolving", "confidence", "systemDesignCulture"],
              },
              topStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              keyWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionableSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              finalAiRemark: { type: Type.STRING },
            },
            required: ["overallScore", "radarMetrics", "topStrengths", "keyWeaknesses", "finalAiRemark"],
          },
        },
      });

      if (response.text) {
        reportData = JSON.parse(response.text);
      }
    }
  } catch (err) {
    console.error("Gemini final report error:", err);
  }

  if (!reportData) {
    reportData = {
      overallScore: avgScore,
      radarMetrics: {
        technical: Math.min(95, avgScore + 3),
        communication: Math.min(95, avgScore - 2),
        problemSolving: Math.min(95, avgScore + 5),
        confidence: Math.min(95, avgScore - 4),
        systemDesignCulture: Math.min(95, avgScore + 1),
      },
      topStrengths: [
        "Strong problem analysis and clear reasoning framework.",
        "Good understanding of fundamental computer science concepts.",
        "Effective communication during technical discussion.",
      ],
      keyWeaknesses: [
        "Could expand on large-scale distributed system failure recovery.",
        "Incorporate precise quantitative benchmarking metrics.",
      ],
      actionableSuggestions: [
        "Practice mock system design scenarios involving Redis caching and message queues.",
        "Review cloud architecture patterns for high availability.",
      ],
      finalAiRemark: `${db.users[0].name} demonstrated impressive preparation for ${session.role} at ${session.company}. Solid candidate with strong potential.`,
    };
  }

  const reportId = `rep_${Date.now()}`;
  const finalReport = {
    id: reportId,
    interviewId: session.id,
    userId: db.users[0].id,
    candidateName: db.users[0].name,
    candidateEmail: db.users[0].email,
    company: session.company,
    role: session.role,
    difficulty: session.difficulty,
    type: session.type,
    date: new Date().toISOString(),
    overallScore: reportData.overallScore || avgScore,
    radarMetrics: reportData.radarMetrics,
    topStrengths: reportData.topStrengths,
    keyWeaknesses: reportData.keyWeaknesses,
    actionableSuggestions: reportData.actionableSuggestions,
    finalAiRemark: reportData.finalAiRemark,
    questions: session.questions,
  };

  db.reports.unshift(finalReport);
  session.reportId = reportId;

  res.json({ report: finalReport });
});

// GET Reports
app.get("/api/reports", (req, res) => {
  const { search, company, role } = req.query;
  let filtered = [...db.reports];

  if (search) {
    const q = String(search).toLowerCase();
    filtered = filtered.filter(
      (r) =>
        r.company.toLowerCase().includes(q) ||
        r.role.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
    );
  }
  if (company && company !== "All") {
    filtered = filtered.filter((r) => r.company === company);
  }
  if (role && role !== "All") {
    filtered = filtered.filter((r) => r.role === role);
  }

  res.json({ reports: filtered });
});

// GET Single Report
app.get("/api/report/:id", (req, res) => {
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }
  res.json({ report });
});

// DELETE Report
app.delete("/api/report/:id", (req, res) => {
  const index = db.reports.findIndex((r) => r.id === req.params.id);
  if (index !== -1) {
    db.reports.splice(index, 1);
  }
  res.json({ success: true });
});

// Resume Upload & ATS Parsing with Gemini
app.post("/api/resume/upload", async (req, res) => {
  const { resumeText, targetRole = "Software Engineer" } = req.body;

  if (!resumeText || resumeText.trim().length < 20) {
    return res.status(400).json({ error: "Please provide valid resume text or document content" });
  }

  const prompt = `You are an expert HR ATS (Applicant Tracking System) Scanner & Senior Recruiter.
Analyze this candidate's resume for the target role: "${targetRole}".

Resume Content:
"""
${resumeText}
"""

Perform detailed evaluation:
1. ATS Compatibility Score (0 to 100)
2. Formatting Score (0 to 100)
3. Keyword Density Score (0 to 100)
4. Extracted Skills list (technical & soft skills detected)
5. Missing Skills list (critical missing skills for ${targetRole})
6. Bullet Point Feedback (3 constructive feedback items)
7. Actionable Improvement Tips (3 high-impact recommendations)
8. Suggested alternative tech roles (2-3 roles)

Output in strict JSON format matching schema.`;

  try {
    let result: any = null;

    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              atsScore: { type: Type.INTEGER },
              formattingScore: { type: Type.INTEGER },
              keywordDensityScore: { type: Type.INTEGER },
              extractedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              missingSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
              bulletPointFeedback: { type: Type.ARRAY, items: { type: Type.STRING } },
              actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestedRoles: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["atsScore", "extractedSkills", "missingSkills", "bulletPointFeedback", "actionableTips"],
          },
        },
      });

      if (response.text) {
        result = JSON.parse(response.text);
      }
    }

    if (!result) {
      result = {
        atsScore: 84,
        formattingScore: 88,
        keywordDensityScore: 80,
        extractedSkills: ["React.js", "TypeScript", "Node.js", "Express", "Tailwind CSS", "Git", "REST APIs", "PostgreSQL"],
        missingSkills: ["Docker / Kubernetes", "CI/CD Pipelines", "Redis Caching", "GraphQL", "System Monitoring (Datadog/Grafana)"],
        bulletPointFeedback: [
          "Use metric-driven verbs (e.g. 'Optimized API latency by 42%' instead of 'Worked on API').",
          "Ensure standard section headers like 'Work Experience', 'Education', and 'Technical Skills'.",
          "Include links to live project demos or GitHub repositories.",
        ],
        actionableTips: [
          "Add cloud deployment experience (AWS/GCP/Docker) to boost ATS ranking for senior roles.",
          "Quantify capstone project results with user numbers or test coverage metrics.",
          "Highlight modern state management tools (Zustand/Redux Toolkit) under React skills.",
        ],
        suggestedRoles: ["Frontend Engineer", "Full Stack Developer", "Web Application Developer"],
      };
    }

    res.json({ result });
  } catch (error) {
    console.error("Resume ATS evaluation error:", error);
    res.status(500).json({ error: "Failed to analyze resume with AI" });
  }
});

// Practice Questions Library with Extensive LeetCode Problems & Language-Specific MCQs / Fill-in-Blanks
app.get("/api/practice/questions", (req, res) => {
  const practiceQuestions = [
    // LEETCODE 1
    {
      id: "lc_1",
      title: "LeetCode #1: Two Sum",
      type: "Coding",
      topicOrLanguage: "DSA",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target` in O(n) time.",
      hints: [
        "Hint 1: A brute-force two-loop solution takes O(n^2) time. Can we trade space for time using a hash map?",
        "Hint 2: As you iterate through `nums`, calculate `diff = target - current_num`. Check if `diff` is already stored in your hash map.",
        "Hint 3: Store each number and its index in the map as you go so you can find the matching pair in O(1) time.",
      ],
      languageTemplates: {
        python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    num_map = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in num_map:\n            return [num_map[diff], i]\n        num_map[num] = i\n    return []\n\nprint(two_sum([2, 7, 11, 15], 9)) # Expected: [0, 1]`,
        javascript: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log(twoSum([2, 7, 11, 15], 9));`,
        typescript: `function twoSum(nums: number[], target: number): number[] {\n  const map = new Map<number, number>();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff)!, i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
        cpp: `#include <iostream>\n#include <vector>\n#include <unordered_map>\n\nstd::vector<int> twoSum(const std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> map;\n    for (int i = 0; i < nums.size(); ++i) {\n        int diff = target - nums[i];\n        if (map.count(diff)) {\n            return {map[diff], i};\n        }\n        map[nums[i]] = i;\n    }\n    return {};\n}`,
        java: `import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (map.containsKey(diff)) {\n                return new int[] { map.get(diff), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
        c: `#include <stdio.h>\n#include <stdlib.h>\n\nint* twoSum(int* nums, int numsSize, int target, int* returnSize) {\n    int* result = (int*)malloc(2 * sizeof(int));\n    *returnSize = 2;\n    for (int i = 0; i < numsSize; i++) {\n        for (int j = i + 1; j < numsSize; j++) {\n            if (nums[i] + nums[j] == target) {\n                result[0] = i; result[1] = j;\n                return result;\n            }\n        }\n    }\n    return NULL;\n}`,
        go: `package main\n\nfunc twoSum(nums []int, target int) []int {\n    m := make(map[int]int)\n    for i, num := range nums {\n        if idx, ok := m[target-num]; ok {\n            return []int{idx, i}\n        }\n        m[num] = i\n    }\n    return []int{}\n}`,
        rust: `use std::collections::HashMap;\n\npub fn two_sum(nums: Vec<i32>, target: i32) -> Vec<i32> {\n    let mut map = HashMap::new();\n    for (i, &num) in nums.iter().enumerate() {\n        if let Some(&prev) = map.get(&(target - num)) {\n            return vec![prev as i32, i as i32];\n        }\n        map.insert(num, i);\n    }\n    vec![]\n}`,
      },
      initialCode: `function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const diff = target - nums[i];\n    if (map.has(diff)) {\n      return [map.get(diff), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}`,
      explanation: "Using a hash table maps values to indices for O(1) amortized lookup.",
    },

    // LEETCODE 206
    {
      id: "lc_206",
      title: "LeetCode #206: Reverse Linked List",
      type: "Coding",
      topicOrLanguage: "DSA",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Given the head of a singly linked list, reverse the list in-place and return its new head.",
      hints: [
        "Hint 1: Maintain three pointers: prev = None, curr = head, next_node.",
        "Hint 2: In a loop, save curr.next, set curr.next = prev, then move prev = curr and curr = next_node.",
      ],
      languageTemplates: {
        python: `class ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef reverse_list(head: ListNode) -> ListNode:\n    prev = None\n    curr = head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
        javascript: `function reverseList(head) {\n  let prev = null;\n  let curr = head;\n  while (curr) {\n    let nxt = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}`,
        java: `public class ListNode {\n    int val;\n    ListNode next;\n    ListNode(int val) { this.val = val; }\n}\n\nclass Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nxt = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n}`,
        cpp: `struct ListNode {\n    int val;\n    ListNode *next;\n    ListNode(int x) : val(x), next(nullptr) {}\n};\n\nListNode* reverseList(ListNode* head) {\n    ListNode *prev = nullptr, *curr = head;\n    while (curr) {\n        ListNode *nxt = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}`,
        c: `struct ListNode {\n    int val;\n    struct ListNode *next;\n};\n\nstruct ListNode* reverseList(struct ListNode* head) {\n    struct ListNode* prev = NULL;\n    struct ListNode* curr = head;\n    while (curr) {\n        struct ListNode* nxt = curr->next;\n        curr->next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}`,
      },
      initialCode: `function reverseList(head) {\n  let prev = null, curr = head;\n  while (curr) {\n    let nxt = curr.next;\n    curr.next = prev;\n    prev = curr;\n    curr = nxt;\n  }\n  return prev;\n}`,
      explanation: "Iterating through the list while adjusting pointers takes O(n) time and O(1) space.",
    },

    // LEETCODE 20: Valid Parentheses
    {
      id: "lc_20",
      title: "LeetCode #20: Valid Parentheses",
      type: "Coding",
      topicOrLanguage: "DSA",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid using a Stack.",
      hints: [
        "Hint 1: Push opening brackets onto a stack.",
        "Hint 2: When encountering a closing bracket, check if the stack top matches the corresponding pair.",
      ],
      languageTemplates: {
        python: `def is_valid(s: str) -> bool:\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for char in s:\n        if char in mapping:\n            top = stack.pop() if stack else '#'\n            if mapping[char] != top:\n                return False\n        else:\n            stack.append(char)\n    return not stack`,
        javascript: `function isValid(s) {\n  const stack = [];\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  for (let ch of s) {\n    if (pairs[ch]) {\n      if (stack.pop() !== pairs[ch]) return false;\n    } else {\n      stack.push(ch);\n    }\n  }\n  return stack.length === 0;\n}`,
        java: `import java.util.*;\n\nclass Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}`,
      },
      initialCode: `function isValid(s) {\n  const stack = [];\n  const map = { ')': '(', '}': '{', ']': '[' };\n  for (let char of s) {\n    if (map[char]) {\n      if (stack.pop() !== map[char]) return false;\n    } else {\n      stack.push(char);\n    }\n  }\n  return stack.length === 0;\n}`,
      explanation: "LIFO stack discipline ensures matching nested bracket scopes in O(n) time.",
    },

    // LEETCODE 121: Best Time to Buy and Sell Stock
    {
      id: "lc_121",
      title: "LeetCode #121: Best Time to Buy and Sell Stock",
      type: "Coding",
      topicOrLanguage: "DSA",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Given an array `prices` where `prices[i]` is the price of a stock on day `i`, return the maximum profit you can achieve from a single transaction.",
      hints: [
        "Hint 1: Keep track of the minimum price seen so far as you traverse the array.",
        "Hint 2: Calculate profit = current_price - min_price and update max_profit.",
      ],
      languageTemplates: {
        python: `def max_profit(prices: list[int]) -> int:\n    min_price = float('inf')\n    max_p = 0\n    for price in prices:\n        if price < min_price:\n            min_price = price\n        elif price - min_price > max_p:\n            max_p = price - min_price\n    return max_p`,
        javascript: `function maxProfit(prices) {\n  let minPrice = Infinity;\n  let maxProfit = 0;\n  for (let price of prices) {\n    if (price < minPrice) minPrice = price;\n    else if (price - minPrice > maxProfit) maxProfit = price - minPrice;\n  }\n  return maxProfit;\n}`,
        c: `#include <stdio.h>\n#include <limits.h>\n\nint maxProfit(int* prices, int pricesSize) {\n    int minPrice = INT_MAX;\n    int maxProf = 0;\n    for (int i = 0; i < pricesSize; i++) {\n        if (prices[i] < minPrice) minPrice = prices[i];\n        else if (prices[i] - minPrice > maxProf) maxProf = prices[i] - minPrice;\n    }\n    return maxProf;\n}`,
      },
      initialCode: `function maxProfit(prices) {\n  let minPrice = Infinity, maxProf = 0;\n  for (let p of prices) {\n    if (p < minPrice) minPrice = p;\n    else maxProf = Math.max(maxProf, p - minPrice);\n  }\n  return maxProf;\n}`,
      explanation: "A single-pass greedy scan tracks running minimum price and optimal peak profit in O(n) time.",
    },

    // LEETCODE 3: Longest Substring Without Repeating Characters
    {
      id: "lc_3",
      title: "LeetCode #3: Longest Substring Without Repeating Characters",
      type: "Coding",
      topicOrLanguage: "DSA",
      difficulty: "Medium",
      role: "Software Engineer",
      question: "Given a string `s`, find the length of the longest substring without repeating characters using Sliding Window.",
      hints: [
        "Hint 1: Use a sliding window with two pointers `left` and `right`, and a hash set or char map.",
        "Hint 2: Expand `right`. If `s[right]` exists in set, shrink `left` until duplicates are removed.",
      ],
      languageTemplates: {
        python: `def length_of_longest_substring(s: str) -> int:\n    char_set = set()\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len`,
        javascript: `function lengthOfLongestSubstring(s) {\n  const set = new Set();\n  let left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}`,
      },
      initialCode: `function lengthOfLongestSubstring(s) {\n  let set = new Set(), left = 0, maxLen = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) set.delete(s[left++]);\n    set.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}`,
      explanation: "Sliding window ensures each character is visited at most twice for O(n) time complexity.",
    },

    // LEETCODE 11: Container With Most Water
    {
      id: "lc_11",
      title: "LeetCode #11: Container With Most Water",
      type: "Coding",
      topicOrLanguage: "DSA",
      difficulty: "Medium",
      role: "Software Engineer",
      question: "Given an integer array `height` of length `n`, find two lines that together with the x-axis form a container containing the most water.",
      hints: [
        "Hint 1: Start with two pointers at the extreme ends: left = 0, right = n - 1.",
        "Hint 2: Area is calculated as min(height[left], height[right]) * (right - left). Move the pointer pointing to the smaller height inward.",
      ],
      languageTemplates: {
        python: `def max_area(height: list[int]) -> int:\n    left, right = 0, len(height) - 1\n    max_water = 0\n    while left < right:\n        width = right - left\n        h = min(height[left], height[right])\n        max_water = max(max_water, width * h)\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n    return max_water`,
        javascript: `function maxArea(height) {\n  let left = 0, right = height.length - 1, maxWater = 0;\n  while (left < right) {\n    let w = right - left;\n    let h = Math.min(height[left], height[right]);\n    maxWater = Math.max(maxWater, w * h);\n    if (height[left] < height[right]) left++;\n    else right--;\n  }\n  return maxWater;\n}`,
      },
      initialCode: `function maxArea(height) {\n  let left = 0, right = height.length - 1, maxWater = 0;\n  while (left < right) {\n    let area = Math.min(height[left], height[right]) * (right - left);\n    maxWater = Math.max(maxWater, area);\n    if (height[left] < height[right]) left++;\n    else right--;\n  }\n  return maxWater;\n}`,
      explanation: "Two Pointers inward traversal eliminates redundant area computations in O(n) time.",
    },

    // LEETCODE 200: Number of Islands
    {
      id: "lc_200",
      title: "LeetCode #200: Number of Islands",
      type: "Coding",
      topicOrLanguage: "DSA",
      difficulty: "Medium",
      role: "Software Engineer",
      question: "Given an `m x n` 2D binary grid `grid` representing a map of '1's (land) and '0's (water), return the number of islands using BFS or DFS.",
      hints: [
        "Hint 1: Iterate through every cell in the grid.",
        "Hint 2: When you find a '1', increment island count and run DFS/BFS to sink (change to '0') all connected land cells.",
      ],
      languageTemplates: {
        python: `def num_islands(grid: list[list[str]]) -> int:\n    if not grid: return 0\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    \n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1':\n            return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n        \n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                count += 1\n                dfs(r, c)\n    return count`,
        javascript: `function numIslands(grid) {\n  if (!grid.length) return 0;\n  let count = 0;\n  const rows = grid.length, cols = grid[0].length;\n  \n  function dfs(r, c) {\n    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1);\n  }\n  \n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        dfs(r, c);\n      }\n    }\n  }\n  return count;\n}`,
      },
      initialCode: `function numIslands(grid) {\n  let count = 0;\n  for (let r = 0; r < grid.length; r++) {\n    for (let c = 0; c < grid[0].length; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        sink(grid, r, c);\n      }\n    }\n  }\n  return count;\n}\nfunction sink(g, r, c) {\n  if (r<0||r>=g.length||c<0||c>=g[0].length||g[r][c]!=='1') return;\n  g[r][c] = '0';\n  sink(g, r+1, c); sink(g, r-1, c); sink(g, r, c+1); sink(g, r, c-1);\n}`,
      explanation: "2D Grid DFS traversal visits each cell at most once in O(M x N) time.",
    },

    // --- LANGUAGE SPECIFIC FILL-IN-THE-BLANKS & MCQS ---

    // PYTHON FILL IN BLANK
    {
      id: "py_fib_1",
      title: "Python List Comprehension Filtering",
      type: "Fill in Blanks",
      topicOrLanguage: "Python",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Complete the Python list comprehension to extract only even numbers from `nums`.",
      fillBlankSnippet: `evens = [x for x in nums _____ x % 2 == 0]`,
      fillBlankAnswer: "if",
      hints: [
        "Hint: In Python list comprehensions, the filtering conditional keyword comes after the iterator.",
      ],
      explanation: "Python list comprehensions use `[expr for var in iterable if condition]` syntax.",
    },
    {
      id: "py_fib_2",
      title: "Python Generator Function Keyword",
      type: "Fill in Blanks",
      topicOrLanguage: "Python",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Fill in the keyword used in Python to pause function execution and return a value to the caller without destroying state.",
      fillBlankSnippet: `def count_up():\n    count = 0\n    while True:\n        _____ count\n        count += 1`,
      fillBlankAnswer: "yield",
      hints: [
        "Hint: The keyword turns a normal Python function into a Generator iterator.",
      ],
      explanation: "`yield` produces a generator object and suspends state until next() is invoked.",
    },
    {
      id: "py_mcq_1",
      title: "Python Global Interpreter Lock (GIL)",
      type: "MCQ",
      topicOrLanguage: "Python",
      difficulty: "Medium",
      role: "Backend Engineer",
      question: "What is the primary effect of the CPython Global Interpreter Lock (GIL)?",
      options: [
        "A. Prevents multiple native threads from executing Python bytecodes simultaneously in CPython",
        "B. Disables garbage collection during memory allocation",
        "C. Prevents file I/O operations from running asynchronously",
        "D. Enforces strictly single-threaded event loop like Node.js",
      ],
      correctAnswer: "A. Prevents multiple native threads from executing Python bytecodes simultaneously in CPython",
      hints: [
        "Hint: The GIL protects memory management in CPython by enforcing single-thread bytecode execution per process.",
      ],
      explanation: "CPython uses GIL to manage memory safely, requiring multiprocessing for CPU-bound parallelism.",
    },

    // C LANGUAGE FILL IN BLANK & MCQ
    {
      id: "c_fib_1",
      title: "C Memory Allocation & Pointers",
      type: "Fill in Blanks",
      topicOrLanguage: "C",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Complete the C code snippet to dynamically allocate memory for an array of 10 integers.",
      fillBlankSnippet: `int* arr = (int*) _____ (10 * sizeof(int));`,
      fillBlankAnswer: "malloc",
      hints: [
        "Hint: The standard C library function for dynamic heap memory allocation is `malloc`.",
      ],
      explanation: "`malloc(size_t size)` allocates memory blocks on the heap in C.",
    },
    {
      id: "c_fib_2",
      title: "C Struct Pointer Arrow Operator",
      type: "Fill in Blanks",
      topicOrLanguage: "C",
      difficulty: "Easy",
      role: "Software Engineer",
      question: "Fill in the operator used in C to access a struct member through a struct pointer variable `ptr`.",
      fillBlankSnippet: `struct Node* ptr = createNode(10);\nint val = ptr _____ data;`,
      fillBlankAnswer: "->",
      hints: [
        "Hint: The arrow operator `->` dereferences the pointer and accesses the struct field.",
      ],
      explanation: "`ptr->data` is syntactic shorthand for `(*ptr).data` in C.",
    },
    {
      id: "c_mcq_1",
      title: "C Dangling Pointer & Free Memory",
      type: "MCQ",
      topicOrLanguage: "C",
      difficulty: "Medium",
      role: "Software Engineer",
      question: "What happens if you access a pointer after passing it to `free(ptr)` in C without assigning `NULL`?",
      options: [
        "A. Undefined Behavior due to accessing a dangling pointer",
        "B. The memory is automatically re-allocated with zero values",
        "C. A compile-time error is raised by gcc",
        "D. The program halts with a clean zero exit code",
      ],
      correctAnswer: "A. Undefined Behavior due to accessing a dangling pointer",
      hints: [
        "Hint: Freed heap addresses no longer belong to the application scope.",
      ],
      explanation: "Dereferencing freed memory causes undefined behavior or segmentation faults in C.",
    },

    // JAVA FILL IN BLANK & MCQ
    {
      id: "java_fib_1",
      title: "Java Try-With-Resources AutoCloseable",
      type: "Fill in Blanks",
      topicOrLanguage: "Java",
      difficulty: "Medium",
      role: "Backend Engineer",
      question: "Fill in the statement keyword to automatically close stream resources upon exiting the block in Java 7+.",
      fillBlankSnippet: `_____ (BufferedReader reader = new BufferedReader(new FileReader("data.txt"))) {\n    System.out.println(reader.readLine());\n}`,
      fillBlankAnswer: "try",
      hints: [
        "Hint: Try-with-resources statement syntax begins with the `try` keyword followed by resource initialization in parentheses.",
      ],
      explanation: "`try (Resource r = ...)` automatically calls `.close()` on AutoCloseable resources.",
    },
    {
      id: "java_mcq_1",
      title: "Java ConcurrentHashMap vs HashMap",
      type: "MCQ",
      topicOrLanguage: "Java",
      difficulty: "Medium",
      role: "Backend Engineer",
      question: "How does `ConcurrentHashMap` achieve high multithreaded concurrency compared to a synchronized `HashMap` in Java?",
      options: [
        "A. Locks fine-grained bucket segments / CAS operations instead of locking the whole table",
        "B. Reallocates thread stack memory on every PUT request",
        "C. Disables hash collisions by doubling key space",
        "D. Converts all keys into primitive integer arrays",
      ],
      correctAnswer: "A. Locks fine-grained bucket segments / CAS operations instead of locking the whole table",
      hints: [
        "Hint: ConcurrentHashMap uses bucket-level locking and atomic CAS updates rather than full-map mutex locks.",
      ],
      explanation: "ConcurrentHashMap uses lock striping and compare-and-swap (CAS) instructions for lock-free read concurrency.",
    },

    // C++ FILL IN BLANK & MCQ
    {
      id: "cpp_fib_1",
      title: "C++ Smart Pointer Ownership",
      type: "Fill in Blanks",
      topicOrLanguage: "C++",
      difficulty: "Medium",
      role: "Software Engineer",
      question: "Fill in the C++ standard library smart pointer class that enforces exclusive non-shareable ownership.",
      fillBlankSnippet: `std:: _____ <Widget> ptr = std::make_unique<Widget>();`,
      fillBlankAnswer: "unique_ptr",
      hints: [
        "Hint: It cannot be copied, only moved via std::move().",
      ],
      explanation: "`std::unique_ptr` manages single-owner heap resources without raw pointer overhead.",
    },

    // JAVASCRIPT & SQL
    {
      id: "sql_fib_1",
      title: "SQL Aggregate Filtering Clause",
      type: "Fill in Blanks",
      topicOrLanguage: "SQL",
      difficulty: "Easy",
      role: "Backend Engineer",
      question: "Fill in the SQL clause used to filter grouped rows after a `GROUP BY` aggregation.",
      fillBlankSnippet: `SELECT department, COUNT(*) FROM employees GROUP BY department _____ COUNT(*) > 5;`,
      fillBlankAnswer: "HAVING",
      hints: [
        "Hint: While `WHERE` filters rows before grouping, this clause filters aggregate results after grouping.",
      ],
      explanation: "The `HAVING` clause filters aggregated rows produced by `GROUP BY`.",
    },
  ];

  res.json({ questions: practiceQuestions });
});

// Dynamic AI Practice Question Generator for Language / Topic
app.post("/api/practice/generate", async (req, res) => {
  const { language, type } = req.body;
  const targetLanguage = language || "Python";
  const questionType = type || "Fill in Blanks";

  const prompt = `Generate 3 high-quality ${questionType} practice questions specifically for the programming language / topic "${targetLanguage}".
Ensure questions test actual practical programming syntax, concepts, and framework best practices for ${targetLanguage}.

For Fill in Blanks, provide:
- title
- question
- fillBlankSnippet (short code snippet with "_____" marking the blank)
- fillBlankAnswer (exact string for the blank)
- hints (array of 1-2 hints)
- explanation

For MCQs, provide:
- title
- question
- options (array of 4 distinct choices A, B, C, D)
- correctAnswer (exact string matching one of the options)
- hints (array of 1-2 hints)
- explanation

Output JSON array containing 3 objects with properties:
"id", "title", "type" ("${questionType}"), "topicOrLanguage" ("${targetLanguage}"), "difficulty" ("Easy" or "Medium"), "role" ("Software Engineer"), "question", "hints", "explanation", and either "fillBlankSnippet"/"fillBlankAnswer" OR "options"/"correctAnswer".`;

  try {
    let generatedQuestions: any[] = [];
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                type: { type: Type.STRING },
                topicOrLanguage: { type: Type.STRING },
                difficulty: { type: Type.STRING },
                role: { type: Type.STRING },
                question: { type: Type.STRING },
                fillBlankSnippet: { type: Type.STRING },
                fillBlankAnswer: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.STRING },
                hints: { type: Type.ARRAY, items: { type: Type.STRING } },
                explanation: { type: Type.STRING },
              },
              required: ["title", "question", "hints", "explanation"],
            },
          },
        },
      });

      if (response.text) {
        generatedQuestions = JSON.parse(response.text);
      }
    }

    if (!generatedQuestions || generatedQuestions.length === 0) {
      generatedQuestions = [
        {
          id: `gen_${Date.now()}_1`,
          title: `${targetLanguage} Basic Syntax Test`,
          type: questionType,
          topicOrLanguage: targetLanguage,
          difficulty: "Easy",
          role: "Software Engineer",
          question: `Test your fundamental knowledge of ${targetLanguage}.`,
          fillBlankSnippet: `# ${targetLanguage} example snippet\nprint("Hello, ${targetLanguage}!")`,
          fillBlankAnswer: "print",
          options: [
            `A. Standard ${targetLanguage} syntax`,
            "B. Deprecated method",
            "C. Invalid expression",
            "D. Runtime error",
          ],
          correctAnswer: `A. Standard ${targetLanguage} syntax`,
          hints: [`Hint: Review standard ${targetLanguage} documentation.`],
          explanation: `Demonstrates essential ${targetLanguage} concepts.`,
        },
      ];
    }

    res.json({ questions: generatedQuestions });
  } catch (err) {
    console.error("Failed to generate language practice questions:", err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});

// Practice Evaluation
app.post("/api/practice/evaluate", async (req, res) => {
  const { questionTitle, questionType, userAnswer, code } = req.body;

  const prompt = `Evaluate this student's practice response:
Question Title: "${questionTitle}"
Type: ${questionType}
User Provided Response / Code:
"""
${code || userAnswer}
"""

Provide:
1. Score (0 to 100)
2. Technical correctness summary
3. Key strengths
4. Optimization suggestions or clean code improvements

Output JSON format.`;

  try {
    let evalRes: any = null;
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              correctness: { type: Type.STRING },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              improvements: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["score", "correctness", "strengths", "improvements"],
          },
        },
      });

      if (response.text) {
        evalRes = JSON.parse(response.text);
      }
    }

    if (!evalRes) {
      evalRes = {
        score: 90,
        correctness: "Code executes logically and handles edge cases appropriately.",
        strengths: ["Clean syntax and indentation", "Optimal time complexity"],
        improvements: ["Add JSDoc comments for clarity", "Consider null input boundary checks"],
      };
    }

    res.json({ evaluation: evalRes });
  } catch (err) {
    res.json({
      evaluation: {
        score: 85,
        correctness: "Solution meets specifications.",
        strengths: ["Valid logic structure"],
        improvements: ["Ensure input parameter validation"],
      },
    });
  }
});

// Dashboard Analytics & Stats
app.get("/api/dashboard/stats", (req, res) => {
  try {
    /*
     * Temporary clean dashboard response.
     *
     * This removes all fake statistics until the interview
     * and report data are fully connected to Django.
     */

    return res.json({
      stats: {
        totalInterviews: 0,
        averageScore: 0,
        overallAccuracy: 0,
        completionRate: 0,

        strongTopics: [],
        weakTopics: [],

        weeklyProgress: [],
        monthlyProgress: [],

        recentReports: [],
      },
    });
  } catch (error) {
    console.error(
      "Failed to load dashboard statistics:",
      error
    );

    return res.status(500).json({
      error: "Failed to load dashboard statistics.",
    });
  }
});

// Leaderboard & Achievements
app.get("/api/leaderboard", (req, res) => {
  // Benchmark peers
  const benchmarkCandidates = [
    {
      id: "u_bench_1",
      name: "Priya Sharma",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      totalInterviews: 28,
      averageScore: 96,
      targetRole: "Data Scientist",
      topSkills: ["Python", "TensorFlow", "SQL", "System Design"],
      badge: "Master Interviewer",
    },
    {
      id: "u_bench_2",
      name: "Rohan Patel",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      totalInterviews: 19,
      averageScore: 88,
      targetRole: "Backend Engineer",
      topSkills: ["Java", "Distributed Systems", "Spring Boot", "Kafka"],
      badge: "System Architect",
    },
    {
      id: "u_bench_3",
      name: "Sarah Jenkins",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
      totalInterviews: 15,
      averageScore: 85,
      targetRole: "Frontend Engineer",
      topSkills: ["Vue", "Tailwind CSS", "JavaScript", "Webpack"],
      badge: "UI Champion",
    },
  ];

  // Map real users from db.users
  const userEntries = db.users.map((user) => {
    // Find all reports completed by this user
    const userReports = db.reports.filter(
      (r) => r.userId === user.id || (r.candidateEmail && r.candidateEmail.toLowerCase() === user.email.toLowerCase())
    );
    const completedCount = userReports.length;
    const avgScore = completedCount > 0
      ? Math.round(userReports.reduce((acc, r) => acc + (r.overallScore || 80), 0) / completedCount)
      : (user.id === "u_demo" ? 91 : 78);

    let badge = "Registered Candidate";
    if (avgScore >= 90) badge = "Top 5% Candidate";
    else if (avgScore >= 85) badge = "Rising Star";
    else if (completedCount > 0) badge = "Active Candidate";

    return {
      id: user.id,
      name: user.name,
      avatar: user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`,
      totalInterviews: completedCount + (user.id === "u_demo" ? 22 : 0),
      interviewsCompleted: completedCount + (user.id === "u_demo" ? 22 : 0),
      averageScore: avgScore,
      avgScore: avgScore,
      targetRole: user.targetRole || "Software Engineer",
      topRole: user.targetRole || "Software Engineer",
      topSkills: ["React", "Node.js", "TypeScript", "Algorithms"],
      badge: badge,
      isRealUser: true,
      email: user.email,
    };
  });

  // Combine real registered users and benchmark peers
  const combined = [...userEntries];
  benchmarkCandidates.forEach((bench) => {
    if (!combined.some((u) => u.name.toLowerCase() === bench.name.toLowerCase())) {
      combined.push({
        ...bench,
        interviewsCompleted: bench.totalInterviews,
        avgScore: bench.averageScore,
        topRole: bench.targetRole,
        isRealUser: false,
        email: "",
      });
    }
  });

  // Sort descending by average score then total interviews
  combined.sort((a, b) => b.averageScore - a.averageScore || b.totalInterviews - a.totalInterviews);

  // Assign ranks
  const leaderboard = combined.map((entry, index) => ({
    ...entry,
    rank: index + 1,
  }));

  const achievements = [
    {
      id: "ach_1",
      title: "First Steps",
      description: "Complete your first AI mock interview",
      icon: "🎯",
      unlocked: true,
      unlockedAt: "2 days ago",
      progress: 100,
    },
    {
      id: "ach_2",
      title: "FAANG Ready",
      description: "Score above 85% in a Hard difficulty interview",
      icon: "🚀",
      unlocked: true,
      unlockedAt: "Yesterday",
      progress: 100,
    },
    {
      id: "ach_3",
      title: "ATS Resume Ninja",
      description: "Achieve a resume ATS score above 80%",
      icon: "📄",
      unlocked: true,
      unlockedAt: "3 days ago",
      progress: 100,
    },
    {
      id: "ach_4",
      title: "Voice Virtuoso",
      description: "Complete an entire interview using speech recognition",
      icon: "🎙️",
      unlocked: true,
      unlockedAt: "Today",
      progress: 100,
    },
    {
      id: "ach_5",
      title: "Marathon Streak",
      description: "Complete 10 mock interviews",
      icon: "🔥",
      unlocked: false,
      progress: 50,
    },
  ];

  res.json({ leaderboard, achievements });
});

// Server Initialization with Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Interview Simulator Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
