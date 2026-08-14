import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "../services/api";
import { PracticeQuestion } from "../types";
import { CodeEditor } from "../components/CodeEditor";
import { ScoreBadge } from "../components/ScoreBadge";
import { CameraPreview } from "../components/CameraPreview";
import { VoiceRecorder } from "../components/VoiceRecorder";

import {
  Sparkles,
  Code2,
  HelpCircle,
  Play,
  CheckCircle2,
  Award,
  Terminal,
  Send,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  FileCode2,
  ListCheck,
  Check,
  XCircle,
  Cpu,
  Layers,
  Wand2,
} from "lucide-react";

export const PracticePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const questionFromUrl = searchParams.get("question");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<string>("All");
  const [selectedLanguageFilter, setSelectedLanguageFilter] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("Medium");
  const [selectedQuestion, setSelectedQuestion] = useState<PracticeQuestion | null>(null);
  const [userCode, setUserCode] = useState("");
  const [userAnswerText, setUserAnswerText] = useState("");
  const [mcqChoice, setMcqChoice] = useState("");
  const [fillBlankInput, setFillBlankInput] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [revealedHintIndex, setRevealedHintIndex] = useState<number>(-1);

  const [solvedAttempts, setSolvedAttempts] = useState<Record<string, number>>({});
  const [practiceSection, setPracticeSection] = useState<"interview" | "coding">("coding");
  const [selectedPrepTopic, setSelectedPrepTopic] = useState<string | null>(null);

  const [prepPracticeStarted, setPrepPracticeStarted] = useState(false);
  const [prepCameraAllowed, setPrepCameraAllowed] = useState<boolean | null>(null);
  const [prepTranscript, setPrepTranscript] = useState("");
  const [prepReport, setPrepReport] = useState<any | null>(null);
  const [prepQuestion, setPrepQuestion] = useState("Tell me about yourself.");
  const [cameraMetrics, setCameraMetrics] = useState({
    faceDetected: false,
    facePresenceScore: 0,
    headCentered: false,
    cameraAttentionScore: 0,
    postureGood: false,
    postureScore: 0,
  });
    // =====================================================
  // AI Interview Practice Session
  // =====================================================

      const interviewQuestions = [
        "Tell me about yourself.",
        "Explain one of your important projects.",
        "What are your greatest strengths?",
        "Why should we hire you?",
        "Describe a challenge you faced and how you solved it.",
      ];

      const [currentQuestionIndex, setCurrentQuestionIndex] =
        useState(0);

      const [questionReports, setQuestionReports] =
        useState<any[]>([]);

      const [skippedQuestions, setSkippedQuestions] =
        useState<string[]>([]);

      const [questionSubmitted, setQuestionSubmitted] =
        useState(false);

      const [reportCountdown, setReportCountdown] =
        useState(10);

      const [interviewFinished, setInterviewFinished] =
        useState(false);

      const currentInterviewQuestion =
        interviewQuestions[currentQuestionIndex];

  const handlePrepCameraPermission = useCallback(
    (allowed: boolean) => {
      setPrepCameraAllowed(allowed);
    },
    []
  );

  const handleCameraAnalysis = useCallback(
    (metrics: {
      faceDetected: boolean;
      facePresenceScore: number;
      headCentered: boolean;
      cameraAttentionScore: number;
      postureGood: boolean;
      postureScore: number;
    }) => {
      setCameraMetrics(metrics);
    },
    []
  );

  const goToNextQuestion = () => {
      if (
        currentQuestionIndex >=
        interviewQuestions.length - 1
      ) {
        setInterviewFinished(true);
        setQuestionSubmitted(false);
        setPrepPracticeStarted(false);
        setPrepReport(null);
        return;
      }

      const nextIndex =
        currentQuestionIndex + 1;

      setCurrentQuestionIndex(nextIndex);

      setPrepQuestion(
        interviewQuestions[nextIndex]
      );

      setPrepTranscript("");
      setPrepReport(null);

      setCameraMetrics({
        faceDetected: false,
        facePresenceScore: 0,
        headCentered: false,
        cameraAttentionScore: 0,
        postureGood: false,
        postureScore: 0,
      });

      setQuestionSubmitted(false);
      setReportCountdown(10);
    };

    const skipCurrentQuestion = () => {
        setSkippedQuestions((previous) => {
          if (
            previous.includes(
              currentInterviewQuestion
            )
          ) {
            return previous;
          }

          return [
            ...previous,
            currentInterviewQuestion,
          ];
        });

        goToNextQuestion();
      };

    // Automatically speak the interview question
    useEffect(() => {
      if (
        !prepPracticeStarted ||
        interviewFinished ||
        questionSubmitted ||
        !currentInterviewQuestion
      ) {
        return;
      }

      if (!("speechSynthesis" in window)) {
        console.warn(
          "Speech synthesis is not supported."
        );
        return;
      }

      window.speechSynthesis.cancel();

      const utterance =
        new SpeechSynthesisUtterance(
          currentInterviewQuestion
        );

      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.volume = 1;

      const timer = window.setTimeout(() => {
        window.speechSynthesis.speak(
          utterance
        );
      }, 700);

      return () => {
        window.clearTimeout(timer);
        window.speechSynthesis.cancel();
      };
    }, [
      prepPracticeStarted,
      currentQuestionIndex,
      interviewFinished,
      questionSubmitted,
      currentInterviewQuestion,
    ]);

    useEffect(() => {
      if (
        !questionSubmitted ||
        interviewFinished
      ) {
        return;
      }

      if (reportCountdown <= 0) {
        goToNextQuestion();
        return;
      }

      const timer =
        window.setTimeout(() => {
          setReportCountdown(
            (current) => current - 1
          );
        }, 1000);

      return () => {
        window.clearTimeout(timer);
      };
    }, [
      questionSubmitted,
      reportCountdown,
      interviewFinished,
    ]);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res =
          await apiService.getPracticeQuestions();

        const attemptsResponse =
           await apiService.getPracticeAttempts();

        const solvedMap: Record<string, number> = {};

        attemptsResponse.attempts.forEach((attempt) => {
          solvedMap[attempt.questionId] = attempt.score;
        });

        setSolvedAttempts(solvedMap);

        setQuestions(res.questions);

        if (res.questions.length > 0) {
          let questionToOpen =
            res.questions[0];

          if (questionFromUrl) {
            const matchedQuestion =
              res.questions.find(
                (q) =>
                  q.id ===
                  questionFromUrl
              );
              
            if (matchedQuestion) {
              questionToOpen =
                matchedQuestion;
            }
          }
          await handleSelectQuestion(
            questionToOpen
          );
        }
      } catch (err) {
        console.error(
          "Error loading practice questions:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadQuestions();
  }, [questionFromUrl]);

    const handleSelectQuestion = async (
    q: PracticeQuestion
  ) => {
    setSelectedQuestion(q);
    setSelectedLanguage("javascript");
    setUserCode(q.initialCode || "");
    setUserAnswerText("");
    setMcqChoice("");
    setFillBlankInput("");
    setEvaluation(null);
    setRevealedHintIndex(-1);

    try {
      const res =
        await apiService.getPracticeAttempt(
          q.id
        );

      if (!res.attempt) {
        return;
      }

      const attempt = res.attempt;

      if (
        attempt.programmingLanguage
      ) {
        setSelectedLanguage(
          attempt.programmingLanguage
        );
      }

      if (q.type === "Coding") {
        setUserCode(
          attempt.code ||
            q.initialCode ||
            ""
        );
      } else if (q.type === "MCQ") {
        setMcqChoice(
          attempt.userAnswer || ""
        );
      } else if (
        q.type === "Fill in Blanks"
      ) {
        setFillBlankInput(
          attempt.userAnswer || ""
        );
      } else {
        setUserAnswerText(
          attempt.userAnswer || ""
        );
      }

      setEvaluation({
        score:
          attempt.score ?? 0,
        feedback:
          attempt.feedback || "",
        strengths:
          attempt.strengths || [],
        improvements:
          attempt.improvements || [],
        correctness:
          attempt.feedback || "",
      });
    } catch (err) {
      console.error(
        "Failed to load previous practice attempt:",
        err
      );
    }
  };

  const handleLanguageChange = (lang: string) => {
    setSelectedLanguage(lang);
    if (selectedQuestion?.languageTemplates && selectedQuestion.languageTemplates[lang]) {
      setUserCode(selectedQuestion.languageTemplates[lang]);
    }
  };

  const handleGenerateCustomQuestions = async () => {
    setGeneratingCustom(true);

    try {
      const typeToGen =
        activeTab === "All"
        ? "Technical"
        : activeTab;

      const res =
        await apiService.generatePracticeQuestions(
          selectedLanguageFilter,
          typeToGen,
          selectedDifficulty
    );

    if (
      res.questions &&
      res.questions.length > 0
    ) {
  setQuestions((previousQuestions) => {
    const remainingQuestions =
      previousQuestions.filter((q) => {
        const sameLanguage =
          q.topicOrLanguage?.toLowerCase() ===
          selectedLanguageFilter.toLowerCase();

        const sameDifficulty =
          q.difficulty?.toLowerCase() ===
          selectedDifficulty.toLowerCase();

        const sameType =
          activeTab === "All" ||
          q.type === typeToGen;

        return !(
          sameLanguage &&
          sameDifficulty &&
          sameType
        );
      });

    return [
      ...res.questions,
      ...remainingQuestions,
    ];
  });

  await handleSelectQuestion(
    res.questions[0]
  );
}
    } catch (err) {
      console.error("Failed to generate language practice questions:", err);
    } finally {
      setGeneratingCustom(false);
    }
  };

  const handleRunEvaluation = async () => {
    if (!selectedQuestion) return;
    setEvaluating(true);

    try {
      const finalAnswer =
        selectedQuestion.type === "MCQ"
          ? mcqChoice
          : selectedQuestion.type === "Fill in Blanks"
          ? fillBlankInput
          : userAnswerText;

      const res = await apiService.evaluatePractice({
          questionId: selectedQuestion.id,
          questionTitle: selectedQuestion.title,
          questionType: selectedQuestion.type,
          topicOrLanguage:
            selectedQuestion.topicOrLanguage || "",
          difficulty:
            selectedQuestion.difficulty || "",
          programmingLanguage:
            selectedLanguage,
          userAnswer: finalAnswer,
          code: userCode,
          questionData: selectedQuestion,
      });

      setEvaluation(res.evaluation);

      setSolvedAttempts((current) => ({
        ...current,
        [selectedQuestion.id]:
        res.evaluation.score ?? 0,
      }));

      } catch (err) {
        console.error("Practice evaluation error:", err);
      } finally {
        setEvaluating(false);
      }
    };

  const filteredQuestions = questions.filter((q) => {
  const matchesTab =
    activeTab === "All" ||
    q.type === activeTab;

  const matchesLang =
    selectedLanguageFilter === "All" ||
    !q.topicOrLanguage ||
    q.topicOrLanguage.toLowerCase() ===
      selectedLanguageFilter.toLowerCase();

  const matchesDifficulty =
    !q.difficulty ||
    q.difficulty.toLowerCase() ===
      selectedDifficulty.toLowerCase();

  return (
    matchesTab &&
    matchesLang &&
    matchesDifficulty
  );
});

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading LeetCode challenges & language practice engine...</p>
      </div>
    );
  }

  if (practiceSection === "interview") {
    const preparationTopics = [
     {
        id: "introduction",
        title: "Tell Me About Yourself",
        description:
          "Learn how to give a clear and confident self-introduction during an interview.",
        icon: <Sparkles className="w-6 h-6" />,
      },
      {
        id: "posture",
        title: "Sitting Posture",
        description:
          "Learn correct sitting position, body posture and professional interview appearance.",
        icon: <CheckCircle2 className="w-6 h-6" />,
      },
      {
        id: "eye-contact",
        title: "Eye Contact",
        description:
          "Understand how to maintain natural eye contact with an interviewer or camera.",
        icon: <Play className="w-6 h-6" />,
      },
      {
        id: "gestures",
        title: "Hand Gestures",
        description:
          "Learn how to use natural hand movements without looking distracted or nervous.",
        icon: <Layers className="w-6 h-6" />,
      },
      {
        id: "expression",
        title: "Facial Expression",
        description:
          "Practice maintaining a calm, interested and professional facial expression.",
        icon: <Award className="w-6 h-6" />,
      },
      {
        id: "project",
        title: "Explain Your Project",
        description:
          "Learn how to explain your project, technologies, contribution and challenges effectively.",
        icon: <Cpu className="w-6 h-6" />,
      },
      {
        id: "hr",
        title: "HR Questions",
        description:
          "Prepare for strengths, weaknesses, why should we hire you and career-goal questions.",
        icon: <HelpCircle className="w-6 h-6" />,
      },
      {
        id: "behavioral",
        title: "Behavioral Questions",
        description:
          "Learn the STAR method for teamwork, challenges, leadership and conflict questions.",
        icon: <ListCheck className="w-6 h-6" />,
      },
      {
        id: "communication",
        title: "Communication & Confidence",
        description:
          "Practice speaking answers while receiving communication and camera-based feedback.",
        icon: <Send className="w-6 h-6" />,
      },
    ];

    if (selectedPrepTopic === "learning") {
        const videoLessons = [
            {
              title: "Tell Me About Yourself",
              description:
                "Learn how to structure a confident and professional self-introduction.",
              video:
                "https://www.youtube.com/embed/Hh1iLbO1gtU",
            },
            {
              title: "Sitting Posture & Body Language",
              description:
                "Learn correct posture, professional body language and how to present yourself confidently.",
              video:
                "https://www.youtube.com/embed/BpP_tOZAPjg",
            },
            {
              title: "Eye Contact",
              description:
                "Learn how eye contact and body language affect interview communication.",
              video:
                "https://www.youtube.com/embed/BpP_tOZAPjg?start=121",
            },
            {
              title: "Hand Gestures & Body Language",
              description:
                "Learn how to use natural gestures and body language during professional conversations.",
              video:
                "https://www.youtube.com/embed/DnIEXEk-Xlg",
            },
            {
              title: "Explain Your Project",
              description:
                "Learn how to clearly explain your project, role, technologies, contribution and challenges.",
              video:
                "https://www.youtube.com/embed/lHFKehG5vZ0",
            },
            {
              title: "HR Questions",
              description:
                "Learn how to answer strengths, weaknesses, career goals and other common HR questions.",
              video:
                "https://www.youtube.com/embed/Hh1iLbO1gtU",
            },
            {
              title: "Behavioral Interview Preparation",
              description:
                "Learn how to structure examples and explain situations, actions and results clearly.",
              video:
                "https://www.youtube.com/embed/BpP_tOZAPjg",
            },
            {
              title: "Communication & Confidence",
              description:
                "Learn how to speak clearly, stay confident and communicate professionally.",
              video:
                "https://www.youtube.com/embed/s84C1GZVqUc",
            },
          ];

        return (
          <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">

            <button
              type="button"
              onClick={() =>
                setSelectedPrepTopic(null)
              }
              className="self-start text-sm font-bold text-indigo-600 dark:text-indigo-400"
            >
              ← Back to Interview Preparation
            </button>

            <div>
              <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-500">
                Interview Learning Center
              </p>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                Learn Through Videos
              </h1>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-3xl">
                Watch interview preparation lessons and understand how to answer,
                sit, communicate and present yourself professionally before starting
                AI interview practice.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {videoLessons.map(
                (lesson, index) => (
                  <div
                    key={index}
                    className="rounded-3xl overflow-hidden bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800"
                  >
                    <div className="aspect-video bg-black">
                      <iframe
                        className="w-full h-full"
                        src={lesson.video}
                        title={lesson.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>

                    <div className="p-5">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        {lesson.title}
                      </h3>

                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-6">
                        {lesson.description}
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>

          </div>
        );
      }

      if (selectedPrepTopic === "ai-practice") {

        const answeredCount = questionReports.length;

      const averageScore =
        answeredCount > 0
          ? Math.round(
              questionReports.reduce(
                (sum, report) =>
                  sum + (report.overallScore ?? 0),
                0
              ) / answeredCount
            )
          : 0;

      const averageContent =
        answeredCount > 0
          ? Math.round(
              questionReports.reduce(
                (sum, report) =>
                  sum + (report.contentScore ?? 0),
                0
              ) / answeredCount
            )
          : 0;

      const averageStructure =
        answeredCount > 0
          ? Math.round(
              questionReports.reduce(
                (sum, report) =>
                  sum + (report.structureScore ?? 0),
                0
              ) / answeredCount
            )
          : 0;

      const averageClarity =
        answeredCount > 0
          ? Math.round(
              questionReports.reduce(
                (sum, report) =>
                  sum + (report.clarityScore ?? 0),
                0
              ) / answeredCount
            )
          : 0;

      const averageCommunication =
        answeredCount > 0
          ? Math.round(
              questionReports.reduce(
                (sum, report) =>
                  sum + (report.communicationScore ?? 0),
                0
              ) / answeredCount
            )
          : 0;

        const cameraReports =
          questionReports.filter(
            (report) =>
              report.cameraUsed &&
              report.cameraMetrics
          );

        const averageFacePresence =
          cameraReports.length > 0
            ? Math.round(
                cameraReports.reduce(
                  (sum, report) =>
                    sum +
                    (report.cameraMetrics
                      ?.facePresenceScore ?? 0),
                  0
                ) / cameraReports.length
              )
            : 0;

        const averageCameraAttention =
          cameraReports.length > 0
            ? Math.round(
                cameraReports.reduce(
                  (sum, report) =>
                    sum +
                    (report.cameraMetrics
                      ?.cameraAttentionScore ?? 0),
                  0
                ) / cameraReports.length
              )
            : 0;

        const averagePostureScore =
          cameraReports.length > 0
            ? Math.round(
                cameraReports.reduce(
                  (sum, report) =>
                    sum +
                    (report.cameraMetrics
                      ?.postureScore ?? 0),
                  0
                ) / cameraReports.length
              )
            : 0;

        return (
          <div className="max-w-5xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">

            <button
              type="button"
              onClick={() =>
                setSelectedPrepTopic(null)
              }
              className="self-start text-sm font-bold text-indigo-600 dark:text-indigo-400"
            >
              ← Back to Interview Preparation
            </button>

            {prepPracticeStarted && (
                <div className="mt-8 p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">

                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Live Interview Practice
                    </h3>

                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Speak your answer naturally. Camera feedback will be used if permission is allowed.
                      If camera is denied, voice-only evaluation will continue.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-500">
                      Question {currentQuestionIndex + 1} of {interviewQuestions.length}
                    </p>

                    <h4 className="text-lg font-extrabold text-slate-900 dark:text-white mt-2">
                      {currentInterviewQuestion}
                    </h4>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if ("speechSynthesis" in window) {
                        window.speechSynthesis.cancel();

                        const utterance =
                          new SpeechSynthesisUtterance(
                            currentInterviewQuestion
                          );

                        utterance.rate = 0.95;
                        utterance.pitch = 1;

                        window.speechSynthesis.speak(
                          utterance
                        );
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                  >
                    🔊 Replay Question
                  </button>
                </div>

              </div>

                  {!questionSubmitted && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

                    <div>
                      <CameraPreview
                        enabled={true}
                        onPermissionChange={handlePrepCameraPermission}
                        onAnalysisUpdate={handleCameraAnalysis}
                      />

                      {prepCameraAllowed === false && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
                          Camera permission was not granted. You can continue with microphone-only practice.
                        </div>
                      )}
                    </div>

                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-4">

                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          Your Spoken Answer
                        </h4>

                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Click Speak Answer and answer: “Tell me about yourself.”
                        </p>
                      </div>

                      <VoiceRecorder
                        currentValue={prepTranscript}
                        onTranscriptChange={setPrepTranscript}
                      />

                      <textarea
                        value={prepTranscript}
                        onChange={(e) =>
                          setPrepTranscript(e.target.value)
                        }
                        rows={8}
                        placeholder="Your spoken answer will appear here..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 p-4 text-sm text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
                      />

                    <div className="flex flex-col sm:flex-row gap-3">

                  <button
                    type="button"
                    onClick={skipCurrentQuestion}
                    className="flex-1 px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-extrabold hover:bg-slate-300 dark:hover:bg-slate-700"
                  >
                    Skip Question
                  </button>

                  <button
                    type="button"
                    disabled={!prepTranscript.trim()}
                    onClick={async () => {
                      try {
                        const response =
                          await apiService.evaluateInterviewPractice({
                            topic: "Interview Practice",
                            question: currentInterviewQuestion,
                            transcript: prepTranscript,
                            cameraUsed:
                              prepCameraAllowed === true,
                            cameraMetrics:
                              prepCameraAllowed === true
                                ? cameraMetrics
                                : undefined,
                          });

                        const reportWithCamera = {
                          ...response.attempt,
                          cameraMetrics: {
                            faceDetected:
                              cameraMetrics.faceDetected,
                            facePresenceScore:
                              cameraMetrics.facePresenceScore,
                            headCentered:
                              cameraMetrics.headCentered,
                            cameraAttentionScore:
                              cameraMetrics.cameraAttentionScore,
                            postureGood:
                              cameraMetrics.postureGood,
                            postureScore:
                              cameraMetrics.postureScore,
                          },
                        };

                        setPrepReport(reportWithCamera);

                        setQuestionReports((previous) => [
                          ...previous,
                          reportWithCamera,
                        ]);

                        setQuestionSubmitted(true);
                        setReportCountdown(10);

                      } catch (error) {
                        console.error(
                          "Interview practice evaluation failed:",
                          error
                        );
                      }
                    }}
                    className="flex-1 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-extrabold disabled:opacity-50"
                  >
                    Submit Answer
                  </button>

                </div>
                      
                    </div>
                  </div>
                  )}
                </div>
              )}
              {prepReport && (
              <div className="mt-8 p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-wider text-emerald-500">
                      Interview Practice Report
                    </p>

                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                      {prepReport.question}
                    </h3>

                    <p className="text-xs text-slate-500 mt-1">
                      {prepReport.cameraUsed
                        ? "Camera + Voice Practice"
                        : "Voice Only Practice"}
                    </p>
                  </div>

                  <div className="w-20 h-20 rounded-full bg-indigo-500/10 border-4 border-indigo-500 flex flex-col items-center justify-center">
                    <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {Math.round(prepReport.overallScore ?? 0)}
                    </span>

                    <span className="text-[10px] font-bold text-slate-500">
                      /100
                    </span>
                  </div>
                </div>

                {questionSubmitted && (
                  <div className="mt-5 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        Next question in {reportCountdown} seconds
                      </p>

                      <p className="text-xs text-slate-500 mt-1">
                        You can continue immediately if you do not want to wait.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={goToNextQuestion}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
                    >
                      Next Question Now
                    </button>
                  </div>
                )}

                {/* Score Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6">

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Content
                    </p>
                    <p className="text-xl font-extrabold text-indigo-500 mt-1">
                      {Math.round(prepReport.contentScore ?? 0)}%
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Structure
                    </p>
                    <p className="text-xl font-extrabold text-purple-500 mt-1">
                      {Math.round(prepReport.structureScore ?? 0)}%
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Clarity
                    </p>
                    <p className="text-xl font-extrabold text-emerald-500 mt-1">
                      {Math.round(prepReport.clarityScore ?? 0)}%
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-bold uppercase text-slate-400">
                      Communication
                    </p>
                    <p className="text-xl font-extrabold text-amber-500 mt-1">
                      {Math.round(prepReport.communicationScore ?? 0)}%
                    </p>
                  </div>

                </div>

                {/* Camera Analysis */}
                {prepReport.cameraUsed && prepReport.cameraMetrics && (
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Face Presence
                      </p>

                      <p className="text-xl font-extrabold text-cyan-500 mt-1">
                        {Math.round(
                          prepReport.cameraMetrics.facePresenceScore ?? 0
                        )}%
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Camera Attention
                      </p>

                      <p className="text-xl font-extrabold text-blue-500 mt-1">
                        {Math.round(
                          prepReport.cameraMetrics.cameraAttentionScore ?? 0
                        )}%
                      </p>
                    </div>

                     <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] font-bold uppercase text-slate-400">
                        Posture
                      </p>

                      <p className="text-xl font-extrabold text-violet-500 mt-1">
                        {Math.round(
                          prepReport.cameraMetrics.postureScore ?? 0
                        )}%
                      </p>
                    </div>   

                  </div>
                )}

                {/* Your Answer */}
                <div className="mt-6">
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    Your Answer
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {prepReport.transcript}
                  </p>
                </div>

                {/* Feedback */}
                <div className="mt-6 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/20">
                  <h4 className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                    Feedback
                  </h4>

                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-6">
                    {prepReport.feedback}
                  </p>
                </div>

                {/* Strengths + Improvements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">

                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <h4 className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                      Strengths
                    </h4>

                    <ul className="mt-3 space-y-2">
                      {(prepReport.strengths || []).map(
                        (item: string, index: number) => (
                          <li
                            key={index}
                            className="text-xs text-slate-600 dark:text-slate-300"
                          >
                            ✓ {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <h4 className="text-sm font-extrabold text-amber-600 dark:text-amber-400">
                      Improvements
                    </h4>

                    <ul className="mt-3 space-y-2">
                      {(prepReport.improvements || []).map(
                        (item: string, index: number) => (
                          <li
                            key={index}
                            className="text-xs text-slate-600 dark:text-slate-300"
                          >
                            • {item}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                </div>

                {/* Better Answer */}
                {prepReport.betterAnswer && (
                  <div className="mt-6 p-5 rounded-2xl bg-purple-500/5 border border-purple-500/20">
                    <h4 className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                      Suggested Better Answer
                    </h4>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-7">
                      {prepReport.betterAnswer}
                    </p>
                  </div>
                )}

                {/* Practice Again */}
                <div className="mt-6 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setPrepReport(null);
                      setPrepTranscript("");
                      setPrepCameraAllowed(null);
                      setPrepPracticeStarted(true);
                    }}
                    className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold"
                  >
                    Practice Again
                  </button>
                </div>

              </div>
            )}

            {interviewFinished && (
              <div className="mt-8 p-7 rounded-3xl bg-white dark:bg-[#15151A] border border-indigo-500/30 shadow-lg">

                <div className="text-center">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-indigo-500">
                    Final Interview Report
                  </p>

                  <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
                    Interview Completed
                  </h2>

                  <div className="mt-5 inline-flex w-28 h-28 rounded-full border-4 border-indigo-500 bg-indigo-500/10 items-center justify-center flex-col">
                    <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {averageScore}
                    </span>
                    <span className="text-xs text-slate-500">
                      /100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-7">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-400">
                      Content
                    </p>
                    <p className="text-xl font-extrabold text-indigo-500">
                      {averageContent}%
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-400">
                      Structure
                    </p>
                    <p className="text-xl font-extrabold text-purple-500">
                      {averageStructure}%
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-400">
                      Clarity
                    </p>
                    <p className="text-xl font-extrabold text-emerald-500">
                      {averageClarity}%
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900">
                    <p className="text-xs text-slate-400">
                      Communication
                    </p>
                    <p className="text-xl font-extrabold text-amber-500">
                      {averageCommunication}%
                    </p>
                  </div>
                </div>

              {/* Camera Analysis Summary */}
                {cameraReports.length > 0 ? (
                  <div className="mt-6">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Camera Analysis
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                      <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20">
                        <p className="text-xs text-slate-400">
                          Average Face Presence
                        </p>

                        <p className="text-xl font-extrabold text-cyan-500 mt-1">
                          {averageFacePresence}%
                        </p>
                      </div>

                      <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20">
                        <p className="text-xs text-slate-400">
                          Average Camera Attention
                        </p>

                        <p className="text-xl font-extrabold text-blue-500 mt-1">
                          {averageCameraAttention}%
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-violet-500/5 border border-violet-500/20">
                      <p className="text-xs text-slate-400">
                        Average Posture
                      </p>

                      <p className="text-xl font-extrabold text-violet-500 mt-1">
                        {averagePostureScore}%
                      </p>
                    </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <p className="text-sm font-bold text-amber-500">
                      Camera Analysis Unavailable
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      This interview was completed without usable camera analysis.
                      Voice and answer evaluation were still included.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-7">
                  <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                    <h3 className="text-sm font-extrabold text-emerald-500">
                      Answered Questions
                    </h3>

                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                      {questionReports.length}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                    <h3 className="text-sm font-extrabold text-amber-500">
                      Skipped Questions
                    </h3>

                    <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
                      {skippedQuestions.length}
                    </p>
                  </div>
                </div>

                {questionReports.length > 0 && (
                    <div className="mt-7">
                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                        Review All Answers
                      </h3>

                      <p className="text-xs text-slate-500 mt-1">
                        Review your answers, scores and AI feedback for each interview question.
                      </p>

                      <div className="mt-4 space-y-4">
                        {questionReports.map((report, index) => (
                          <details
                            key={index}
                            className="rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden"
                          >
                            <summary className="p-4 cursor-pointer flex items-center justify-between gap-4">
                              <div>
                                <p className="text-xs font-bold text-indigo-500">
                                  Question {index + 1}
                                </p>

                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">
                                  {report.question}
                                </p>
                              </div>

                              <span className="text-lg font-extrabold text-indigo-500">
                                {Math.round(report.overallScore ?? 0)}%
                              </span>
                            </summary>

                            <div className="p-5 border-t border-slate-200 dark:border-slate-800">

                              <div>
                                <p className="text-xs font-extrabold text-slate-500 uppercase">
                                  Your Answer
                                </p>

                                <p className="text-sm text-slate-700 dark:text-slate-300 mt-2 leading-6">
                                  {report.transcript || "No answer recorded."}
                                </p>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
                                <div className="p-3 rounded-xl bg-indigo-500/10">
                                  <p className="text-xs text-slate-500">
                                    Content
                                  </p>

                                  <p className="font-extrabold text-indigo-500">
                                    {Math.round(report.contentScore ?? 0)}%
                                  </p>
                                </div>

                                <div className="p-3 rounded-xl bg-purple-500/10">
                                  <p className="text-xs text-slate-500">
                                    Structure
                                  </p>

                                  <p className="font-extrabold text-purple-500">
                                    {Math.round(report.structureScore ?? 0)}%
                                  </p>
                                </div>

                                <div className="p-3 rounded-xl bg-emerald-500/10">
                                  <p className="text-xs text-slate-500">
                                    Clarity
                                  </p>

                                  <p className="font-extrabold text-emerald-500">
                                    {Math.round(report.clarityScore ?? 0)}%
                                  </p>
                                </div>

                                <div className="p-3 rounded-xl bg-amber-500/10">
                                  <p className="text-xs text-slate-500">
                                    Communication
                                  </p>

                                  <p className="font-extrabold text-amber-500">
                                    {Math.round(report.communicationScore ?? 0)}%
                                  </p>
                                </div>
                              </div>

                              {report.feedback && (
                                <div className="mt-5">
                                  <p className="text-xs font-extrabold text-indigo-500 uppercase">
                                    AI Feedback
                                  </p>

                                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-6">
                                    {report.feedback}
                                  </p>
                                </div>
                              )}

                              {report.strengths?.length > 0 && (
                                <div className="mt-5">
                                  <p className="text-xs font-extrabold text-emerald-500 uppercase">
                                    Strengths
                                  </p>

                                  <ul className="mt-2 space-y-1">
                                    {report.strengths.map(
                                      (strength: string, i: number) => (
                                        <li
                                          key={i}
                                          className="text-sm text-slate-600 dark:text-slate-300"
                                        >
                                          ✓ {strength}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {report.improvements?.length > 0 && (
                                <div className="mt-5">
                                  <p className="text-xs font-extrabold text-amber-500 uppercase">
                                    Improvements
                                  </p>

                                  <ul className="mt-2 space-y-1">
                                    {report.improvements.map(
                                      (improvement: string, i: number) => (
                                        <li
                                          key={i}
                                          className="text-sm text-slate-600 dark:text-slate-300"
                                        >
                                          • {improvement}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                              {report.betterAnswer && (
                                <div className="mt-5 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                  <p className="text-xs font-extrabold text-purple-500 uppercase">
                                    Suggested Better Answer
                                  </p>

                                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-6">
                                    {report.betterAnswer}
                                  </p>
                                </div>
                              )}

                            </div>
                          </details>
                        ))}
                      </div>
                    </div>
                  )}

                {skippedQuestions.length > 0 && (
                  <div className="mt-7">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Skipped Questions
                    </h3>

                    <div className="mt-3 space-y-2">
                      {skippedQuestions.map(
                        (question, index) => (
                          <p
                            key={index}
                            className="text-sm text-slate-500"
                          >
                            • {question}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-8 flex justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuestionIndex(0);
                      setPrepQuestion(
                        interviewQuestions[0]
                      );
                      setPrepTranscript("");
                      setPrepReport(null);
                      setQuestionReports([]);
                      setSkippedQuestions([]);
                      setQuestionSubmitted(false);
                      setReportCountdown(10);
                      setInterviewFinished(false);
                      setPrepPracticeStarted(true);
                    }}
                    className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-extrabold"
                  >
                    Restart Interview
                  </button>
                </div>

              </div>
            )}
          </div>
        );
    }
  

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">

      {/* Practice Mode Selector */}
      <div className="flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() =>
              setPracticeSection("interview")
            }
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md"
          >
            Interview Preparation
          </button>

          <button
            type="button"
            onClick={() =>
              setPracticeSection("coding")
            }
            className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-bold"
          >
            Coding Practice
          </button>
        </div>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          AI Interview Training
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Interview Preparation
        </h1>

        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-3xl">
          Learn how to answer interview questions,
          maintain professional body language and
          improve your communication before starting
          a mock interview.
        </p>
      </div>

    {/* Main Interview Preparation Options */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

      {/* Learn Through Videos */}
      <button
        type="button"
        onClick={() =>
          setSelectedPrepTopic("learning")
        }
        className="text-left p-4 sm:p-5 lg:p-7 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:shadow-lg transition flex flex-col gap-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Play className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Learn Through Videos
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-6">
            Watch interview preparation lessons for self-introduction,
            sitting posture, eye contact, hand gestures, facial expression,
            project explanation, HR questions, behavioral questions and
            communication skills.
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-indigo-600 dark:text-indigo-400">
          <Play className="w-4 h-4" />
          Start Learning
        </div>
      </button>

      {/* AI Interview Practice */}
      <button
        type="button"
        onClick={() => {
          setSelectedPrepTopic("ai-practice");

          setPrepPracticeStarted(true);
          setPrepCameraAllowed(null);
          setPrepTranscript("");
          setPrepReport(null);

          setCurrentQuestionIndex(0);
          setPrepQuestion(interviewQuestions[0]);
          setQuestionReports([]);
          setSkippedQuestions([]);
          setQuestionSubmitted(false);
          setReportCountdown(10);
          setInterviewFinished(false);
        }}
        className="text-left p-4 sm:p-5 lg:p-7 rounded-3xl bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/30 hover:border-indigo-400 hover:shadow-lg transition flex flex-col gap-5"
      >
        <div className="w-14 h-14 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <Sparkles className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
            AI Interview Practice
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-6">
            Practice a realistic interview where the AI asks questions by voice.
            Answer using microphone or typing, skip questions when needed,
            receive instant feedback and get a final interview report.
          </p>
        </div>

        <div className="mt-auto flex items-center gap-2 text-sm font-bold text-purple-600 dark:text-purple-400">
          <Sparkles className="w-4 h-4" />
          Start AI Interview
        </div>
      </button>

      </div>

    </div>
  );
}

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">
      {/* Practice Mode Selector */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">

          <button
            type="button"
            onClick={() =>
            setPracticeSection("interview")
          }
          className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 text-sm font-bold"
      >
          Interview Preparation
          </button>

      <button
        type="button"
        onClick={() =>
          setPracticeSection("coding")
        }
        className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-bold shadow-md"
      >
        Coding Practice
      </button>

        </div>
      </div>

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
          <Terminal className="w-3.5 h-3.5" /> Practice Sandbox & LeetCode Library
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          LeetCode Algorithms, MCQs & Language Fill-in-the-Blanks
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Select your target language (Python, C, Java, C++, JS, SQL) for tailored Fill-in-the-Blanks and MCQs, or solve classic LeetCode coding problems with multi-language starter templates.
        </p>
      </div>

      {/* Main Category Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Coding", "Fill in Blanks", "MCQ", "Behavioral", "Technical"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeTab === tab
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Language / Topic Selection Prompt bar */}
      <div className="p-4 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Choose Language / Topic for Fill-in-Blanks & MCQs:
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Filter questions or generate new custom AI practice loops for your exact tech stack.
            </p>
          </div>
        </div>

          <div className="flex flex-col gap-3 w-full md:w-auto">

            {/* Language / Topic */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                "All",
                "Python",
                "C",
                "Java",
                "C++",
                "JavaScript",
                "SQL",
                "DSA",
              ].map((lang) => (
                <button
                  key={lang}
                  onClick={() =>
                    setSelectedLanguageFilter(lang)
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    selectedLanguageFilter === lang
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>

            {/* Difficulty */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                Difficulty:
              </span>

              {["Easy", "Medium", "Hard"].map(
                (level) => (
                                <button
                key={level}
                type="button"
                onClick={() =>
                  setSelectedDifficulty(level)
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedDifficulty === level
                    ? "bg-emerald-600 text-white"
                    : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {level}
              </button>
              )
              )}

                {(
                <button
                  type="button"
                  onClick={handleGenerateCustomQuestions}
                  disabled={generatingCustom}
                  className="px-3.5 py-1.5 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-1.5 transition disabled:opacity-50"
                >
                  {generatingCustom ? (
                    <>
                      <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      Generate {selectedDifficulty}{" "}
                      {selectedLanguageFilter === "All"
                        ? "Mixed AI"
                        : selectedLanguageFilter} Questions
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Practice Progress Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Question Bank
            </p>

            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {
                questions.filter((q) =>
                  selectedLanguageFilter === "All"
                    ? true
                    : q.topicOrLanguage?.toLowerCase() ===
                      selectedLanguageFilter.toLowerCase()
                ).length
              }
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {selectedLanguageFilter === "All"
                ? "Total available questions"
                : `${selectedLanguageFilter} questions`}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wider font-bold text-emerald-600">
              Solved
            </p>

            <p className="text-2xl font-black text-emerald-600 mt-1">
              {
                questions.filter((q) => {
                  const matchesLanguage =
                    selectedLanguageFilter === "All" ||
                    q.topicOrLanguage?.toLowerCase() ===
                      selectedLanguageFilter.toLowerCase();

                  return (
                    matchesLanguage &&
                    solvedAttempts[q.id] !== undefined
                  );
                }).length
              }
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Problems attempted
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase tracking-wider font-bold text-indigo-600">
              Current Difficulty
            </p>

            <p className="text-2xl font-black text-indigo-600 mt-1">
              {selectedDifficulty}
            </p>

            <p className="text-xs text-slate-500 mt-1">
              {filteredQuestions.length} questions available
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* Left Question List */}
        <div className="lg:col-span-5 flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1">
          {filteredQuestions.length === 0 ? (
            <div className="p-4 sm:p-6 lg:p-8 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 text-center flex flex-col items-center gap-3">
              <Cpu className="w-8 h-8 text-indigo-500" />
              <p className="text-xs text-slate-500 font-medium">
                No pre-loaded questions found for <span className="font-bold text-slate-900 dark:text-white">{selectedLanguageFilter}</span> under <span className="font-bold text-slate-900 dark:text-white">{activeTab}</span>.
              </p>
              <button
                onClick={handleGenerateCustomQuestions}
                disabled={generatingCustom}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition"
              >
                Generate {selectedLanguageFilter} Questions with Gemini AI
              </button>
            </div>
          ) : (
            filteredQuestions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`p-5 rounded-2xl text-left border transition flex flex-col gap-2 ${
                  selectedQuestion?.id === q.id
                    ? "bg-indigo-600/10 dark:bg-indigo-600/10 border-indigo-500/40 shadow-md"
                    : "bg-white dark:bg-[#15151A] border-slate-200 dark:border-slate-800 hover:border-indigo-400"
                }`}
              >
                   <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {q.type}
                      </span>

                      {q.topicOrLanguage && (
                        <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold border border-indigo-500/20">
                          {q.topicOrLanguage}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {solvedAttempts[q.id] !== undefined && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-extrabold">
                          ✓ Solved {Math.round(solvedAttempts[q.id])}%
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-bold ${
                          q.difficulty === "Easy"
                            ? "text-emerald-500"
                            : q.difficulty === "Medium"
                            ? "text-indigo-500"
                            : "text-rose-500"
                        }`}
                      >
                        {q.difficulty}
                      </span>
                    </div>
                  </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{q.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{q.question}</p>
              </button>
            ))
          )}
        </div>

        {/* Right Active Question Sandbox */}
        {selectedQuestion && (
          <div className="lg:col-span-7 bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl flex flex-col gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                  {selectedQuestion.type} • {selectedQuestion.difficulty}
                </span>
                {selectedQuestion.topicOrLanguage && (
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
                    Topic: {selectedQuestion.topicOrLanguage}
                  </span>
                )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mt-3">
                {selectedQuestion.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {selectedQuestion.question}
              </p>
            </div>

            {/* Step-by-Step Hints Drawer */}
            {selectedQuestion.hints && selectedQuestion.hints.length > 0 && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-amber-500" /> Need a hint?
                  </span>
                  {revealedHintIndex < selectedQuestion.hints.length - 1 && (
                    <button
                      type="button"
                      onClick={() => setRevealedHintIndex((prev) => prev + 1)}
                      className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 text-xs font-extrabold hover:bg-amber-400 transition"
                    >
                      Reveal {revealedHintIndex === -1 ? "Hint 1" : `Hint ${revealedHintIndex + 2}`}
                    </button>
                  )}
                </div>

                {revealedHintIndex >= 0 && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    {selectedQuestion.hints.slice(0, revealedHintIndex + 1).map((hint, i) => (
                      <p
                        key={i}
                        className="text-xs bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-xl border border-amber-500/20 text-slate-800 dark:text-slate-200 font-medium"
                      >
                        {hint}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* MCQ Options */}
            {selectedQuestion.type === "MCQ" && selectedQuestion.options && (
              <div className="flex flex-col gap-2">
                {selectedQuestion.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setMcqChoice(opt)}
                    className={`p-3.5 rounded-xl border text-xs font-medium text-left transition ${
                      mcqChoice === opt
                        ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-indigo-400"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}

            {/* Fill in the Blanks UI */}
            {selectedQuestion.type === "Fill in Blanks" && (
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 font-mono text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Fill in the Blank Snippet ({selectedQuestion.topicOrLanguage || "Language"})
                </span>
                <pre className="text-amber-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {selectedQuestion.fillBlankSnippet || "/* Fill in the missing syntax below */"}
                </pre>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-slate-400 font-bold">Answer:</span>
                  <input
                    type="text"
                    value={fillBlankInput}
                    onChange={(e) => setFillBlankInput(e.target.value)}
                    placeholder="Type missing keyword or value..."
                    className="flex-1 px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-bold text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Coding Editor with Language Preference */}
            {selectedQuestion.type === "Coding" && (
              <CodeEditor
                initialCode={userCode}
                onCodeChange={setUserCode}
                selectedLanguage={selectedLanguage}
                onLanguageChange={handleLanguageChange}
              />
            )}

            {/* Text Answer for Behavioral/Technical */}
            {(selectedQuestion.type === "Behavioral" || selectedQuestion.type === "Technical") && (
              <textarea
                rows={5}
                value={userAnswerText}
                onChange={(e) => setUserAnswerText(e.target.value)}
                placeholder="Write your STAR framing or technical explanation here..."
                className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed resize-none"
              />
            )}

            {/* Action button */}
            <button
              onClick={handleRunEvaluation}
              disabled={evaluating}
              className="py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {evaluating ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Evaluating Practice Answer via Gemini...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Practice Response</span>
                </>
              )}
            </button>

            {/* Evaluation Result Card */}
            {evaluation && (
              <div className="p-4 sm:p-5 lg:p-6 rounded-2xl bg-slate-900 text-white border border-indigo-500/40 flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <h4 className="text-sm font-bold">Practice Evaluation Feedback</h4>
                  </div>
                  <ScoreBadge score={evaluation.score} size="sm" />
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                  {evaluation.correctness}
                </p>

                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                      Strengths
                    </span>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                      {evaluation.strengths.map((s: string, i: number) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.improvements && evaluation.improvements.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                      Improvement Tips
                    </span>
                    <ul className="text-xs text-slate-300 list-disc list-inside space-y-1">
                      {evaluation.improvements.map((imp: string, i: number) => (
                        <li key={i}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
