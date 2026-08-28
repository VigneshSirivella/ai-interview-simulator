import React, { useEffect, useState } from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  apiService,
  getApiError,
} from "../services/api";

import { QuestionItem } from "../types";

import { CameraPreview } from "../components/CameraPreview";
import { VoiceRecorder } from "../components/VoiceRecorder";
import { CodeEditor } from "../components/CodeEditor";
import { ScoreBadge } from "../components/ScoreBadge";

import {
  AlertCircle,
  Award,
  Camera,
  CameraOff,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Lightbulb,
  Maximize2,
  Minimize2,
  Send,
  Sparkles,
  Volume2,
} from "lucide-react";

interface SavedInterviewOptions {
  cameraEnabled?: boolean;
  preferredLanguages?: string[];
  totalQuestions?: number;
}

export const InterviewScreenPage: React.FC = () => {
  const { sessionId } =
    useParams<{ sessionId: string }>();

  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [currentQuestion, setCurrentQuestion] =
    useState<QuestionItem | null>(null);

  const [userAnswer, setUserAnswer] =
    useState("");

  const [codeAnswer, setCodeAnswer] =
    useState("");

  const [selectedOption, setSelectedOption] =
    useState("");

  const [isEvaluating, setIsEvaluating] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [
    isCurrentAnswerSaved,
    setIsCurrentAnswerSaved,
  ] = useState(false);

  const [draftAnswers, setDraftAnswers] =
    useState<Record<number, {
      userAnswer: string;
      codeAnswer: string;
      selectedOption: string;
    }>>({});

  const [sessionMode, setSessionMode] =
    useState<"one-on-one" | "language-qa">("one-on-one");

  const [
    answeredQuestionIndexes,
    setAnsweredQuestionIndexes,
  ] = useState<Set<number>>(new Set());

  const [
    isGeneratingQuestion,
    setIsGeneratingQuestion,
  ] = useState(true);

  const [isFinishing, setIsFinishing] =
    useState(false);

  const [evaluation, setEvaluation] =
    useState<any | null>(null);

  const [
    nextQuestionCountdown,
    setNextQuestionCountdown,
  ] = useState(10);

  const [showHint, setShowHint] =
    useState(false);

  // Time spent on current question
  const [secondsElapsed, setSecondsElapsed] =
    useState(0);

  // Whole interview timer
  const [
    interviewElapsed,
    setInterviewElapsed,
  ] = useState(0);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [speakingText, setSpeakingText] =
    useState(false);

  const [interviewerAvatar, setInterviewerAvatar] =
    useState<"aria" | "ren">("aria");

  const [cameraEnabled, setCameraEnabled] =
    useState(false);

  const [
    preferredLanguages,
    setPreferredLanguages,
  ] = useState<string[]>([]);

  const [totalQuestions, setTotalQuestions] =
    useState(5);

  const [error, setError] = useState("");

  // End interview dialog
  const [
    showEndDialog,
    setShowEndDialog,
  ] = useState(false);

  const [
    showUnansweredDialog,
    setShowUnansweredDialog,
  ] = useState(false);

  const [
    unansweredQuestions,
    setUnansweredQuestions,
  ] = useState<number[]>([]);

  const [
    pendingFinalAction,
    setPendingFinalAction,
  ] = useState<"submit" | "evaluate" | null>(null);

  const [endReason, setEndReason] =
    useState("");

  const [endNote, setEndNote] =
    useState("");

  const [isEndingEarly, setIsEndingEarly] =
    useState(false);

  const isMcqQuestion =
    currentQuestion?.questionType === "MCQ" ||
    Boolean(
      currentQuestion?.options &&
        currentQuestion.options.length > 0
    );

  const isProgrammingQuestion =
    currentQuestion?.questionType ===
      "Programming" ||
    Boolean(currentQuestion?.codeSnippet);

  const isLastQuestion =
    currentQuestionIndex >=
    totalQuestions - 1;

    /*
     * Interview duration:
     * 1-on-1 interview: 1 minute per question (1 min for 1 question, 5 min for 5 questions)
     * Technical interview: 2-3 minutes per question
     */
    const isOneOnOneMode = sessionMode === "one-on-one";

    const interviewMinutes = isOneOnOneMode
      ? Math.max(totalQuestions * 1, 1)
      : totalQuestions <= 3
      ? 7
      : totalQuestions <= 5
      ? 10
      : totalQuestions * 2;

    const totalInterviewSeconds =
      interviewMinutes * 60;

    const remainingSeconds = Math.max(
      totalInterviewSeconds -
        interviewElapsed,
      0
    );

  /*
   * Read setup options.
   */
  useEffect(() => {
    if (!sessionId) {
      return;
    }

    const savedOptions =
      sessionStorage.getItem(
        `interview-options-${sessionId}`
      );

    if (!savedOptions) {
      return;
    }

    try {
      const parsed: SavedInterviewOptions =
        JSON.parse(savedOptions);

      setCameraEnabled(
        Boolean(parsed.cameraEnabled)
      );

      setPreferredLanguages(
        Array.isArray(
          parsed.preferredLanguages
        )
          ? parsed.preferredLanguages
          : []
      );

      const savedTotal = Number(
        parsed.totalQuestions
      );

      if (
        Number.isFinite(savedTotal) &&
        savedTotal > 0
      ) {
        setTotalQuestions(savedTotal);
      }

      if (parsed.sessionMode) {
        setSessionMode(parsed.sessionMode as "one-on-one" | "language-qa");
      }
    } catch (storageError) {
      console.warn(
        "Unable to read interview options:",
        storageError
      );
    }
  }, [sessionId]);

  /*
   * Whole interview timer.
   */
   useEffect(() => {
    if (!sessionId) {
      return;
    }

    const timerKey =
      `interview-end-time-${sessionId}`;

    // Read the actual question count and session mode saved during setup.
    let effectiveTotalQuestions =
      totalQuestions;
    let effectiveSessionMode = sessionMode;

    const savedOptions =
      sessionStorage.getItem(
        `interview-options-${sessionId}`
      );

    if (savedOptions) {
      try {
        const parsed =
          JSON.parse(savedOptions);

        const savedTotal = Number(
          parsed.totalQuestions
        );

        if (
          Number.isFinite(savedTotal) &&
          savedTotal > 0
        ) {
          effectiveTotalQuestions =
            savedTotal;
        }

        if (parsed.sessionMode) {
          effectiveSessionMode = parsed.sessionMode;
        }
      } catch {
        // Use current totalQuestions
      }
    }

    const durationMinutes = effectiveSessionMode === "one-on-one"
      ? Math.max(effectiveTotalQuestions * 1, 1)
      : effectiveTotalQuestions <= 3
      ? 7
      : effectiveTotalQuestions <= 5
      ? 10
      : effectiveTotalQuestions * 2;

    const durationSeconds =
      durationMinutes * 60;

    let endTime = Number(
      localStorage.getItem(timerKey)
    );

    if (!endTime || (endTime - Date.now()) > durationSeconds * 1000) {
      endTime =
        Date.now() +
        durationSeconds * 1000;

      localStorage.setItem(
        timerKey,
        String(endTime)
      );
    }

    let expiryHandled = false;

    const updateTimer = async () => {
      if (
        isEvaluating ||
        isSubmitting
      ) {
        return;
      }
      const secondsLeft = Math.max(
        Math.ceil(
          (endTime - Date.now()) / 1000
        ),
        0
      );

      setInterviewElapsed(
        Math.max(
          durationSeconds -
            secondsLeft,
          0
        )
      );

      if (
        secondsLeft === 0 &&
        !expiryHandled
      ) {
        expiryHandled = true;

        try {
          const res = await apiService.endInterview(
            sessionId,
            "Time expired",
            "Interview automatically ended because the allotted time expired."
          );

          sessionStorage.removeItem(
            `interview-options-${sessionId}`
          );

          localStorage.removeItem(
            timerKey
          );

          if (answeredQuestionIndexes.size > 0 || res.has_answers) {
            navigate(`/result/${sessionId}`);
          } else {
            navigate("/dashboard");
          }
        } catch (requestError) {
          console.error(
            "Timer expiry error:",
            requestError
          );

          setError(
            getApiError(
              requestError,
              "Unable to end interview after time expired."
            )
          );

          expiryHandled = false;
        }
      }
    };

    updateTimer();

    const timer =
      window.setInterval(
        updateTimer,
        1000
      );

    return () => {
      window.clearInterval(timer);
    };
  }, [
    sessionId,
    totalQuestions,
    navigate,
    isEvaluating,
    isSubmitting,
  ]);

  /*
   * Time spent on current question.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsElapsed(
        (current) => current + 1
      );
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [currentQuestionIndex]);

  /*
   * Stop text-to-speech when leaving.
   */
  useEffect(() => {
    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /*
   * Load question.
   */
  useEffect(() => {
    if (!sessionId) {
      setError(
        "Interview session ID is missing."
      );

      setIsGeneratingQuestion(false);

      return;
    }

    const loadQuestion = async () => {
      setIsGeneratingQuestion(true);
      setError("");
      setEvaluation(null);
      setUserAnswer("");
      setCodeAnswer("");
      setSelectedOption("");
      setShowHint(false);

      // Reset only question timer
      setSecondsElapsed(0);

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        setSpeakingText(false);
      }

      try {
        const response =
          await apiService.getQuestion(
            sessionId,
            currentQuestionIndex
          );

        let finalQ = response.question;

        const savedOpt = sessionStorage.getItem(`interview-options-${sessionId}`);
        let activeMode = sessionMode;
        if (savedOpt) {
          try {
            const parsedOpt = JSON.parse(savedOpt);
            if (parsedOpt.sessionMode) activeMode = parsedOpt.sessionMode;
          } catch {}
        }

        if (activeMode === "one-on-one" || response.question?.category?.includes("1-on-1")) {
          let qText = response.question?.question || "";
          const lowerQ = qText.toLowerCase();
          const forbiddenTerms = [
            "foodz",
            "mysql",
            "python",
            "javascript",
            "schema",
            "checkout",
            "cart",
            "integration",
            "database",
            "transaction",
            "locking",
            "backend",
            "frontend",
            "api",
            "code",
          ];

          if (forbiddenTerms.some((term) => lowerQ.includes(term))) {
            const hrBank = [
              "Tell me about yourself.",
              "Why should we hire you for this job?",
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
            ];
            qText = hrBank[currentQuestionIndex % hrBank.length];
          }

          finalQ = {
            ...response.question,
            question: qText,
            codeSnippet: undefined,
            options: undefined,
            questionType: "Text",
          };
        }

        setCurrentQuestion(finalQ);

        const savedAnswer =
            response.savedAnswer || "";

        setIsCurrentAnswerSaved(
          Boolean(response.savedAnswer)
        );

        const currentDraft =
          draftAnswers[currentQuestionIndex];

        if (
          response.savedAnswer &&
          response.savedAnswer !== "[SKIPPED]"
        ) {
          setAnsweredQuestionIndexes(
            (current) => {
              const updated = new Set(current);
              updated.add(currentQuestionIndex);
              return updated;
            }
          );
        }

        if (!savedAnswer && currentDraft) {
          setUserAnswer(
            currentDraft.userAnswer || ""
          );

          setCodeAnswer(
            currentDraft.codeAnswer || ""
          );

          setSelectedOption(
            currentDraft.selectedOption || ""
          );
        } else if (savedAnswer === "[SKIPPED]") {
            setUserAnswer("");
            setSelectedOption("");
            setCodeAnswer("");
            setEvaluation(null);
          } else if (
            response.question?.questionType === "MCQ" ||
            (
              Array.isArray(
                response.question?.options
              ) &&
              response.question.options.length > 0
            )
          ) {
            setSelectedOption(savedAnswer);
          } else {
            const codeMarker =
              "\n\n[Code Solution]:\n";

            if (
              savedAnswer.includes(codeMarker)
            ) {
              const [
                textPart,
                codePart,
              ] = savedAnswer.split(
                codeMarker
              );

              setUserAnswer(
                textPart || ""
              );

              setCodeAnswer(
                codePart || ""
              );
            } else {
              setUserAnswer(savedAnswer);
            }
          }

        if (
          response.totalQuestions &&
          response.totalQuestions > 0
        ) {
          setTotalQuestions(
            response.totalQuestions
          );
        }

        if (
          response.question?.codeSnippet &&
          !response.savedAnswer
        ) {
          setCodeAnswer(
            response.question.codeSnippet
          );
        }
      } catch (requestError) {
      console.error(
        "Error loading question:",
        requestError
      );

      const errorMessage =
        getApiError(
          requestError,
          "Unable to load interview question."
        );

      if (
        errorMessage
          .toLowerCase()
          .includes("already finished")
      ) {
        sessionStorage.removeItem(
          `interview-options-${sessionId}`
        );

        localStorage.removeItem(
          `interview-end-time-${sessionId}`
        );

        navigate(
          "/dashboard",
          { replace: true }
        );

        return;
      }

      setCurrentQuestion(null);
      setError(errorMessage);
      } finally {
        setIsGeneratingQuestion(false);
      }
    };

    loadQuestion();
  }, [
    sessionId,
    currentQuestionIndex,
  ]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement
          .requestFullscreen();

        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();

        setIsFullscreen(false);
      }
    } catch (fullscreenError) {
      console.warn(
        "Fullscreen error:",
        fullscreenError
      );
    }
  };

  const handleSpeakQuestion = () => {
    if (!currentQuestion?.question) {
      return;
    }

    if (!("speechSynthesis" in window)) {
      setError(
        "Text-to-speech is not supported."
      );

      return;
    }

    if (speakingText) {
      window.speechSynthesis.cancel();
      setSpeakingText(false);
      return;
    }

    const utterance =
      new SpeechSynthesisUtterance(
        currentQuestion.question
      );

    utterance.rate = 0.95;

    utterance.onend = () => {
      setSpeakingText(false);
    };

    utterance.onerror = () => {
      setSpeakingText(false);
    };

    setSpeakingText(true);

    window.speechSynthesis.speak(
      utterance
    );
  };

  /* Auto-speak question when it loads or changes */
  useEffect(() => {
    if (currentQuestion?.question && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const timer = window.setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
        utterance.rate = 0.95;
        utterance.onend = () => setSpeakingText(false);
        utterance.onerror = () => setSpeakingText(false);
        setSpeakingText(true);
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          setSpeakingText(false);
        }
      }, 400);

      return () => {
        window.clearTimeout(timer);
        if ("speechSynthesis" in window) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, [currentQuestion?.id, currentQuestionIndex]);

  const getFinalAnswer = () => {
    if (isMcqQuestion) {
      return selectedOption.trim();
    }

    const textAnswer =
      userAnswer.trim();

    const code =
      codeAnswer.trim();

    if (code) {
      return [
        textAnswer,
        `[Code Solution]:\n${code}`,
      ]
        .filter(Boolean)
        .join("\n\n");
    }

    return textAnswer;
  };

  const getUnansweredQuestions = () => {
    const answered =
      new Set(answeredQuestionIndexes);

    if (getFinalAnswer()) {
      answered.add(currentQuestionIndex);
    }

    const unanswered: number[] = [];

    for (
      let index = 0;
      index < totalQuestions;
      index++
    ) {
      if (!answered.has(index)) {
        unanswered.push(index + 1);
      }
    }

    return unanswered;
  };


  const handleSubmitAnswer =
    async (skipUnansweredCheck = false) => {
      if (
        !sessionId ||
        !currentQuestion ||
        isSubmitting
      ) {
        return;
      }

      const finalAnswer =
        getFinalAnswer();

      if (!finalAnswer) {
        setError(
          isMcqQuestion
            ? "Select one option before submitting."
            : "Enter or speak your answer before submitting."
        );

        return;
      }

      if (isLastQuestion && !skipUnansweredCheck) {
        const unanswered =
          getUnansweredQuestions();

        if (unanswered.length > 0) {
          setUnansweredQuestions(unanswered);
          setPendingFinalAction("submit");
          setShowUnansweredDialog(true);
          return;
        }
      }

      setIsSubmitting(true);
      setError("");

      try {
        const response =
          await apiService.evaluateAnswer({
            sessionId,
            questionId:
              currentQuestion.id,
            userAnswer:
              finalAnswer,
            timeSpentSeconds:
              secondsElapsed,
            evaluate: false,
          });

        setIsCurrentAnswerSaved(true);

        setAnsweredQuestionIndexes(
          (current) => {
            const updated = new Set(current);
            updated.add(currentQuestionIndex);
            return updated;
          }
        );

        if (response.interviewCompleted) {
          sessionStorage.removeItem(
            `interview-options-${sessionId}`
          );

          localStorage.removeItem(
            `interview-end-time-${sessionId}`
          );

          navigate(`/result/${sessionId}`);
          return;
        }

        setEvaluation(null);
        setUserAnswer("");
        setCodeAnswer("");
        setSelectedOption("");
        setSecondsElapsed(0);

        setCurrentQuestionIndex(
          (current) => current + 1
        );
      } catch (requestError) {
        console.error(
          "Answer submission error:",
          requestError
        );

        setError(
          getApiError(
            requestError,
            "Unable to save your answer."
          )
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  const handleEvaluateAnswer =
    async (skipUnansweredCheck = false) => {
      if (
        !sessionId ||
        !currentQuestion ||
        isEvaluating
      ) {
        return;
      }

      const finalAnswer =
        getFinalAnswer();

      if (!finalAnswer) {
        setError(
          isMcqQuestion
            ? "Select one option before evaluating."
            : "Enter or speak your answer before evaluating."
        );

        return;
      }

     if (isLastQuestion && !skipUnansweredCheck) {
      const unanswered =
        getUnansweredQuestions();

      if (unanswered.length > 0) {
        setUnansweredQuestions(unanswered);
        setPendingFinalAction("evaluate");
        setShowUnansweredDialog(true);
        return;
      }
    }

      const evaluationPauseKey =
        `interview-evaluation-pause-${sessionId}`;

      localStorage.setItem(
        evaluationPauseKey,
        String(Date.now())
      );

      setIsEvaluating(true);
      setError("");

      try {
        const response =
          await apiService.evaluateAnswer({
            sessionId,
            questionId:
              currentQuestion.id,
            userAnswer:
              finalAnswer,
            timeSpentSeconds:
              secondsElapsed,
            evaluate: true,
          });

        setEvaluation(
          response.evaluation
        );

        setIsCurrentAnswerSaved(true);

        setAnsweredQuestionIndexes(
          (current) => {
            const updated = new Set(current);
            updated.add(currentQuestionIndex);
            return updated;
          }
        );

        setNextQuestionCountdown(10);

        if (response.interviewCompleted) {
          sessionStorage.removeItem(
            `interview-options-${sessionId}`
          );

          localStorage.removeItem(
            `interview-end-time-${sessionId}`
          );

          navigate(`/result/${sessionId}`);
          return;
        }
      } catch (requestError) {
        console.error(
          "Answer evaluation error:",
          requestError
        );

        setError(
          getApiError(
            requestError,
            "Unable to evaluate your answer."
          ) 
        );
      } finally {
        const evaluationPauseKey =
          `interview-evaluation-pause-${sessionId}`;

        const pauseStartedAt = Number(
          localStorage.getItem(
            evaluationPauseKey
          )
        );

        const timerKey =
          `interview-end-time-${sessionId}`;

        const currentEndTime = Number(
          localStorage.getItem(
            timerKey
          )
        );

        if (
          pauseStartedAt &&
          currentEndTime
        ) {
          const pausedMilliseconds =
            Date.now() -
            pauseStartedAt;

          localStorage.setItem(
            timerKey,
            String(
              currentEndTime +
                pausedMilliseconds
            )
          );
        }

        localStorage.removeItem(
          evaluationPauseKey
        );

        setIsEvaluating(false);
      }
    };

  const handleSkipQuestion = async () => {
    if (
      !sessionId ||
      !currentQuestion ||
      isEvaluating
    ) {
      return;
    }

    setIsEvaluating(true);
    setError("");

    try {
      const response =
        await apiService.evaluateAnswer({
          sessionId,
          questionId:
            currentQuestion.id,
          userAnswer: "[SKIPPED]",
          timeSpentSeconds:
            secondsElapsed,
        });

      if (response.interviewCompleted) {
        sessionStorage.removeItem(
          `interview-options-${sessionId}`
        );

        localStorage.removeItem(
          `interview-end-time-${sessionId}`
        );

        navigate(`/result/${sessionId}`);
        return;
      }

      setEvaluation(null);
      setUserAnswer("");
      setCodeAnswer("");
      setSelectedOption("");
      setSecondsElapsed(0);

      setCurrentQuestionIndex(
        (current) => current + 1
      );
    } catch (requestError) {
      console.error(
        "Skip question error:",
        requestError
      );

      setError(
        getApiError(
          requestError,
          "Unable to skip this question."
        )
      );
    } finally {
      setIsEvaluating(false);
    }
  };

  const saveCurrentDraft = () => {
    setDraftAnswers((current) => ({
      ...current,
      [currentQuestionIndex]: {
        userAnswer,
        codeAnswer,
        selectedOption,
      },
    }));
  };

  const handleNext = async () => {
    if (
      !sessionId ||
      !currentQuestion
    ) {
      return;
    }

    saveCurrentDraft();
    setError("");

    const finalAnswer =
      getFinalAnswer();

    if (!isLastQuestion) {
      setEvaluation(null);
      setUserAnswer("");
      setCodeAnswer("");
      setSelectedOption("");
      setSecondsElapsed(0);

      setCurrentQuestionIndex(
        (current) => current + 1
      );

      return;
    }

    handleFinishSession();
  };

  useEffect(() => {
    if (
      !evaluation ||
      isLastQuestion
    ) {
      return;
    }

    if (
      nextQuestionCountdown <= 0
    ) {
      handleNext();
      return;
    }

    const timer =
      window.setTimeout(() => {
        setNextQuestionCountdown(
          (current) => current - 1
        );
      }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    evaluation,
    nextQuestionCountdown,
    isLastQuestion,
  ]);

  const handlePrevious = () => {
    if (
      currentQuestionIndex === 0
    ) {
      return;
    }

    saveCurrentDraft();
    
    setError("");

    setCurrentQuestionIndex(
      (current) =>
        Math.max(
          0,
          current - 1
        )
    );
  };

  /*
   * Normal successful completion.
   */
  const handleFinishSession =
    async () => {
      if (
        !sessionId ||
        isFinishing
      ) {
        return;
      }

      setIsFinishing(true);
      setError("");

      if (
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }

      try {
        if (answeredQuestionIndexes.size === 0) {
          await apiService.endInterview(
            sessionId,
            "Finished without answers",
            "Session finished without submitting answers."
          );

          sessionStorage.removeItem(
            `interview-options-${sessionId}`
          );

          localStorage.removeItem(
            `interview-end-time-${sessionId}`
          );

          navigate("/dashboard");
          return;
        }

        const response =
          await apiService.finishInterview(
            sessionId
          );

        sessionStorage.removeItem(
          `interview-options-${sessionId}`
        );

        localStorage.removeItem(
          `interview-end-time-${sessionId}`
        );

        navigate(
          `/result/${response.report.id}`
        );

      } catch (requestError) {
        console.error(
          "Finish interview error:",
          requestError
        );

        setError(
          getApiError(
            requestError,
            "Unable to finish the interview."
          )
        );
      } finally {
        setIsFinishing(false);
      }
    };

  /*
   * End interview before completion.
   */
  const handleEndEarly =
    async () => {
      if (
        !sessionId ||
        !endReason ||
        isEndingEarly
      ) {
        return;
      }

      setIsEndingEarly(true);
      setError("");

      try {
        const res = await apiService.endInterview(
          sessionId,
          endReason,
          endNote
        );

        sessionStorage.removeItem(
          `interview-options-${sessionId}`
        );

        localStorage.removeItem(
          `interview-end-time-${sessionId}`
        );

        if (answeredQuestionIndexes.size > 0 || res.has_answers) {
          navigate(`/result/${sessionId}`);
        } else {
          navigate("/dashboard");
        }
      } catch (requestError) {
        setError(
          getApiError(
            requestError,
            "Unable to end interview."
          )
        );
      } finally {
        setIsEndingEarly(false);
      }
    };

  const formatTimer = (
    totalSeconds: number
  ) => {
    const minutes =
      Math.floor(
        totalSeconds / 60
      );

    const seconds =
      totalSeconds % 60;

    return `${minutes
      .toString()
      .padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const answerAvailable =
    isMcqQuestion
      ? Boolean(
          selectedOption.trim()
        )
      : Boolean(
          userAnswer.trim() ||
            codeAnswer.trim()
        );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#090714] via-[#0B0A1A] to-[#040309] text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Ambient Orbs */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="px-4 sm:px-6 md:px-8 py-3.5 border-b-2 border-indigo-500/30 bg-gradient-to-r from-slate-950/95 via-indigo-950/90 to-purple-950/95 backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-40 shadow-2xl">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 shrink-0">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>

          <div>
            <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2.5">
              <span>{sessionMode === "language-qa" ? "Language Q&A Challenge" : "1-on-1 AI Interview Session"}</span>

              <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-cyan-300 text-[10px] uppercase font-black tracking-widest border border-cyan-400/40 shadow-sm">
                {sessionMode === "language-qa" ? "Mode 2 • Technical Q&A" : "Mode 1 • Real Recruiter"}
              </span>
            </h2>

            <p className="text-xs font-bold text-indigo-300/80 mt-0.5">
              Question <span className="text-white font-black">{currentQuestionIndex + 1}</span> of <span className="text-white font-black">{totalQuestions}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* TIME REMAINING */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 text-xs text-amber-300 font-mono font-black shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
            <span>
              Time Left: <span className="text-amber-200">{formatTimer(remainingSeconds)}</span>
            </span>
          </div>

          {/* CAMERA TOGGLE */}
          <button
            type="button"
            onClick={() => setCameraEnabled((current) => !current)}
            className={`px-3.5 py-2 rounded-2xl border-2 text-xs font-black transition-all duration-300 flex items-center gap-2 cursor-pointer transform hover:scale-105 active:scale-95 ${
              cameraEnabled
                ? "bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
                : "bg-slate-900/90 border-indigo-500/40 text-slate-200 hover:border-emerald-400/80 hover:text-white shadow-md"
            }`}
          >
            {cameraEnabled ? (
              <>
                <CameraOff className="w-4 h-4 text-emerald-400" />
                Camera Off
              </>
            ) : (
              <>
                <Camera className="w-4 h-4 text-emerald-400" />
                Enable Camera
              </>
            )}
          </button>

          {/* FULLSCREEN */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2.5 rounded-2xl bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-400 text-indigo-300 hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-md cursor-pointer"
            title="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* END INTERVIEW */}
          <button
            type="button"
            onClick={() => setShowEndDialog(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white border border-rose-400/40 text-xs font-black transition-all shadow-[0_0_20px_rgba(244,63,94,0.35)] transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-slate-950 overflow-hidden relative">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 shadow-[0_0_15px_rgba(99,102,241,0.8)]"
          style={{
            width: `${((currentQuestionIndex + 1) / Math.max(totalQuestions, 1)) * 100}%`,
          }}
        />
      </div>

      {error && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
          <div className="p-4 rounded-2xl bg-rose-950/80 border-2 border-rose-500/50 text-rose-300 flex items-start gap-3 shadow-xl">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" />
            <p className="text-sm font-black">{error}</p>
          </div>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto p-4 sm:p-5 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 sm:gap-6 flex-1 relative z-10">
        {/* LEFT COLUMN */}
        <div className="md:col-span-1 lg:col-span-5 flex flex-col gap-5 sm:gap-6">
          <div className="transform transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01]">
            <CameraPreview enabled={cameraEnabled} />
          </div>

          {sessionMode === "language-qa" && preferredLanguages.length > 0 && (
            <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-purple-950/90 border-2 border-indigo-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-xl transform transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-indigo-400/80 hover:shadow-[0_20px_40px_rgba(99,102,241,0.3)]">
              <p className="text-xs font-black uppercase tracking-wider text-indigo-300 mb-2.5 flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                Preferred Languages
              </p>

              <div className="flex flex-wrap gap-2.5">
                {preferredLanguages.map((language, index) => (
                  <span
                    key={`${language}-${index}`}
                    className={`px-3.5 py-2 rounded-2xl border-2 text-xs font-black transition-all ${
                      index === 0
                        ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white border-cyan-300 shadow-md shadow-indigo-500/30"
                        : "bg-slate-900/80 border-slate-700 text-slate-200"
                    }`}
                  >
                    {index === 0 ? `${language} • Primary` : language}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 1-ON-1 INTERVIEW QUESTION STAGE */}
          <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-purple-950/90 border-2 border-indigo-500/40 rounded-3xl p-6 shadow-2xl backdrop-blur-xl flex flex-col gap-5 relative overflow-hidden group transform transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-indigo-400/80 hover:shadow-[0_25px_50px_rgba(99,102,241,0.35)]">
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/35 transition-all duration-500 pointer-events-none" />

            {/* AI Speech Bubble / Dialogue Question Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border-2 border-indigo-500/30 flex flex-col gap-4 relative z-10 shadow-inner">
              <div className="flex flex-row items-center justify-between gap-2 w-full">
                <span className="text-[11px] sm:text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5 whitespace-nowrap shrink-0 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 px-3 py-1.5 rounded-full border border-cyan-400/40 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span>Question #{currentQuestionIndex + 1} of {totalQuestions}</span>
                </span>

                <button
                  type="button"
                  onClick={handleSpeakQuestion}
                  disabled={isGeneratingQuestion || !currentQuestion}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black whitespace-nowrap shrink-0 transition-all duration-300 cursor-pointer transform hover:scale-105 active:scale-95 ${
                    speakingText
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md shadow-rose-500/40 border border-rose-300/40"
                      : "bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-md shadow-indigo-500/30 border border-cyan-300/30"
                  }`}
                  title="Voice synthesis out loud"
                >
                  <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{speakingText ? "Stop Voice" : "Ask Out Loud"}</span>
                </button>
              </div>

              {currentQuestion?.questionType && (
                <span className="self-start px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-xs font-black text-indigo-300 uppercase tracking-wider">
                  {currentQuestion.questionType} Challenge
                </span>
              )}

              {isGeneratingQuestion ? (
                <div className="py-8 flex flex-col items-center gap-3">
                  <span className="w-8 h-8 border-3 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-indigo-200 font-extrabold">
                    {interviewerAvatar === "aria" ? "Aria" : "Ren"} is preparing your next interview question...
                  </p>
                </div>
              ) : currentQuestion ? (
                <div className="relative pl-4 border-l-4 border-indigo-400 py-1 bg-indigo-950/40 rounded-r-2xl border border-indigo-500/20 p-4">
                  <p className="text-base sm:text-lg font-black leading-relaxed text-white">
                    “{currentQuestion.question}”
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 font-bold">
                  Question could not be loaded.
                </p>
              )}

              {currentQuestion?.idealKeyPoints && currentQuestion.idealKeyPoints.length > 0 && (
                <div className="pt-3 border-t border-indigo-500/20">
                  <button
                    type="button"
                    onClick={() => setShowHint((current) => !current)}
                    className="text-xs text-cyan-300 hover:text-white font-black flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    {showHint ? "Hide Evaluator Hint" : "Show Evaluator Hint"}
                  </button>

                  {showHint && (
                    <ul className="mt-3 text-xs text-indigo-100 font-semibold space-y-1.5 pl-4 list-disc bg-indigo-950/60 p-3 rounded-xl border border-indigo-500/30">
                      {currentQuestion.idealKeyPoints.map((point, index) => (
                        <li key={index}>{point}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="md:col-span-1 lg:col-span-7 flex flex-col gap-5 sm:gap-6">
          <div className="bg-gradient-to-br from-purple-950/90 via-slate-900/95 to-indigo-950/90 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-6 relative overflow-hidden group transform transition-all duration-500 hover:-translate-y-1.5 hover:scale-[1.01] hover:border-purple-400/80 hover:shadow-[0_25px_60px_rgba(168,85,247,0.35)]">
            {/* Glowing Background Orbs */}
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl group-hover:bg-fuchsia-500/30 transition-all duration-500 pointer-events-none" />

            <div className="flex items-center justify-between relative z-10 border-b border-purple-500/20 pb-4">
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Candidate Answer
              </h3>

              {!isMcqQuestion && (
                <VoiceRecorder
                  currentValue={userAnswer}
                  onTranscriptChange={setUserAnswer}
                />
              )}
            </div>

            {isMcqQuestion && currentQuestion?.options ? (
              <div className="space-y-3.5 relative z-10">
                {currentQuestion.options.map((option, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setSelectedOption(option)}
                    className={`w-full p-4 rounded-2xl border-2 text-left font-black transition-all duration-200 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.01] ${
                      selectedOption === option
                        ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white border-fuchsia-300 shadow-lg shadow-purple-500/40 ring-2 ring-fuchsia-400/50"
                        : "bg-slate-950/80 text-slate-200 border-purple-500/30 hover:border-purple-400/80 hover:bg-purple-950/40"
                    }`}
                  >
                    <span className="inline-block w-7 h-7 rounded-xl bg-purple-500/20 border border-purple-400/30 text-center leading-7 mr-3 text-fuchsia-300">
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <textarea
                rows={16}
                value={userAnswer}
                onChange={(event) => setUserAnswer(event.target.value)}
                disabled={Boolean(evaluation)}
                placeholder="Type or speak your answer here..."
                className="w-full p-4.5 rounded-2xl bg-slate-950/90 border-2 border-purple-500/30 focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/40 text-white placeholder:text-slate-500 outline-none min-h-[260px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] resize-y font-bold text-sm sm:text-base leading-relaxed relative z-10 transition-all shadow-inner"
              />
            )}

            {isProgrammingQuestion && currentQuestion?.codeSnippet && (
              <div className="relative z-10">
                <CodeEditor
                  initialCode={currentQuestion.codeSnippet}
                  onCodeChange={setCodeAnswer}
                />
              </div>
            )}

            <div className="flex flex-col gap-4 relative z-10 pt-2 border-t border-purple-500/20">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || isSubmitting || isEvaluating}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-black disabled:opacity-40 hover:bg-slate-800 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                >
                  <ChevronLeft className="inline w-4 h-4 mr-1 text-purple-400" />
                  Previous
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isLastQuestion || isSubmitting || isEvaluating}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-slate-900 border border-purple-500/40 text-white text-xs font-black disabled:opacity-40 hover:bg-purple-950/50 hover:border-purple-400 cursor-pointer transform hover:-translate-y-0.5 active:scale-95 transition-all shadow-md"
                >
                  Next Question
                  <ChevronRight className="inline w-4 h-4 ml-1 text-fuchsia-400" />
                </button>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:items-center">
                <button
                  type="button"
                  onClick={() => handleEvaluateAnswer()}
                  disabled={!answerAvailable || isSubmitting || isEvaluating || Boolean(evaluation)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-black disabled:opacity-40 shadow-lg shadow-emerald-500/30 border border-emerald-400/40 cursor-pointer transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all"
                >
                  {isEvaluating ? "Evaluating..." : "Evaluate Answer"}
                </button>

                <button
                  type="button"
                  onClick={() => handleSubmitAnswer()}
                  disabled={!answerAvailable || isSubmitting || isEvaluating || Boolean(evaluation)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 hover:from-indigo-500 hover:via-purple-500 hover:to-fuchsia-500 text-white text-sm font-black disabled:opacity-40 shadow-xl shadow-purple-500/40 border border-indigo-400/40 cursor-pointer transform hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all"
                >
                  <Send className="inline w-4 h-4 mr-2" />
                  {isSubmitting ? "Submitting..." : "Submit Answer"}
                </button>
              </div>
            </div>
          </div>

          {/* AI Evaluation Card */}
          {evaluation && (
            <div className="bg-gradient-to-br from-indigo-950/95 via-purple-950/95 to-slate-900/95 border-2 border-indigo-400/60 rounded-3xl p-6 sm:p-7 flex flex-col gap-5 shadow-2xl backdrop-blur-xl transform transition-all duration-300 hover:-translate-y-1">
              <div className="flex justify-between items-center border-b border-indigo-500/30 pb-3">
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 border border-indigo-400/50 flex items-center justify-center">
                    <Award className="w-5 h-5 text-cyan-300" />
                  </div>
                  <h4 className="font-black text-base text-white">
                    AI Evaluation & Feedback
                  </h4>
                </div>

                <ScoreBadge score={evaluation.score ?? 0} size="md" />
              </div>

              {evaluation.feedback && (
                <div className="p-4 bg-slate-950/90 rounded-2xl border border-indigo-500/30 text-slate-200 text-sm font-semibold leading-relaxed">
                  {evaluation.feedback}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                {!isLastQuestion && (
                  <p className="text-xs text-indigo-300 font-extrabold">
                    Moving to next question in{" "}
                    <span className="font-black text-cyan-300 bg-indigo-500/30 px-2 py-0.5 rounded-full border border-cyan-400/40">
                      {nextQuestionCountdown}s
                    </span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white font-black text-sm shadow-lg shadow-emerald-500/30 border border-emerald-300/40 cursor-pointer transform hover:scale-105 active:scale-95 transition-all"
                >
                  {isLastQuestion ? "Finish & View Detailed Report" : "Proceed to Next Question"}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* UNANSWERED QUESTIONS DIALOG */}
      {showUnansweredDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 border-2 border-amber-500/50 rounded-3xl p-7 shadow-2xl relative overflow-hidden group transform transition-all duration-300">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-black text-white relative z-10 flex items-center gap-2">
              Unanswered Questions
            </h3>

            <p className="text-xs font-semibold text-amber-200/90 mt-2 relative z-10">
              You have not answered{" "}
              <span className="text-white font-black">
                {unansweredQuestions.map((number) => `Question ${number}`).join(", ")}
              </span>.
            </p>

            <p className="text-xs font-medium text-slate-300 mt-2 relative z-10">
              Do you want to go back and answer them, or continue without answering?
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mt-6 relative z-10">
              <button
                type="button"
                onClick={() => {
                  setShowUnansweredDialog(false);
                  setPendingFinalAction(null);

                  setIsEvaluating(false);
                  setIsSubmitting(false);
                  setEvaluation(null);
                  setError("");

                  if (unansweredQuestions.length > 0) {
                    setCurrentQuestionIndex(unansweredQuestions[0] - 1);
                  }
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-white text-xs font-black transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                Go Back & Answer
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowUnansweredDialog(false);

                  if (pendingFinalAction === "submit") {
                    handleSubmitAnswer(true);
                  } else if (pendingFinalAction === "evaluate") {
                    handleEvaluateAnswer(true);
                  }

                  setPendingFinalAction(null);
                }}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-black shadow-lg shadow-amber-500/30 border border-amber-400/40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
              >
                Continue Without Answering
              </button>
            </div>
          </div>
        </div>
      )}

      {showEndDialog && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 border-2 border-rose-500/50 rounded-3xl p-7 shadow-2xl relative overflow-hidden group transform transition-all duration-300">
            {/* Background Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

            <h3 className="text-xl font-black text-white flex items-center gap-2 relative z-10">
              End Interview Early?
            </h3>

            <p className="text-xs font-semibold text-rose-200/80 mt-1.5 relative z-10">
              Please tell us why you want to end this session early.
            </p>

            <select
              value={endReason}
              onChange={(event) => setEndReason(event.target.value)}
              className="w-full mt-5 p-3.5 bg-slate-900/90 border-2 border-purple-500/30 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/40 rounded-2xl text-white text-xs font-bold outline-none cursor-pointer relative z-10"
            >
              <option value="" className="bg-slate-900 text-slate-400">
                Select reason for leaving
              </option>
              <option value="Just testing" className="bg-slate-900 text-white font-bold">
                Just testing the interview
              </option>
              <option value="Not interested" className="bg-slate-900 text-white font-bold">
                Not interested anymore
              </option>
              <option value="Technical issue" className="bg-slate-900 text-white font-bold">
                Technical issue
              </option>
              <option value="Need more preparation" className="bg-slate-900 text-white font-bold">
                Need more preparation
              </option>
              <option value="Other" className="bg-slate-900 text-white font-bold">
                Something else
              </option>
            </select>

            {endReason === "Other" && (
              <textarea
                value={endNote}
                onChange={(event) => setEndNote(event.target.value)}
                placeholder="Tell us the reason..."
                className="w-full mt-3.5 p-3.5 rounded-2xl bg-slate-900/90 border-2 border-purple-500/30 focus:border-rose-400 text-white text-xs font-semibold outline-none relative z-10"
              />
            )}

            <div className="flex gap-3 mt-6 relative z-10">
              <button
                type="button"
                onClick={() => setShowEndDialog(false)}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-black transition-all cursor-pointer transform hover:-translate-y-0.5"
              >
                Continue Interview
              </button>

              <button
                type="button"
                disabled={!endReason || isEndingEarly}
                onClick={handleEndEarly}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white text-xs font-black shadow-lg shadow-rose-500/30 border border-rose-400/40 disabled:opacity-40 transition-all cursor-pointer transform hover:-translate-y-0.5 active:scale-95"
              >
                {isEndingEarly ? "Ending..." : "End Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};