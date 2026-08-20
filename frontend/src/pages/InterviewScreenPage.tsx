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
    * 3 questions = 7 minutes
    * 4-5 questions = 10 minutes
    * 6-10 questions = 2 minutes per question
    */
    const interviewMinutes =
      totalQuestions <= 3
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

    // Read the actual question count saved during setup.
    let effectiveTotalQuestions =
      totalQuestions;

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
      } catch {
        // Use current totalQuestions
      }
    }

    const durationMinutes =
      effectiveTotalQuestions <= 3
        ? 7
        : effectiveTotalQuestions <= 5
        ? 10
        : effectiveTotalQuestions * 2;

    const durationSeconds =
      durationMinutes * 60;

    let endTime = Number(
      localStorage.getItem(timerKey)
    );

    if (!endTime) {
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
          await apiService.endInterview(
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

          navigate("/dashboard");
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

        setCurrentQuestion(
          response.question
        );

        const savedAnswer =
            response.savedAnswer || "";

        setIsCurrentAnswerSaved(
          Boolean(response.savedAnswer)
        );

          if (savedAnswer === "[SKIPPED]") {
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

  const handleSubmitAnswer =
    async () => {
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
    async () => {
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


  const handleNext = () => {
    if (
      answerAvailable &&
      !isCurrentAnswerSaved
    ) {
      setError(
        "You have an unsaved answer. Submit it before moving to the next question."
      );
      return;
    }

    if (
      !answerAvailable &&
      !isCurrentAnswerSaved
    ) {
      setError(
        "Submit an answer or use Skip before moving to the next question."
      );
      return;
    }

    setError("");

    if (!isLastQuestion) {
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

    if (
      answerAvailable &&
      !isCurrentAnswerSaved
    ) {
      setError(
        "You have an unsaved answer. Submit it before moving to the previous question."
      );
      return;
    }

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
        await apiService.endInterview(
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

        navigate("/dashboard");
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
    <div className="min-h-screen bg-[#0A0A0B] text-slate-100 flex flex-col font-sans">

      {/* Header */}
      <header className="px-3 sm:px-4 md:px-6 py-3 border-b border-slate-800 bg-[#0F0F12]/90 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-3 sticky top-0 z-30">

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>

          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              Mock Interview Session

              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] uppercase font-bold border border-indigo-500/30">
                Live
              </span>
            </h2>

            <p className="text-[11px] text-slate-400">
              Question{" "}
              {currentQuestionIndex + 1}{" "}
              of {totalQuestions}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">

          {/* TIME REMAINING */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-amber-400 font-mono font-bold">
            <Clock className="w-4 h-4" />

            <span>
              Time Left:{" "}
              {formatTimer(
                remainingSeconds
              )}
            </span>
          </div>

          {/* CAMERA TOGGLE */}
          <button
            type="button"
            onClick={() =>
              setCameraEnabled(
                (current) =>
                  !current
              )
            }
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition flex items-center gap-2 ${
              cameraEnabled
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                : "bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {cameraEnabled ? (
              <>
                <CameraOff className="w-4 h-4" />
                Camera Off
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Enable Camera
              </>
            )}
          </button>

          {/* FULLSCREEN */}
          <button
            type="button"
            onClick={
              toggleFullscreen
            }
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Toggle fullscreen"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>

          {/* END INTERVIEW */}
          <button
            type="button"
            onClick={() =>
              setShowEndDialog(true)
            }
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-bold transition"
          >
            End Interview
          </button>
        </div>
      </header>

      {/* Progress */}
      <div className="w-full h-1 bg-slate-800">
        <div
          className="h-full bg-indigo-600 transition-all duration-500"
          style={{
            width: `${
              ((currentQuestionIndex +
                1) /
                Math.max(
                  totalQuestions,
                  1
                )) *
              100
            }%`,
          }}
        />
      </div>

      {error && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5">
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <p className="text-sm font-semibold">
              {error}
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-5 lg:gap-6 flex-1">

        {/* LEFT */}
         <div className="md:col-span-1 lg:col-span-5 flex flex-col gap-4 sm:gap-6">

          <CameraPreview
            enabled={
              cameraEnabled
            }
          />

          {preferredLanguages.length >
            0 && (
            <div className="bg-[#15151A] border border-slate-800 rounded-2xl p-4">

              <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
                Preferred Languages
              </p>

              <div className="flex flex-wrap gap-2 mt-2">

                {preferredLanguages.map(
                  (
                    language,
                    index
                  ) => (
                    <span
                      key={`${language}-${index}`}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${
                        index === 0
                          ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                          : "bg-slate-800 border-slate-700 text-slate-300"
                      }`}
                    >
                      {index === 0
                        ? `${language} • Primary`
                        : language}
                    </span>
                  )
                )}

              </div>
            </div>
          )}

          {/* QUESTION */}
          <div className="bg-[#15151A] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">

            <div className="flex items-center justify-between gap-3">

              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />

                Question #
                {currentQuestionIndex + 1}
              </span>

              <button
                type="button"
                onClick={
                  handleSpeakQuestion
                }
                disabled={
                  isGeneratingQuestion ||
                  !currentQuestion
                }
                className={`p-2 rounded-xl ${
                  speakingText
                    ? "bg-indigo-600"
                    : "bg-slate-800"
                }`}
              >
                <Volume2 className="w-4 h-4" />
              </button>

            </div>

            {currentQuestion?.questionType && (
              <span className="self-start px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-[10px] font-bold uppercase">
                {currentQuestion.questionType}
              </span>
            )}

            {isGeneratingQuestion ? (
              <div className="py-10 flex flex-col items-center gap-3">

                <span className="w-7 h-7 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />

                <p className="text-xs text-slate-400">
                  AI is generating your question...
                </p>

              </div>
            ) : currentQuestion ? (

              <p className="text-sm sm:text-base font-semibold leading-relaxed">
                “
                {currentQuestion.question}
                ”
              </p>

            ) : (

              <p className="text-sm text-slate-400">
                Question could not be loaded.
              </p>

            )}

            {currentQuestion
              ?.idealKeyPoints &&
              currentQuestion
                .idealKeyPoints.length >
                0 && (

                <div className="pt-3 border-t border-slate-800">

                  <button
                    type="button"
                    onClick={() =>
                      setShowHint(
                        (current) =>
                          !current
                      )
                    }
                    className="text-xs text-indigo-400 flex items-center gap-1"
                  >
                    <Lightbulb className="w-4 h-4" />

                    {showHint
                      ? "Hide Hint"
                      : "Show Hint"}
                  </button>

                  {showHint && (
                    <ul className="mt-3 text-xs text-slate-400 list-disc list-inside">
                      {currentQuestion
                        .idealKeyPoints.map(
                          (
                            point,
                            index
                          ) => (
                            <li
                              key={index}
                            >
                              {point}
                            </li>
                          )
                        )}
                    </ul>
                  )}

                </div>
              )}

          </div>
        </div>

        {/* RIGHT */}
        <div className="md:col-span-1 lg:col-span-7 flex flex-col gap-4 sm:gap-6">

          <div className="bg-[#15151A] border border-slate-800 rounded-3xl p-6 flex flex-col gap-5">

            <div className="flex items-center justify-between">

              <h3 className="text-sm font-bold">
                Candidate Answer
              </h3>

              {!isMcqQuestion && (
                <VoiceRecorder
                  currentValue={
                    userAnswer
                  }
                  onTranscriptChange={
                    setUserAnswer
                  }
                />
              )}
            </div>

            {isMcqQuestion &&
            currentQuestion?.options ? (

              <div className="space-y-3">

                {currentQuestion.options.map(
                  (
                    option,
                    index
                  ) => (
                    <button
                      type="button"
                      key={index}
                      onClick={() =>
                        setSelectedOption(
                          option
                        )
                      }
                      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-left"
                    >
                      {String.fromCharCode(
                        65 + index
                      )}
                      . {option}
                    </button>
                  )
                )}

              </div>

            ) : (

              <textarea
                rows={16}
                value={userAnswer}
                onChange={(event) =>
                  setUserAnswer(
                    event.target.value
                  )
                }
                disabled={
                  Boolean(
                    evaluation
                  )
                }
                placeholder="Type or speak your answer here..."
                className="w-full p-3 sm:p-4 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder:text-slate-500 outline-none min-h-[260px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[420px] resize-y"
              />

            )}

            {isProgrammingQuestion &&
              currentQuestion?.codeSnippet && (

                <CodeEditor
                  initialCode={
                    currentQuestion.codeSnippet
                  }
                  onCodeChange={
                    setCodeAnswer
                  }
                />

              )}

              <div className="flex flex-col gap-3">

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={
                      currentQuestionIndex === 0 ||
                      isSubmitting ||
                      isEvaluating
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 disabled:opacity-40"
                  >
                    <ChevronLeft className="inline w-4 h-4 mr-1" />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={
                      isLastQuestion ||
                      isSubmitting ||
                      isEvaluating
                    }
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40"
                  >
                    Next Question
                    <ChevronRight className="inline w-4 h-4 ml-1" />
                  </button>

                </div>

                <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-3 sm:items-center">

                <button
                  type="button"
                  onClick={handleSkipQuestion}
                  disabled={
                    isSubmitting ||
                    isEvaluating ||
                    Boolean(evaluation)
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-amber-600 text-white text-sm font-semibold disabled:opacity-40"
                >
                  Skip
                </button>

                <button
                  type="button"
                  onClick={handleEvaluateAnswer}
                  disabled={
                    !answerAvailable ||
                    isSubmitting ||
                    isEvaluating ||
                    Boolean(evaluation)
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold disabled:opacity-40"
                >
                  {isEvaluating
                    ? "Evaluating..."
                    : "Evaluate Answer"}
                </button>

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={
                    !answerAvailable ||
                    isSubmitting ||
                    isEvaluating ||
                    Boolean(evaluation)
                  }
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-40"
                >
                  <Send className="inline w-4 h-4 mr-1.5" />

                  {isSubmitting
                    ? "Submitting..."
                    : "Submit Answer"}
                </button>

              </div>

            </div>
          </div>

          {/* Evaluation */}
          {evaluation && (

            <div className="bg-[#15151A] border border-indigo-500/40 rounded-3xl p-6 flex flex-col gap-4">

              <div className="flex justify-between">

                <div className="flex gap-2 items-center">
                  <Award className="w-5 h-5 text-indigo-400" />

                  <h4 className="font-bold">
                    AI Evaluation and Feedback
                  </h4>
                </div>

                <ScoreBadge
                  score={
                    evaluation.score ??
                    0
                  }
                  size="md"
                />

              </div>

              {evaluation.feedback && (
                <div className="p-4 bg-slate-950 rounded-xl">
                  {evaluation.feedback}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

                {!isLastQuestion && (
                  <p className="text-xs text-slate-400">
                    Moving to next question in{" "}
                    <span className="font-bold text-indigo-400">
                      {nextQuestionCountdown}s
                    </span>
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 rounded-xl bg-emerald-600"
                >
                  {isLastQuestion
                    ? "Finish and View Report"
                    : "Proceed to Next Question"}

                  <ChevronRight className="inline ml-2 w-4 h-4" />
                </button>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* END INTERVIEW DIALOG */}
      {showEndDialog && (

        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-[#15151A] border border-slate-700 rounded-3xl p-6 shadow-2xl">

            <h3 className="text-xl font-bold">
              End Interview?
            </h3>

            <p className="text-sm text-slate-400 mt-2">
              Tell us why you want to end this interview.
            </p>

            <select
              value={
                endReason
              }
              onChange={(event) =>
                setEndReason(
                  event.target.value
                )
              }
              className="w-full mt-5 p-3 bg-slate-900 border border-slate-700 rounded-xl"
            >
              <option value="">
                Select reason
              </option>

              <option value="Just testing">
                Just testing the interview
              </option>

              <option value="Not interested">
                Not interested anymore
              </option>

              <option value="Technical issue">
                Technical issue
              </option>

              <option value="Need more preparation">
                Need more preparation
              </option>

              <option value="Other">
                Something else
              </option>
            </select>

            {endReason === "Other" && (

              <textarea
                value={
                  endNote
                }
                onChange={(event) =>
                  setEndNote(
                    event.target.value
                  )
                }
                placeholder="Tell us the reason..."
                className="w-full mt-3 p-3 rounded-xl bg-slate-900 border border-slate-700"
              />

            )}

            <div className="flex gap-3 mt-6">

              <button
                type="button"
                onClick={() =>
                  setShowEndDialog(
                    false
                  )
                }
                className="flex-1 p-3 rounded-xl bg-slate-800"
              >
                Continue Interview
              </button>

              <button
                type="button"
                disabled={
                  !endReason ||
                  isEndingEarly
                }
                onClick={
                  handleEndEarly
                }
                className="flex-1 p-3 rounded-xl bg-rose-600 text-white disabled:opacity-40"
              >
                {isEndingEarly
                  ? "Ending..."
                  : "End Interview"}
              </button>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};