import axios from "axios";

import {
  InterviewSession,
  FinalReport,
  ResumeATSResult,
  PracticeQuestion,
  DashboardStats,
  LeaderboardEntry,
  Achievement,
} from "../types";

const DJANGO_API =
  import.meta.env.VITE_DJANGO_API ||
  "https://ai-interview-simulator-docker.onrender.com/api";


const getToken = (): string | null => {
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("accessToken")
  );
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
};

const parseResponse = async <T>(
  response: Response,
  fallbackMessage: string
): Promise<T> => {
  let data: any = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const firstError = Object.values(data)[0];

    if (typeof data.error === "string") {
      throw new Error(data.error);
    }

    if (typeof data.detail === "string") {
      throw new Error(data.detail);
    }

    if (typeof data.message === "string") {
      throw new Error(data.message);
    }

    if (
      Array.isArray(firstError) &&
      firstError.length > 0
    ) {
      throw new Error(String(firstError[0]));
    }

    if (typeof firstError === "string") {
      throw new Error(firstError);
    }

    throw new Error(fallbackMessage);
  }

  return data as T;
};

export const getApiError = (
  error: unknown,
  fallbackMessage = "Something went wrong."
): string => {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;

    if (typeof data?.error === "string") {
      return data.error;
    }

    if (typeof data?.detail === "string") {
      return data.detail;
    }

    if (typeof data?.message === "string") {
      return data.message;
    }
  }

  return fallbackMessage;
};

export interface RegisterData {
  full_name: string;
  email: string;
  password: string;

  phone?: string;
}

export interface LoginResponse {
  message: string;
  refresh: string;
  access: string;

  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ProfileResponse {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  preferred_language?: string;
}


export const apiService = {
  // =====================================================
  // Authentication
  // =====================================================

  async register(
    data: RegisterData
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${DJANGO_API}/accounts/register/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(data),
      }
    );

    return parseResponse<{ message: string }>(
      response,
      "Registration failed."
    );
  },

  async verifyOtp(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${DJANGO_API}/accounts/verify-otp/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          otp,
        }),
      }
    );

    return parseResponse<{ message: string }>(
      response,
      "OTP verification failed."
    );
  },

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const response = await fetch(
      `${DJANGO_API}/accounts/login/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          password,
        }),
      }
    );

    return parseResponse<LoginResponse>(
      response,
      "Login failed."
    );
  },

  async googleLogin(
    credential: string
  ): Promise<LoginResponse> {
    const response = await fetch(
      `${DJANGO_API}/accounts/google-login/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          credential,
        }),
      }
    );

    return parseResponse<LoginResponse>(
      response,
      "Google login failed."
    );
  },

  async forgotPassword(
    email: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${DJANGO_API}/accounts/forgot-password/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
        }),
      }
    );

    return parseResponse<{ message: string }>(
      response,
      "Unable to send password reset OTP."
    );
  },

  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${DJANGO_API}/accounts/reset-password/`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          email,
          otp,
          new_password: newPassword,
        }),
      }
    );

    return parseResponse<{ message: string }>(
      response,
      "Password reset failed."
    );
  },

  async getProfile(): Promise<ProfileResponse> {
    const response = await fetch(
      `${DJANGO_API}/accounts/profile/`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse<ProfileResponse>(
      response,
      "Failed to load profile."
    );
  },

  async updateProfile(
      data: FormData
    ): Promise<ProfileResponse> {
      const token =
        localStorage.getItem("auth_token") ||
        localStorage.getItem("accessToken");

      const response = await fetch(
        `${DJANGO_API}/accounts/profile/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: data,
        }
      );

      return parseResponse<ProfileResponse>(
        response,
        "Failed to update profile."
      );
    },

      async getCareerIntelligence(): Promise<{
        github: {
          username: string;
          name?: string;
          bio?: string;
          public_repositories: number;
          followers: number;
          following: number;
          repositories: {
            name: string;
            description?: string;
            language?: string;
            stars: number;
            forks: number;
            url: string;
          }[];
        };

        analysis: {
          githubScore: number;
          profileSummary: string;
          strongSkills: string[];
          missingSkills: string[];
          recommendedJobs: string[];
          recommendedInternships: string[];
          recommendedProjects: string[];
          githubImprovements: string[];
          resumeImprovements: string[];
          nextLearningSteps: string[];
        };
      }> {
        const response = await fetch(
          `${DJANGO_API}/accounts/career-intelligence/`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        return parseResponse(
          response,
          "Unable to analyze career profile."
        );
      },

  async endInterview(
    sessionId: string,
    reason: string,
    note = ""
  ) {
    const response = await fetch(
      `${DJANGO_API}/interviews/end/`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          session_id: sessionId,
          reason,
          note,
        }),
      }
    );

    return parseResponse(
      response,
      "Failed to end interview."
    );
  },

async submitInterviewFeedback(
  sessionId: string,
  rating: number,
  feedback: string
) {
  const response = await fetch(
    `${DJANGO_API}/interviews/feedback/`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        session_id: sessionId,
        rating,
        feedback,
      }),
    }
  );

  return parseResponse(
    response,
    "Failed to save feedback."
  );
},

  // =====================================================
  // Interview APIs
  // =====================================================

  async startInterview(data: {
    company: string;
    role: string;
    difficulty: string;
    type: string;
    totalQuestions: number;
    cameraEnabled: boolean;
    preferredLanguages: string[];
    mode?: string;
  }): Promise<{ session: InterviewSession }> {

  // Step 1: Generate questions and create session
  const generateResponse = await fetch(
    `${DJANGO_API}/interviews/generate/`,
    {
      method: "POST",
      headers: getHeaders(),
      
      body: JSON.stringify({
        mode: data.mode,
        interview_type: data.type,
        difficulty: data.difficulty,
        total_questions: data.totalQuestions,
        company: data.company,
        role: data.role,
        preferred_languages:
          data.preferredLanguages,
        camera_enabled:
          data.cameraEnabled,
      }),
    }
  );

  const generated = await parseResponse<{
    session_id: number;
    questions: string[];
  }>(
    generateResponse,
    "Failed to generate interview."
  );

  // Convert Django response into frontend format
    const session: InterviewSession = {
      id: String(generated.session_id),
      userId: "",
      company: data.company as any,
      role: data.role as any,
      difficulty: data.difficulty as any,
      type: data.type as any,
      totalQuestions: generated.questions.length,
      currentQuestionIndex: 0,
      status: "in_progress",
      startTime: new Date().toISOString(),
      questions: generated.questions.map(
        (question, index) => ({
          id: `question-${index + 1}`,
          questionNumber: index + 1,
          category: data.type as any,
          question,
        })
      ),
    };

    return { session };
  },

  async getQuestion(
  sessionId: string,
  questionIndex: number
): Promise<{
  question: any;
  totalQuestions: number;
  savedAnswer: string;
  savedScore: number | null;
  savedFeedback: string;
  savedStrengths: string[];
  savedImprovements: string[];
}> {
  const response = await fetch(
    `${DJANGO_API}/interviews/start/`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        session_id: sessionId,
        question_number:
          questionIndex + 1,
      }),
    }
  );

  const data = await parseResponse<{
    session_id: number;
    current_question: string;
    question_number: number;
    total_questions: number;
    saved_answer: string;
    saved_score: number | null;
    saved_feedback: string;
    saved_strengths: string[];
    saved_improvements: string[];
  }>(
    response,
    "Failed to load interview question."
  );

  return {
    question: {
      id: `question-${data.question_number}`,
      questionNumber:
        data.question_number,
      category: "Technical",
      question:
        data.current_question,
    },

    totalQuestions:
      data.total_questions,

    savedAnswer:
      data.saved_answer || "",

    savedScore:
      data.saved_score ?? null,

    savedFeedback:
      data.saved_feedback || "",

    savedStrengths:
      data.saved_strengths || [],

    savedImprovements:
      data.saved_improvements || [],
  };
},

  async evaluateAnswer(data: {
    sessionId: string;
    questionId: string;
    userAnswer: string;
    timeSpentSeconds?: number;
    evaluate?: boolean;
  }): Promise<{
  evaluation: any;
  question: any;
  interviewCompleted: boolean;
}> {
  const questionNumber = Number(
    data.questionId.replace(
      "question-",
      ""
    )
  );

  const response = await fetch(
    `${DJANGO_API}/interviews/answer/`,
    {
      method: "POST",
      headers: getHeaders(),

      body: JSON.stringify({
        session_id:
          data.sessionId,
        question_number:
          questionNumber,
        answer:
          data.userAnswer,
        evaluate:
          data.evaluate ?? true,
        time_spent_seconds:
          data.timeSpentSeconds ?? 0,
      }),
    }
  );

  const result =
    await parseResponse<any>(
      response,
      "Failed to evaluate answer."
    );

  return {
    evaluation: {
      score: result.score ?? 0,
      accuracy: result.score ?? 0,
      clarity: result.score ?? 0,
      technicalDepth: result.score ?? 0,
      feedback: result.feedback || "",
      strengths: result.strengths || [],
      weaknesses: result.improvements || [],
    },

    question: result.next_question || null,

    interviewCompleted:
      result.interview_completed === true,
  };
},

  async finishInterview(
    sessionId: string
  ): Promise<{
    report: FinalReport;
  }> {
    const response = await fetch(
      `${DJANGO_API}/interviews/report/${sessionId}/`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse<{
      report: FinalReport;
    }>(
      response,
      "Failed to generate the final interview report."
    );
  },  

  // =====================================================
  // Reports
  // =====================================================

  async getReports(params?: {
    search?: string;
    company?: string;
    role?: string;
  }): Promise<{
    reports: FinalReport[];
  }> {
    const cleanParams = Object.fromEntries(
      Object.entries(params || {}).filter(
        ([, value]) => value !== undefined
      )
    );

    const query = new URLSearchParams(
      cleanParams as Record<string, string>
    ).toString();

    const response = await fetch(
      `${DJANGO_API}/reports/${
        query ? `?${query}` : ""
      }`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse<{
      reports: FinalReport[];
    }>(
      response,
      "Failed to fetch reports."
    );
  },

  async getReportDetail(
    id: string
  ): Promise<{
    report: FinalReport;
  }> {
    const response = await fetch(
      `${DJANGO_API}/interviews/report/${id}/`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse<{
      report: FinalReport;
    }>(
      response,
      "Failed to fetch report details."
    );
  },

  async deleteReport(
    id: string
  ): Promise<void> {
    const response = await fetch(
      `${DJANGO_API}/interviews/report/${id}/`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(
        "Failed to delete report."
      );
    }
  },

  // =====================================================
  // Resume Analyzer
  // =====================================================

  async uploadResumeFile(
    file: File
  ): Promise<{
    id: number;
    file: string;
    uploaded_at: string;
    extracted_text: string;
    skills: string;
    experience: string;
    education: string;
  }> {
    const token = getToken();

    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
      `${DJANGO_API}/resume/upload/`,
      {
        method: "POST",

        headers: {
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },

        body: formData,
      }
    );

    return parseResponse(
      response,
      "Failed to upload and extract resume."
    );
  },

  async analyzeResume(
    resumeText: string,
    targetRole: string
  ): Promise<{
    result: ResumeATSResult;
  }> {
    const response = await fetch(
      `${DJANGO_API}/resume/analyze/`,
      {
        method: "POST",
        headers: getHeaders(),

        body: JSON.stringify({
          resumeText,
          targetRole,
        }),
      }
    );

    return parseResponse(
      response,
      "Failed to analyze resume."
    );
  },

  async getJobRecommendations(
    targetRole: string = "Software Engineer",
    seed: string | number = Date.now()
  ): Promise<{
    recommendations: {
      title: string;
      category: string;
      reason: string;
      company?: string;
      deadline?: string;
    }[];
    total: number;
  }> {
    const params = new URLSearchParams({
      role: targetRole,
      seed: String(seed),
    });

    const response = await fetch(
      `${DJANGO_API}/resume/job-recommendations/?${params.toString()}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse(
      response,
      "Failed to load job recommendations."
    );
  },

  // =====================================================
  // Practice
  // =====================================================

  async getPracticeQuestions(): Promise<{
    questions: PracticeQuestion[];
  }> {
    const response = await fetch(
      `${DJANGO_API}/practice/questions/`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse(
      response,
      "Failed to fetch practice questions."
    );
  },

    async generatePracticeQuestions(
    language: string,
    type: string,
    difficulty: string
  ): Promise<{
    questions: PracticeQuestion[];
  }> {
    const response = await fetch(
      `${DJANGO_API}/practice/generate/`,
      {
        method: "POST",
        headers: getHeaders(),

        body: JSON.stringify({
          language,
          type,
          difficulty,
        }),
      }
    );

    return parseResponse(
      response,
      "Failed to generate practice questions."
    );
  },

  async evaluatePractice(data: {
    questionId: string;
    questionTitle: string;
    questionType: string;
    topicOrLanguage?: string;
    difficulty?: string;
    programmingLanguage?: string;
    userAnswer?: string;
    code?: string;
    questionData?: PracticeQuestion;
  }): Promise<{
    evaluation: any;
    attempt?: any;
  }> {
    const response = await fetch(
      `${DJANGO_API}/practice/evaluate/`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

    return parseResponse(
      response,
      "Failed to evaluate practice answer."
    );
  },

  async getPracticeAttempt(
      questionId: string
    ): Promise<{
      attempt: any | null;
    }> {
      const response = await fetch(
        `${DJANGO_API}/practice/attempt/${questionId}/`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

      return parseResponse(
        response,
        "Failed to load previous practice attempt."
      );
    },

    async getPracticeAttempts(): Promise<{
      attempts: {
      id: number;
      questionId: string;
      score: number;
      difficulty: string;
      questionType: string;
      topicOrLanguage: string;
    }[];
  }> {
  const response = await fetch(
    `${DJANGO_API}/practice/attempts/`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return parseResponse(
    response,
    "Failed to load solved practice questions."
  );
},

  async evaluateInterviewPractice(data: {
    topic: string;
    question: string;
    transcript: string;
    cameraUsed: boolean;

    cameraMetrics?: {
      faceDetected: boolean;
      facePresenceScore: number;
      headCentered: boolean;
      cameraAttentionScore: number;
      postureGood: boolean;
      postureScore: number;
    };
  }): Promise<{
    attempt: {
      id: number;
      topic: string;
      question: string;
      transcript: string;
      cameraUsed: boolean;
      overallScore: number;
      contentScore: number;
      structureScore: number;
      clarityScore: number;
      communicationScore: number;
      feedback: string;
      strengths: string[];
      improvements: string[];
      betterAnswer: string;
      createdAt: string;
    };
  }> {
    const response = await fetch(
      `${DJANGO_API}/practice/interview/evaluate/`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(data),
      }
    );

  return parseResponse(
    response,
    "Failed to evaluate interview practice."
  );
},

  // =====================================================
  // Dashboard
  // =====================================================

  async getDashboardStats(): Promise<{
    stats: DashboardStats;
  }> {
    const response = await fetch(
      `${DJANGO_API}/dashboard/stats/`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse(
      response,
      "Failed to fetch dashboard stats."
    );
  },

  // =====================================================
  // Leaderboard
  // =====================================================

  async getLeaderboard(): Promise<{
    leaderboard: LeaderboardEntry[];
    achievements: Achievement[];
  }> {
    const response = await fetch(
      `${DJANGO_API}/leaderboard/`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return parseResponse(
      response,
      "Failed to fetch leaderboard."
    );
  },
};