import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { apiService, getApiError } from "../services/api";
import { DashboardStats } from "../types";
import { ScoreBadge } from "../components/ScoreBadge";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Award,
  BarChart3,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Play,
  RefreshCw,
  Sparkles,
  Target,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const [stats, setStats] =
    useState<DashboardStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [chartTimeframe, setChartTimeframe] =
    useState<"weekly" | "monthly">("weekly");

  const loadStats = async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await apiService.getDashboardStats();

      setStats(response.stats);
    } catch (requestError) {
      console.error(
        "Failed to load dashboard statistics:",
        requestError
      );

      setError(
        getApiError(
          requestError,
          "Unable to load dashboard information."
        )
      );

      /*
       * Do not insert demo data when the request fails.
       * Keeping stats as null prevents false information
       * from appearing on the user's dashboard.
       */
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalInterviews =
    stats?.totalInterviews ?? 0;

  const averageScore =
    stats?.averageScore ?? 0;

  const overallAccuracy =
    stats?.overallAccuracy ?? 0;

  const completionRate =
    stats?.completionRate ?? 0;

  const recentReports =
    stats?.recentReports ?? [];
  
  const interviewHistory =
    stats?.interviewHistory ?? [];

  const practiceStats =
    stats?.practiceStats;

  const totalPracticeSolved =
    practiceStats?.totalSolved ?? 0;

  const practiceAverageScore =
    practiceStats?.averageScore ?? 0;

  const recentPracticeAttempts =
    practiceStats?.recentAttempts ?? [];

  const strongTopics = useMemo(() => {
    const topics = interviewHistory.flatMap(
      (interview) => interview.strengths || []
    );

    return [...new Set(topics)]
      .filter(Boolean)
      .slice(0, 5);
  }, [interviewHistory]);

  const weakTopics = useMemo(() => {
    const topics = interviewHistory.flatMap(
      (interview) => interview.weaknesses || []
    );

    return [...new Set(topics)]
      .filter(Boolean)
      .slice(0, 5);
  }, [interviewHistory]);

  const hasInterviewActivity =
    totalInterviews > 0 ||
    recentReports.length > 0;

  const chartData = useMemo(() => {
  if (!interviewHistory.length) {
    return [];
  }

  return [...interviewHistory]
    .reverse()
    .map((interview, index) => ({
      day: `Interview ${index + 1}`,
      score: interview.score ?? 0,
    }));
}, [interviewHistory]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />

        <p className="text-xs text-slate-500 font-medium">
          Loading your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <div>
              <p className="text-sm font-bold">
                Dashboard data could not be loaded
              </p>

              <p className="text-xs mt-1">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadStats}
            className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-rose-700"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Welcome banner */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 sm:p-7 lg:p-10 shadow-2xl overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -top-24 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-md mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />

            <span>
              Target Role:{" "}
              {user?.targetRole ||
                "Not selected yet"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Welcome, {user?.name || "Candidate"}! 👋
          </h1>

          {hasInterviewActivity ? (
            <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
              You have completed{" "}
              <span className="font-bold text-white">
                {totalInterviews}
              </span>{" "}
              mock{" "}
              {totalInterviews === 1
                ? "interview"
                : "interviews"}
              . Your current average score is{" "}
              <span className="font-bold text-white">
                {averageScore}%
              </span>
              .
            </p>
          ) : (
            <p className="text-indigo-200 text-xs sm:text-sm leading-relaxed">
              You have not completed an interview yet.
              Start your first AI mock interview to
              receive questions, feedback and a detailed
              performance report.
            </p>
          )}
        </div>

        <Link
          to="/setup"
          className="relative z-10 w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white text-indigo-950 font-extrabold text-sm shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2 shrink-0 group"
        >
          <Play className="w-4 h-4 fill-current text-indigo-600" />

          <span>
            {hasInterviewActivity
              ? "Start New Interview"
              : "Start First Interview"}
          </span>

          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Total Interviews"
          value={String(totalInterviews)}
          description={
            totalInterviews === 0
              ? "No interviews completed"
              : `${totalInterviews} completed ${
                  totalInterviews === 1
                    ? "interview"
                    : "interviews"
                }`
          }
          icon={
            <BarChart3 className="w-6 h-6" />
          }
          iconClassName="bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
        />

        <MetricCard
          title="Average Score"
          value={`${averageScore}%`}
          description={
            totalInterviews === 0
              ? "Available after your first interview"
              : "Average of completed interviews"
          }
          icon={<Award className="w-6 h-6" />}
          iconClassName="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
        />

        <MetricCard
          title="Overall Accuracy"
          value={`${overallAccuracy}%`}
          description={
            totalInterviews === 0
              ? "No evaluated answers yet"
              : "Based on evaluated answers"
          }
          icon={<Target className="w-6 h-6" />}
          iconClassName="bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400"
        />

        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          description={
            totalInterviews === 0
              ? "No interview activity yet"
              : "Completed interview sessions"
          }
          icon={<Clock className="w-6 h-6" />}
          iconClassName="bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
        />
      </div>

            {/* Practice Progress */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Practice Progress
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Your performance from solved Practice Lab questions.
            </p>
          </div>

          <Link
            to="/practice"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold"
          >
            Go to Practice Lab
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase font-bold text-slate-400">
              Total Solved
            </p>

            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
              {totalPracticeSolved}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase font-bold text-slate-400">
              Average Score
            </p>

            <p className="text-2xl font-extrabold text-indigo-500 mt-1">
              {practiceAverageScore}%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase font-bold text-emerald-500">
              Easy
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {practiceStats?.easy?.count ?? 0} solved
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Avg: {practiceStats?.easy?.averageScore ?? 0}%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase font-bold text-indigo-500">
              Medium
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {practiceStats?.medium?.count ?? 0} solved
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Avg: {practiceStats?.medium?.averageScore ?? 0}%
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className="text-[11px] uppercase font-bold text-rose-500">
              Hard
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">
              {practiceStats?.hard?.count ?? 0} solved
            </p>

            <p className="text-xs text-slate-500 mt-1">
              Avg: {practiceStats?.hard?.averageScore ?? 0}%
            </p>
          </div>
        </div>

        {recentPracticeAttempts.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Recent Practice Attempts
            </h4>

            <div className="flex flex-col gap-3">
              {recentPracticeAttempts.map((attempt) => (
                <div
                  key={attempt.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {attempt.questionTitle}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      {attempt.topicOrLanguage || "General"} •{" "}
                      {attempt.questionType} •{" "}
                      {attempt.difficulty}
                    </p>
                  </div>

                  <ScoreBadge
                    score={attempt.score ?? 0}
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Performance and topic insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
        <div className="lg:col-span-2 p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Performance Score History
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Scores from your completed mock
                interviews
              </p>
            </div>

            {chartData.length > 0 && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold self-start">
                <button
                  type="button"
                  onClick={() =>
                    setChartTimeframe("weekly")
                  }
                  className={`px-3 py-1 rounded-lg transition ${
                    chartTimeframe === "weekly"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Weekly
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setChartTimeframe("monthly")
                  }
                  className={`px-3 py-1 rounded-lg transition ${
                    chartTimeframe === "monthly"
                      ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500"
                  }`}
                >
                  Monthly
                </button>
              </div>
            )}
          </div>

          {chartData.length === 0 ? (
            <DashboardEmptyState
              icon={
                <BarChart3 className="w-7 h-7" />
              }
              title="No performance data yet"
              description="Your performance graph will appear after you complete your first mock interview."
              buttonText="Start First Interview"
              buttonLink="/setup"
            />
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer
                width="100%"
                height="100%"
              >
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="scoreColor"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#6366f1"
                        stopOpacity={0.4}
                      />

                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#334155"
                    opacity={0.3}
                  />

                  <XAxis
                    dataKey="day"
                    stroke="#94a3b8"
                    fontSize={11}
                  />

                  <YAxis
                    domain={[0, 100]}
                    stroke="#94a3b8"
                    fontSize={11}
                  />

                  <Tooltip
                    formatter={(value) => [`${value}%`, "Score"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#f8fafc",
                    }}
                  />

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#scoreColor)"
                    dot={{
                      r: 6,
                      fill: "#6366f1",
                      stroke: "#ffffff",
                      strokeWidth: 2,
                    }}
                    activeDot={{
                      r: 8,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Skill Topic Insights
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generated from your evaluated answers
            </p>
          </div>

          {strongTopics.length === 0 &&
          weakTopics.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                <Target className="w-6 h-6" />
              </div>

              <h4 className="mt-4 text-sm font-bold text-slate-900 dark:text-white">
                No skill insights yet
              </h4>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-5">
                Strong topics and improvement areas
                will appear after your answers are
                evaluated.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Strong Topics
                </p>

                {strongTopics.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No strong topics identified yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {strongTopics.map(
                      (topic, index) => (
                        <span
                          key={`${topic}-${index}`}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 text-xs font-semibold"
                        >
                          {topic}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div>
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Recommended Focus Areas
                </p>

                {weakTopics.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No improvement areas identified yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {weakTopics.map(
                      (topic, index) => (
                        <span
                          key={`${topic}-${index}`}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 text-xs font-semibold"
                        >
                          {topic}
                        </span>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interview History */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Interview History
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            View feedback and performance from each completed interview.
          </p>
        </div>

        {interviewHistory.length === 0 ? (
          <DashboardEmptyState
            icon={
              <FileText className="w-7 h-7" />
            }
            title="No completed interviews yet"
            description="Complete your first mock interview to see your interview history and feedback."
            buttonText="Start First Interview"
            buttonLink="/setup"
          />
        ) : (
          <div className="flex flex-col gap-4">
            {interviewHistory.map(
              (interview, index) => (
                <div
                  key={interview.id}
                  className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        Interview {index + 1}
                      </p>

                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                        {interview.company ||
                          "General Company"}{" "}
                        •{" "}
                        {interview.role ||
                          "Software Engineer"}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1">
                        {interview.difficulty} •{" "}
                        {interview.interviewType}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <ScoreBadge
                        score={
                          interview.score ?? 0
                        }
                        size="sm"
                      />

                      <Link
                        to={`/report/${interview.id}`}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center"
                      >
                        View Feedback
                      </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Technical
                      </p>

                      <p className="text-lg font-bold text-indigo-500">
                        {interview.technicalScore ??
                          0}
                        %
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Communication
                      </p>

                      <p className="text-lg font-bold text-emerald-500">
                        {interview.communicationScore ??
                          0}
                        %
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                      <p className="text-[10px] uppercase font-bold text-slate-400">
                        Camera
                      </p>

                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {interview.cameraEnabled
                          ? "Enabled"
                          : "Not Used"}
                      </p>
                    </div>
                  </div>

                  {interview.feedback && (
                    <div className="mt-4 p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
                      <p className="text-xs font-bold text-indigo-500 mb-1">
                        Final Feedback
                      </p>

                      <p className="text-xs text-slate-700 dark:text-slate-300">
                        {interview.feedback}
                      </p>
                    </div>
                  )}

                  {interview.improvements &&
                    interview.improvements.length >
                      0 && (
                      <div className="mt-4">
                        <p className="text-xs font-bold text-amber-500 mb-2">
                          Improvements
                        </p>

                        <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          {interview.improvements.map(
                            (
                              item,
                              improvementIndex
                            ) => (
                              <li
                                key={
                                  improvementIndex
                                }
                              >
                                {item}
                              </li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                </div>
              )
            )}
          </div>
        )}
      </div>

    </div>
  );
};


interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  iconClassName,
}) => {
  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </p>

        <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
          {value}
        </p>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
          {description}
        </p>
      </div>

      <div
        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconClassName}`}
      >
        {icon}
      </div>
    </div>
  );
};

interface DashboardEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

const DashboardEmptyState: React.FC<
  DashboardEmptyStateProps
> = ({
  icon,
  title,
  description,
  buttonText,
  buttonLink,
}) => {
  return (
    <div className="min-h-56 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center px-5 py-10">
      <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
        {icon}
      </div>

      <h4 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
        {title}
      </h4>

      <p className="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400 leading-5">
        {description}
      </p>

      <Link
        to={buttonLink}
        className="mt-5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2"
      >
        <Play className="w-4 h-4" />
        {buttonText}
      </Link>
    </div>
  );
};