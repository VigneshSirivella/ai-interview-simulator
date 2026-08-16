import React, {
  useEffect,
  useState,
} from "react";

import {
  useParams,
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import confetti from "canvas-confetti";

import { apiService } from "../services/api";

import {
  generateCandidatePDFReport,
} from "../services/pdfService";

import { FinalReport } from "../types";

import { ScoreBadge } from "../components/ScoreBadge";

import {
  RadarChartComponent,
} from "../components/RadarChartComponent";

import {
  Download,
  LayoutDashboard,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Building2,
  Briefcase,
  Calendar,
  Star,
  MessageSquare,
} from "lucide-react";


export const ResultPage: React.FC = () => {
  const navigate = useNavigate();

  const { user } = useAuth();

  const { reportId } =
    useParams<{ reportId: string }>();

  const [report, setReport] =
    useState<FinalReport | null>(null);

  const [loading, setLoading] =
    useState(true);

  // Feedback
  const [rating, setRating] =
    useState(0);

  const [
    feedbackText,
    setFeedbackText,
  ] = useState("");

  const [
    submittingFeedback,
    setSubmittingFeedback,
  ] = useState(false);

  const [
    feedbackSubmitted,
    setFeedbackSubmitted,
  ] = useState(false);

  const [
    feedbackError,
    setFeedbackError,
  ] = useState("");

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: {
        y: 0.6,
      },
    });

    async function loadReport() {
      if (!reportId) {
        setLoading(false);
        return;
      }

      try {
        const res =
          await apiService.getReportDetail(
            reportId
          );

        setReport(res.report);
      } catch (err) {
        console.error(
          "Failed to load report:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadReport();
  }, [reportId]);

  const handleDownloadPDF = () => {
  if (!report) {
    return;
  }

  const candidateName =
    user?.name?.trim();

  if (!candidateName) {
    alert(
      "Please set your name in the Profile section before downloading the PDF report."
    );

    navigate("/profile");
    return;
  }

  const reportWithCandidateDetails = {
    ...report,

    candidateName: candidateName,

    candidateEmail:
      user?.email?.trim() ||
      report.candidateEmail ||
      "Not available",
  };

  generateCandidatePDFReport(
    reportWithCandidateDetails
  );
};

  const handleSubmitFeedback =
    async () => {
      if (!report || rating === 0) {
        setFeedbackError(
          "Please select a rating before submitting."
        );
        return;
      }

      /*
       * Django feedback API expects
       * the InterviewSession ID.
       *
       * Prefer report.interviewId.
       * reportId is used only as fallback.
       */
      const sessionId =
        report.interviewId ||
        reportId;

      if (!sessionId) {
        setFeedbackError(
          "Interview session ID is missing."
        );
        return;
      }

      setSubmittingFeedback(true);
      setFeedbackError("");

      try {
        await apiService
          .submitInterviewFeedback(
            String(sessionId),
            rating,
            feedbackText.trim()
          );

        setFeedbackSubmitted(true);

        confetti({
          particleCount: 60,
          spread: 55,
          origin: {
            y: 0.8,
          },
        });
      } catch (error) {
        console.error(
          "Feedback submission failed:",
          error
        );

        setFeedbackError(
          "Unable to save feedback. Please try again."
        );
      } finally {
        setSubmittingFeedback(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

        <p className="text-xs text-slate-500 font-medium">
          Generating interview performance
          analysis...
        </p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 text-center">
        <AlertCircle className="w-10 h-10 text-rose-500" />

        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Report could not be loaded
        </h2>

        <Link
          to="/dashboard"
          className="px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">

      {/* HEADER */}
      <div className="rounded-3xl bg-[#15151A] border border-slate-800 text-white p-8 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle2 className="w-4 h-4" />

            Assessment Finalized
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Interview Performance Report
          </h1>

          <p className="text-xs sm:text-sm text-slate-400 mt-2 flex flex-wrap items-center gap-3">

            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />

              {report.company}
            </span>

            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400" />

              {report.role}
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />

              {report.date
                ? new Date(
                    report.date
                  ).toLocaleDateString()
                : "Completed"}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">

          <button
            type="button"
            onClick={
              handleDownloadPDF
            }
            className="px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-500/20 transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />

            <span>
              Download PDF Report
            </span>
          </button>

          <Link
            to="/dashboard"
            className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm transition flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />

            <span>
              Dashboard
            </span>
          </Link>
        </div>
      </div>

      {/* SCORE + RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        <div className="lg:col-span-5 bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col items-center text-center justify-center gap-6">

          <div className="w-32 h-32 rounded-full border-8 border-indigo-600 flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-950/40 shadow-inner">

            <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
              {report.overallScore}%
            </span>

            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Overall Rating
            </span>
          </div>

          <div>
            <ScoreBadge
              score={
                report.overallScore
              }
              size="lg"
            />

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              Performance for{" "}
              {report.role} at{" "}
              {report.company} (
              {report.difficulty}).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 text-left italic leading-relaxed">

            <span className="font-bold text-indigo-600 dark:text-indigo-400 not-italic block mb-1">
              Executive AI Remark:
            </span>

            "
            {report.finalAiRemark ||
              "Interview evaluation completed."}
            "
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col gap-4">

          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" />

            Competency Analysis
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluation across technical
            knowledge, communication,
            problem solving and confidence.
          </p>

          <RadarChartComponent
            metrics={
              report.radarMetrics
            }
          />
        </div>
      </div>

      {/* STRENGTHS / WEAKNESSES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Strengths */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">

          <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2 uppercase tracking-wider">

            <CheckCircle2 className="w-4 h-4" />

            Top Strengths
          </h3>

          <ul className="flex flex-col gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">

            {(report.topStrengths || [])
              .map((strength, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2"
                >
                  <span className="text-emerald-500 font-bold">
                    •
                  </span>

                  <span>
                    {strength}
                  </span>
                </li>
              ))}

            {(
              report.topStrengths ||
              []
            ).length === 0 && (
              <li className="text-slate-500">
                No strengths recorded.
              </li>
            )}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">

          <h3 className="text-sm font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2 uppercase tracking-wider">

            <AlertCircle className="w-4 h-4" />

            Areas to Improve
          </h3>

          <ul className="flex flex-col gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">

            {(report.keyWeaknesses || [])
              .map(
                (
                  weakness,
                  index
                ) => (
                  <li
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <span className="text-rose-500 font-bold">
                      •
                    </span>

                    <span>
                      {weakness}
                    </span>
                  </li>
                )
              )}

            {(
              report.keyWeaknesses ||
              []
            ).length === 0 && (
              <li className="text-slate-500">
                No major weaknesses
                recorded.
              </li>
            )}
          </ul>
        </div>

        {/* Tips */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">

          <h3 className="text-sm font-bold text-amber-600 dark:text-amber-400 flex items-center gap-2 uppercase tracking-wider">

            <Lightbulb className="w-4 h-4" />

            Actionable Tips
          </h3>

          <ul className="flex flex-col gap-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">

            {(
              report.actionableSuggestions ||
              []
            ).map(
              (
                tip,
                index
              ) => (
                <li
                  key={index}
                  className="flex items-start gap-2"
                >
                  <span className="text-amber-500 font-bold">
                    •
                  </span>

                  <span>
                    {tip}
                  </span>
                </li>
              )
            )}

            {(
              report.actionableSuggestions ||
              []
            ).length === 0 && (
              <li className="text-slate-500">
                Continue practicing.
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* QUESTION BREAKDOWN */}
      <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col gap-6">

        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
          Detailed Question Breakdown (
          {report.questions?.length ||
            0}{" "}
          Questions)
        </h3>

        <div className="flex flex-col gap-6">

          {(report.questions || [])
            .map(
              (
                question,
                index
              ) => (
                <div
                  key={
                    question.id ||
                    index
                  }
                  className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-3"
                >

                  <div className="flex items-center justify-between gap-3">

                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      Question #
                      {index + 1} (
                      {question.category})
                    </span>

                    {question.evaluation && (
                      <ScoreBadge
                        score={
                          question
                            .evaluation
                            .score
                        }
                        size="sm"
                      />
                    )}
                  </div>

                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    "
                    {
                      question.question
                    }
                    "
                  </p>

                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">

                    <span className="font-bold text-slate-400 block mb-1">
                      Your Answer:
                    </span>

                    {question.userAnswer ||
                      "No answer provided"}
                  </div>

                  {question.evaluation && (
                    <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed">

                      <span className="font-bold text-indigo-600 dark:text-indigo-400 block mb-1">
                        AI Feedback:
                      </span>

                      {
                        question
                          .evaluation
                          .feedback
                      }
                    </div>
                  )}
                </div>
              )
            )}
        </div>
      </div>

      {/* FEEDBACK */}
      <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">

        <div className="flex items-start gap-3">

          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5 text-indigo-500" />
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              How was your interview
              experience?
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your feedback helps us
              improve future interview
              sessions.
            </p>
          </div>
        </div>

        {feedbackSubmitted ? (

          <div className="mt-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">

            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">

              <CheckCircle2 className="w-5 h-5" />

              Feedback submitted successfully
            </div>

            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-2">
              Thank you for helping us improve
              the AI Interview Simulator.
            </p>
          </div>

        ) : (

          <div className="mt-6">

            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Rate your experience
            </p>

            {/* Stars */}
            <div className="flex items-center gap-2 mt-3">

              {[1, 2, 3, 4, 5]
                .map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => {
                      setRating(star);
                      setFeedbackError("");
                    }}
                    className="transition hover:scale-110"
                    title={`${star} star`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300 dark:text-slate-700"
                      }`}
                    />
                  </button>
                ))}

              {rating > 0 && (
                <span className="text-sm font-bold text-slate-600 dark:text-slate-300 ml-2">
                  {rating}/5
                </span>
              )}
            </div>

            {/* Feedback text */}
            <textarea
              value={
                feedbackText
              }
              onChange={(event) =>
                setFeedbackText(
                  event.target.value
                )
              }
              rows={4}
              maxLength={1000}
              placeholder="Tell us what you liked or what we can improve..."
              className="w-full mt-5 p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />

            <div className="flex items-center justify-between mt-1">

              <span className="text-[10px] text-slate-400">
                Comment is optional
              </span>

              <span className="text-[10px] text-slate-400">
                {
                  feedbackText.length
                }
                /1000
              </span>
            </div>

            {feedbackError && (
              <div className="mt-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-500 flex items-center gap-2">

                <AlertCircle className="w-4 h-4" />

                {feedbackError}
              </div>
            )}

            <button
              type="button"
              onClick={
                handleSubmitFeedback
              }
              disabled={
                rating === 0 ||
                submittingFeedback
              }
              className="mt-5 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submittingFeedback ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />

                  Saving Feedback...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />

                  Submit Feedback
                </>
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};