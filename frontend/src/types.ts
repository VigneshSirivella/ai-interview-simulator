export type RoleType =
  | "Software Engineer"
  | "Frontend Engineer"
  | "Backend Engineer"
  | "Full Stack Developer"
  | "Data Scientist"
  | "DevOps Engineer"
  | "Product Manager"
  | "UI/UX Designer";

export type DifficultyLevel =
  | "Easy"
  | "Medium"
  | "Hard";

export type InterviewType =
  | "Technical"
  | "HR"
  | "Behavioral"
  | "Mixed";

export type CompanyName =
  | "Google"
  | "Microsoft"
  | "Amazon"
  | "Meta"
  | "Apple"
  | "Netflix"
  | "Uber"
  | "TCS"
  | "Infosys"
  | "Startup X";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profilePicture?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  bio?: string;
  targetRole?: string;
  targetCompany?: string;
  preferredLanguage?: string;
  token?: string;
}

export interface QuestionEvaluation {
  score: number;
  accuracy: number;
  clarity: number;
  technicalDepth: number;
  strengths: string[];
  weaknesses: string[];
  missingConcepts: string[];
  feedback: string;
  betterAnswerExample: string;
}

export interface QuestionItem {
  id: string;
  questionNumber: number;
  category: InterviewType;

  questionType?:
    | "HR"
    | "Behavioral"
    | "Technical"
    | "Programming"
    | "MCQ";

  question: string;
  hint?: string;
  idealKeyPoints?: string[];

  options?: string[];
  correctAnswer?: string;

  programmingLanguage?: string;
  codeSnippet?: string;

  userAnswer?: string;
  evaluation?: QuestionEvaluation;
  timeSpentSeconds?: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  company: CompanyName;
  role: RoleType;
  difficulty: DifficultyLevel;
  type: InterviewType;
  totalQuestions: number;
  currentQuestionIndex: number;

  cameraEnabled?: boolean;
  preferredLanguages?: string[];

  status:
    | "setup"
    | "in_progress"
    | "completed";

  startTime: string;
  endTime?: string;
  questions: QuestionItem[];
  reportId?: string;
}

export interface RadarMetrics {
  technical: number;
  communication: number;
  problemSolving: number;
  confidence: number;
  systemDesignCulture: number;
}

export interface FinalReport {
  id: string;
  interviewId: string;
  userId: string;
  candidateName: string;
  candidateEmail: string;
  company: CompanyName;
  role: RoleType;
  difficulty: DifficultyLevel;
  type: InterviewType;
  date: string;
  overallScore: number;
  radarMetrics: RadarMetrics;
  topStrengths: string[];
  keyWeaknesses: string[];
  actionableSuggestions: string[];
  finalAiRemark: string;
  questions: QuestionItem[];
}

export interface ResumeATSResult {
  atsScore: number;
  extractedName?: string;
  extractedEmail?: string;
  extractedSkills: string[];
  missingSkills: string[];
  formattingScore: number;
  keywordDensityScore: number;
  bulletPointFeedback: string[];
  actionableTips: string[];
  suggestedRoles: string[];
  parsedSummary?: string;
  candidateExperience?: string;
  recommendedPrepTopics?: string[];
}

export interface PracticeQuestion {
  id: string;
  title: string;

  type:
    | "Coding"
    | "MCQ"
    | "Fill in Blanks"
    | "Behavioral"
    | "Technical";

  topicOrLanguage?: string;
  difficulty: DifficultyLevel;
  role: RoleType;
  question: string;
  options?: string[];
  correctAnswer?: string;
  initialCode?: string;
  expectedOutput?: string;
  explanation?: string;
  hints?: string[];
  fillBlankSnippet?: string;
  fillBlankAnswer?: string;

  languageTemplates?: Record<
    string,
    string
  >;
}

export interface InterviewHistoryItem {
  id: number;
  interviewNumber: number;
  company: string;
  role: string;
  interviewType: string;
  difficulty: string;

  score: number;
  technicalScore: number;
  communicationScore: number;

  strengths: string[];
  weaknesses: string[];
  improvements: string[];

  feedback: string;

  cameraEnabled: boolean;
  cameraFeedback: {
    available?: boolean;
    eye_contact?: number;
    posture?: number;
    engagement?: number;
    confidence?: number;
    summary?: string;
  };

  createdAt: string;
  endedAt?: string | null;
}

export interface PracticeAttemptSummary {
  id: number;
  questionId: string;
  questionTitle: string;
  questionType: string;
  topicOrLanguage: string;
  difficulty: string;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  programmingLanguage: string;
  updatedAt: string;
}

export interface PracticeStats {
  totalSolved: number;
  averageScore: number;

  easy: {
    count: number;
    averageScore: number;
  };

  medium: {
    count: number;
    averageScore: number;
  };

  hard: {
    count: number;
    averageScore: number;
  };

  recentAttempts: PracticeAttemptSummary[];
}

export interface DashboardStats {
  totalInterviews: number;
  averageScore: number;
  strongTopics: string[];
  weakTopics: string[];
  overallAccuracy: number;
  completionRate: number;

  weeklyProgress: {
    day: string;
    score: number;
    count: number;
  }[];

  monthlyProgress: {
    month: string;
    avgScore: number;
  }[];

  recentReports: FinalReport[];
  interviewHistory: InterviewHistoryItem[];
  practiceStats: PracticeStats;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  totalInterviews: number;
  averageScore: number;
  targetRole: string;
  topSkills: string[];
  badge: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
}