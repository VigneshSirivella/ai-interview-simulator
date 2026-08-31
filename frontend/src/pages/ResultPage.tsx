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
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8 lg:gap-10 min-w-0">

      {/* HEADER */}
      <div className="rounded-3xl bg-[#15151A] border-2 border-purple-500/40 hover:border-purple-300 text-white p-4 sm:p-8 lg:p-10 shadow-2xl shadow-purple-950/70 hover:shadow-purple-500/30 relative overflow-hidden group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transform hover:-translate-y-2 hover:scale-[1.015] transition-all duration-500 cursor-pointer w-full">
        {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A183B] via-[#15162B] to-[#111322] group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
        {/* Top glowing light beam when card pops forward */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/50 text-xs font-black uppercase tracking-wider mb-3 shadow-sm">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Assessment Finalized
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Interview Performance Report
          </h1>

          <p className="text-xs sm:text-sm text-purple-200/90 mt-2 flex flex-wrap items-center gap-3 font-medium">

            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {report.company}
            </span>

            <span className="flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {report.role}
            </span>

            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              {report.date
                ? new Date(
                    report.date
                  ).toLocaleDateString()
                : "Completed"}
            </span>
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleDownloadPDF}
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-purple-500/30 transition flex items-center justify-center gap-2 transform hover:scale-105 cursor-pointer"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Download PDF Report</span>
          </button>

          <Link
            to="/dashboard"
            className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-[#1E2138] hover:bg-[#252945] text-purple-200 border border-purple-500/30 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2 transform hover:scale-105 cursor-pointer text-center"
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>

      {/* SCORE + RADAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">

        {/* Score Card */}
        <div className="lg:col-span-5 bg-[#15151A] border-2 border-cyan-400/50 hover:border-cyan-300 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-cyan-950/60 hover:shadow-2xl hover:shadow-cyan-500/30 relative overflow-hidden group flex flex-col items-center text-center justify-center gap-6 transform hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 cursor-pointer w-full">
          {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#121B38] via-[#15172C] to-[#0F111E] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          {/* Top glowing light beam */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 w-28 h-28 sm:w-32 sm:h-32 rounded-full border-8 border-cyan-400 flex flex-col items-center justify-center bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-transparent shadow-lg shadow-cyan-500/30 transform group-hover:scale-110 transition-transform duration-500 shrink-0">

            <span className="text-3xl sm:text-4xl font-black text-cyan-300">
              {report.overallScore}%
            </span>

            <span className="text-[10px] font-black text-cyan-200 uppercase tracking-widest mt-0.5">
              Overall Rating
            </span>
          </div>

          <div className="relative z-10 w-full">
            <ScoreBadge
              score={
                report.overallScore
              }
              size="lg"
            />

            <p className="text-xs text-cyan-200/80 mt-3 leading-relaxed font-medium">
              Performance for{" "}
              {report.role} at{" "}
              {report.company} (
              {report.difficulty}).
            </p>
          </div>

          <div className="relative z-10 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border border-indigo-400/40 text-xs text-indigo-100 text-left italic leading-relaxed shadow-md w-full">

            <span className="font-extrabold text-indigo-300 not-italic block mb-1">
              Executive AI Remark:
            </span>

            "
            {report.finalAiRemark ||
              "Interview evaluation completed."}
            "
          </div>
        </div>

        {/* Competency Radar Chart Card */}
        <div className="lg:col-span-7 bg-[#15151A] border-2 border-purple-500/40 hover:border-purple-300 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl shadow-purple-950/60 hover:shadow-2xl hover:shadow-purple-500/30 relative overflow-hidden group flex flex-col gap-4 transform hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 cursor-pointer w-full">
          {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A183B] via-[#15162B] to-[#111322] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          {/* Top glowing light beam */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4 w-full">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-400 shrink-0" />
              Competency Analysis
            </h3>

            <p className="text-xs text-purple-200/90 font-medium leading-relaxed">
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
      </div>

      {/* STRENGTHS / WEAKNESSES / TIPS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full">

        {/* Strengths */}
        <div className="p-4 sm:p-6 rounded-3xl bg-[#15151A] border-2 border-emerald-400/50 hover:border-emerald-300 shadow-xl shadow-emerald-950/60 hover:shadow-2xl hover:shadow-emerald-500/40 relative overflow-hidden group flex flex-col gap-4 transform hover:-translate-y-2 hover:scale-[1.01] transition-all duration-500 cursor-pointer w-full">
          {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F2824] via-[#122224] to-[#0F111E] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          {/* Top glowing light beam */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4 w-full">
            <h3 className="text-sm font-black text-emerald-300 flex items-center gap-2 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              Top Strengths
            </h3>

            <ul className="flex flex-col gap-2.5 text-xs text-emerald-100 font-medium leading-relaxed">

              {(report.topStrengths || [])
                .map((strength, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2"
                  >
                    <span className="text-emerald-400 font-bold">
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
                <li className="text-emerald-300/70">
                  No strengths recorded.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Weaknesses */}
        <div className="p-6 rounded-3xl bg-[#15151A] border-2 border-rose-400/50 hover:border-rose-300 shadow-xl shadow-rose-950/60 hover:shadow-2xl hover:shadow-rose-500/40 relative overflow-hidden group flex flex-col gap-4 transform hover:-translate-y-3 hover:scale-[1.03] transition-all duration-500 cursor-pointer">
          {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#36152B] via-[#241426] to-[#0F111E] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          {/* Top glowing light beam */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <h3 className="text-sm font-black text-rose-300 flex items-center gap-2 uppercase tracking-wider">

              <AlertCircle className="w-4 h-4 text-rose-300" />

              Areas to Improve
            </h3>

            <ul className="flex flex-col gap-2.5 text-xs text-rose-100 font-medium leading-relaxed">

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
                      <span className="text-rose-400 font-bold">
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
                <li className="text-rose-300/70">
                  No major weaknesses
                  recorded.
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Tips */}
        <div className="p-6 rounded-3xl bg-[#15151A] border-2 border-amber-400/50 hover:border-amber-300 shadow-xl shadow-amber-950/60 hover:shadow-2xl hover:shadow-amber-500/40 relative overflow-hidden group flex flex-col gap-4 transform hover:-translate-y-3 hover:scale-[1.03] transition-all duration-500 cursor-pointer">
          {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#2E1F0F] via-[#241B12] to-[#0F111E] group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          {/* Top glowing light beam */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4">
            <h3 className="text-sm font-black text-amber-300 flex items-center gap-2 uppercase tracking-wider">

              <Lightbulb className="w-4 h-4 text-amber-300" />

              Actionable Tips
            </h3>

            <ul className="flex flex-col gap-2.5 text-xs text-amber-100 font-medium leading-relaxed">

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
                    <span className="text-amber-400 font-bold">
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
                <li className="text-amber-300/70">
                  Continue practicing.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* QUESTION BREAKDOWN */}
      <div className="bg-[#15151A] border-2 border-purple-500/40 hover:border-purple-300 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-950/60 hover:shadow-2xl hover:shadow-purple-500/30 relative overflow-hidden group flex flex-col gap-6 transform hover:-translate-y-2 hover:scale-[1.015] transition-all duration-500">
        {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A183B] via-[#15162B] to-[#111322] group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
        {/* Top glowing light beam */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <h3 className="text-lg font-black text-white">
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
                    className="p-5 sm:p-6 rounded-2xl bg-[#16182B] border border-purple-500/30 hover:border-purple-400 flex flex-col gap-3 shadow-md relative overflow-hidden group/q transform hover:-translate-y-1.5 hover:scale-[1.015] hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 cursor-pointer"
                  >
                    {/* Inner question card hover fade-out overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-transparent group-hover/q:opacity-10 transition-opacity duration-500 pointer-events-none" />

                    <div className="relative z-10 flex items-center justify-between gap-3">

                      <span className="text-xs font-extrabold text-indigo-300">
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

                    <p className="relative z-10 text-sm font-extrabold text-white">
                      "
                      {
                        question.question
                      }
                      "
                    </p>

                    <div className="relative z-10 p-3.5 rounded-xl bg-[#111322] border border-purple-500/20 text-xs text-slate-200 leading-relaxed font-medium">

                      <span className="font-extrabold text-purple-300 block mb-1">
                        Your Answer:
                      </span>

                      {question.userAnswer === "[SKIPPED]"
                        ? "Skipped — No answer provided"
                        : question.userAnswer ||
                          "No answer provided"}
                    </div>

                    {question.evaluation && (
                      <div className="relative z-10 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/80 to-purple-950/60 border border-indigo-400/40 text-xs text-indigo-100 leading-relaxed">

                        <span className="font-extrabold text-indigo-300 block mb-1">
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
      </div>

      {/* FEEDBACK */}
      <div className="bg-[#15151A] border-2 border-purple-500/40 hover:border-purple-300 rounded-3xl p-6 sm:p-8 shadow-xl shadow-purple-950/60 hover:shadow-2xl hover:shadow-purple-500/30 relative overflow-hidden group transform hover:-translate-y-2 hover:scale-[1.015] transition-all duration-500">
        {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A183B] via-[#15162B] to-[#111322] group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
        {/* Top glowing light beam */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-300/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-start gap-3">

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-500/30 to-indigo-500/30 border border-purple-400/50 flex items-center justify-center shrink-0 shadow-md">
              <MessageSquare className="w-5 h-5 text-purple-300" />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                How was your interview
                experience?
              </h3>

              <p className="text-xs text-purple-200/90 font-medium mt-1">
                Your feedback helps us
                improve future interview
                sessions.
              </p>
            </div>
          </div>

          {feedbackSubmitted ? (

            <div className="mt-6 p-5 rounded-2xl bg-emerald-500/20 border border-emerald-400/50">

              <div className="flex items-center gap-2 text-emerald-300 font-extrabold">

                <CheckCircle2 className="w-5 h-5" />

                Feedback submitted successfully
              </div>

              <p className="text-xs text-emerald-200 mt-2 font-medium">
                Thank you for helping us improve
                the AI Interview Simulator.
              </p>
            </div>

          ) : (

            <div className="mt-6">

              <p className="text-xs font-extrabold text-slate-200">
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
                      className="transition transform hover:scale-110 cursor-pointer"
                      title={`${star} star`}
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating
                            ? "fill-amber-400 text-amber-400 drop-shadow-md"
                            : "text-slate-700 dark:text-slate-700"
                        }`}
                      />
                    </button>
                  ))}

                {rating > 0 && (
                  <span className="text-sm font-black text-amber-300 ml-2">
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
                className="w-full mt-5 p-4 rounded-2xl border-2 border-purple-500/30 bg-[#1A1C30] text-white text-sm outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 resize-none shadow-inner placeholder-purple-300/50 font-medium"
              />

              <div className="flex items-center justify-between mt-1">

                <span className="text-[10px] text-purple-300/70 font-medium">
                  Comment is optional
                </span>

                <span className="text-[10px] text-purple-300/70 font-medium">
                  {
                    feedbackText.length
                  }
                  /1000
                </span>
              </div>

              {feedbackError && (
                <div className="mt-3 p-3 rounded-xl bg-rose-500/20 border border-rose-400/40 text-xs text-rose-300 font-bold flex items-center gap-2">

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
                className="mt-5 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-extrabold text-sm transition shadow-lg shadow-purple-500/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
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

    </div>
  );
};