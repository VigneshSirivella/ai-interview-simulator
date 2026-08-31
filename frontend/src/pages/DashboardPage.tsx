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
  Zap,
} from "lucide-react";

// Singleton Web Audio API Synth Chime for dashboard card hover sound
let sharedDashAudioCtx: AudioContext | null = null;
let lastDashChimeTime = 0;

const playDashboardChime = (freq = 600) => {
  const now = Date.now();
  if (now - lastDashChimeTime < 100) return; // Throttle chime rate
  lastDashChimeTime = now;

  try {
    if (!sharedDashAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      sharedDashAudioCtx = new AudioCtx();
    }

    if (sharedDashAudioCtx.state === "suspended") {
      sharedDashAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedDashAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Ignore audio policies
  }
};

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

  const hasEvaluatedData =
    strongTopics.length > 0 ||
    weakTopics.length > 0;

  const { chartData, highestScore, minScore, scoreTrend } = useMemo(() => {
    if (!interviewHistory.length) {
      return { chartData: [], highestScore: 0, minScore: 0, scoreTrend: 0 };
    }

    const data = [...interviewHistory].reverse().map((interview, index) => ({
      day: `Interview ${index + 1}`,
      score: interview.score ?? 0,
    }));

    const scores = data.map((d) => d.score);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    const firstScore = scores[0] || 0;
    const lastScore = scores[scores.length - 1] || 0;
    const trend = lastScore - firstScore;

    return { chartData: data, highestScore: max, minScore: min, scoreTrend: trend };
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
    <div className="max-w-[1536px] w-full mx-auto px-3 sm:px-6 lg:px-8 xl:px-10 py-4 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-7 lg:gap-8 min-w-0">
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

      {/* Welcome banner with animated moving background colors & floating glowing orbs */}
      <div 
        onMouseEnter={() => playDashboardChime(600)}
        className="relative p-0.5 rounded-[1.65rem] overflow-hidden shadow-2xl group transform hover:-translate-y-3 hover:scale-[1.015] transition-all duration-500 hover:shadow-indigo-500/40 cursor-pointer"
      >
        {/* Animated glowing border backdrop */}
        <div className="animated-border-glow" />
        {/* Top glowing light beam when box opens/moves forward */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-indigo-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

        <div className="relative rounded-[1.5rem] animated-banner-bg text-white p-6 sm:p-8 lg:p-10 overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-white/10 z-10">
          {/* Floating animated colorful ambient background orbs */}
          <div className="absolute -top-20 -left-16 w-72 h-72 bg-indigo-500/30 rounded-full blur-3xl pointer-events-none animate-float-orb-1" />
          <div className="absolute top-1/2 -right-16 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl pointer-events-none animate-float-orb-2" />
          <div className="absolute -bottom-20 left-1/3 w-64 h-64 bg-emerald-500/25 rounded-full blur-3xl pointer-events-none animate-float-orb-3" />
          <div className="absolute top-5 left-1/2 w-56 h-56 bg-pink-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold backdrop-blur-md mb-3 shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" />
              <span>Target Role: {user?.targetRole || "Software Engineer"}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight mb-3 bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
              Welcome back, {user?.name || "Candidate"}! 👋
            </h1>

            {hasInterviewActivity ? (
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                You have completed <span className="font-bold text-white">{totalInterviews}</span> mock {totalInterviews === 1 ? "interview" : "interviews"}. Your average score is <span className="font-extrabold text-emerald-400">{averageScore}%</span>.
              </p>
            ) : (
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                Start your first AI mock interview to receive real-time voice, code, and camera posture evaluation.
              </p>
            )}
          </div>

          <Link
            to="/setup"
            onMouseEnter={() => playDashboardChime(800)}
            className="relative z-10 w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 shrink-0 group/btn cursor-pointer ring-2 ring-white/20"
          >
            <Play className="w-4 h-4 fill-current text-white" />
            <span>{hasInterviewActivity ? "Start New Interview" : "Start First Interview"}</span>
            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Statistics with JS Mouse Hover Fading & Dynamic Color Shifts */}
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
          hoverGradient="bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-indigo-400 shadow-indigo-500/40"
          chimeFreq={540}
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
          hoverGradient="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-emerald-400 shadow-emerald-500/40"
          chimeFreq={620}
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
          hoverGradient="bg-gradient-to-br from-purple-600 to-pink-700 text-white border-purple-400 shadow-purple-500/40"
          chimeFreq={700}
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
          hoverGradient="bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400 shadow-amber-500/40"
          chimeFreq={780}
        />
      </div>

      {/* Practice Progress Cards with JS Mouse Hover Effects */}
      <div className="p-3.5 sm:p-6 lg:p-7 rounded-3xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-xl flex flex-col gap-5 sm:gap-6 transform hover:-translate-y-2.5 hover:scale-[1.015] hover:border-indigo-500/50 hover:shadow-indigo-500/25 transition-all duration-500 group relative overflow-hidden cursor-pointer w-full min-w-0 box-border">
        {/* Top glowing light beam when box opens/moves forward */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full min-w-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-500 shrink-0" /> Practice Progress
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Your performance from solved Practice Lab questions. Hover cards to activate audio & color transitions.
            </p>
          </div>

          <Link
            to="/practice"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all hover:scale-105 shrink-0 self-start sm:self-auto"
          >
            Go to Practice Lab
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-5 w-full min-w-0">

          <div
            onMouseEnter={() => playDashboardChime(500)}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:bg-gradient-to-br hover:from-slate-800 hover:to-slate-950 hover:text-white hover:border-slate-600 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group w-full min-w-0 box-border"
          >
            <p className="text-[11px] uppercase font-bold text-slate-400 group-hover:text-slate-200">
              Total Solved
            </p>

            <p className="text-2xl font-extrabold text-slate-900 dark:text-white group-hover:text-white mt-1">
              {totalPracticeSolved}
            </p>
          </div>

          <div
            onMouseEnter={() => playDashboardChime(580)}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-700 hover:text-white hover:border-indigo-400 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group w-full min-w-0 box-border"
          >
            <p className="text-[11px] uppercase font-bold text-slate-400 group-hover:text-indigo-100">
              Average Score
            </p>

            <p className="text-2xl font-extrabold text-indigo-500 group-hover:text-white mt-1">
              {practiceAverageScore}%
            </p>
          </div>

          <div
            onMouseEnter={() => playDashboardChime(640)}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:bg-gradient-to-br hover:from-emerald-600 hover:to-teal-700 hover:text-white hover:border-emerald-400 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group w-full min-w-0 box-border"
          >
            <p className="text-[11px] uppercase font-bold text-emerald-500 group-hover:text-emerald-100">
              Easy
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white mt-1">
              {practiceStats?.easy?.count ?? 0} solved
            </p>

            <p className="text-xs text-slate-500 group-hover:text-emerald-100 mt-1">
              Avg: {practiceStats?.easy?.averageScore ?? 0}%
            </p>
          </div>

          <div
            onMouseEnter={() => playDashboardChime(720)}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:bg-gradient-to-br hover:from-indigo-600 hover:to-blue-700 hover:text-white hover:border-indigo-400 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group w-full min-w-0 box-border"
          >
            <p className="text-[11px] uppercase font-bold text-indigo-500 group-hover:text-indigo-100">
              Medium
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white mt-1">
              {practiceStats?.medium?.count ?? 0} solved
            </p>

            <p className="text-xs text-slate-500 group-hover:text-indigo-100 mt-1">
              Avg: {practiceStats?.medium?.averageScore ?? 0}%
            </p>
          </div>

          <div
            onMouseEnter={() => playDashboardChime(800)}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 transition-all duration-300 hover:bg-gradient-to-br hover:from-rose-600 hover:to-red-700 hover:text-white hover:border-rose-400 transform hover:-translate-y-1 hover:shadow-xl cursor-pointer group w-full min-w-0 box-border"
          >
            <p className="text-[11px] uppercase font-bold text-rose-500 group-hover:text-rose-100">
              Hard
            </p>

            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-white mt-1">
              {practiceStats?.hard?.count ?? 0} solved
            </p>

            <p className="text-xs text-slate-500 group-hover:text-rose-100 mt-1">
              Avg: {practiceStats?.hard?.averageScore ?? 0}%
            </p>
          </div>
        </div>

        {recentPracticeAttempts.length > 0 && (
          <div className="w-full min-w-0">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
              Recent Practice Attempts
            </h4>

            <div className="flex flex-col gap-3 w-full min-w-0">
              {recentPracticeAttempts.map((attempt) => (
                <Link
                  key={attempt.id}
                  onMouseEnter={() => playDashboardChime(650)}
                  to={`/practice?question=${encodeURIComponent(
                    attempt.questionId
                  )}`}
                  className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0 box-border hover:border-indigo-500 hover:bg-gradient-to-r hover:from-indigo-950/40 hover:to-purple-950/40 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {attempt.questionTitle}
                    </p>

                    <p className="text-xs text-slate-500 mt-1 truncate sm:whitespace-normal">
                      {attempt.topicOrLanguage || "General"} •{" "}
                      {attempt.questionType} •{" "}
                      {attempt.difficulty}
                    </p>

                    <p className="text-xs text-indigo-500 mt-2 font-semibold">
                      View your answer and feedback
                    </p>
                  </div>

                  <ScoreBadge
                    score={attempt.score ?? 0}
                    size="sm"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Performance and topic insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full min-w-0">
        <div className="lg:col-span-7 xl:col-span-7 p-3.5 sm:p-6 lg:p-7 rounded-3xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-xl flex flex-col justify-between gap-4 sm:gap-5 transform hover:-translate-y-2.5 hover:scale-[1.015] hover:border-indigo-500/50 hover:shadow-indigo-500/25 transition-all duration-500 group relative overflow-hidden cursor-pointer w-full min-w-0 box-border">
          {/* Top glowing light beam when box opens/moves forward */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 w-full min-w-0">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                  Performance Score History
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-black uppercase tracking-wider shrink-0">
                  Live Analytics
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Evaluation trajectory across your completed mock interview sessions
              </p>
            </div>

            {chartData.length > 0 && (
              <div className="flex items-center bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl text-xs font-bold self-start sm:self-auto border border-slate-200 dark:border-slate-800 shrink-0">
                <button
                  type="button"
                  onClick={() => setChartTimeframe("weekly")}
                  className={`px-3 py-1 rounded-lg transition ${
                    chartTimeframe === "weekly"
                      ? "bg-indigo-600 text-white shadow-md font-extrabold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Weekly
                </button>
                <button
                  type="button"
                  onClick={() => setChartTimeframe("monthly")}
                  className={`px-3 py-1 rounded-lg transition ${
                    chartTimeframe === "monthly"
                      ? "bg-indigo-600 text-white shadow-md font-extrabold"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  Monthly
                </button>
              </div>
            )}
          </div>

          {chartData.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 my-1 sm:my-2 w-full min-w-0 box-border">
              <div
                onMouseEnter={() => playDashboardChime(550)}
                className="flex flex-col p-2 sm:p-3 rounded-xl transition-all duration-200 hover:bg-slate-800/80 hover:scale-105 cursor-pointer min-w-0"
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Avg Score</span>
                <span className="text-lg sm:text-2xl font-black text-indigo-400 mt-0.5 sm:mt-1">{averageScore}%</span>
              </div>
              <div
                onMouseEnter={() => playDashboardChime(650)}
                className="flex flex-col p-2 sm:p-3 rounded-xl transition-all duration-200 hover:bg-slate-800/80 hover:scale-105 cursor-pointer min-w-0"
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Peak Score</span>
                <span className="text-lg sm:text-2xl font-black text-emerald-400 mt-0.5 sm:mt-1">{highestScore}%</span>
              </div>
              <div
                onMouseEnter={() => playDashboardChime(750)}
                className="flex flex-col p-2 sm:p-3 rounded-xl transition-all duration-200 hover:bg-slate-800/80 hover:scale-105 cursor-pointer min-w-0"
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Sessions</span>
                <span className="text-lg sm:text-2xl font-black text-purple-400 mt-0.5 sm:mt-1">{interviewHistory.length}</span>
              </div>
              <div
                onMouseEnter={() => playDashboardChime(850)}
                className="flex flex-col p-2 sm:p-3 rounded-xl transition-all duration-200 hover:bg-slate-800/80 hover:scale-105 cursor-pointer min-w-0"
              >
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider truncate">Trend</span>
                <span className={`text-lg sm:text-2xl font-black mt-0.5 sm:mt-1 flex items-center gap-1 ${
                  scoreTrend >= 0 ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {scoreTrend >= 0 ? `+${scoreTrend}%` : `${scoreTrend}%`}
                  <span className="text-xs sm:text-sm">{scoreTrend >= 0 ? "▲" : "▼"}</span>
                </span>
              </div>
            </div>
          )}

          {chartData.length === 0 ? (
            <DashboardEmptyState
              icon={<BarChart3 className="w-7 h-7" />}
              title="No performance data yet"
              description="Your performance graph will appear after you complete your first mock interview."
              buttonText="Start First Interview"
              buttonLink="/setup"
            />
          ) : (
            <div className="h-64 sm:h-80 md:h-96 lg:h-[380px] xl:h-[420px] w-full pt-3 sm:pt-4 flex-1 min-h-[240px] sm:min-h-[320px] min-w-0 box-border">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -22, bottom: 5 }}>
                  <defs>
                    <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.25} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: "#334155" }} />
                  <YAxis
                    domain={[Math.max(0, Math.floor(minScore / 10) * 10 - 10), 100]}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickFormatter={(val) => `${val}%`}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Interview Score"]}
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#475569",
                      borderRadius: "1rem",
                      boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                      color: "#f8fafc",
                      padding: "12px 16px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#818cf8"
                    strokeWidth={3.5}
                    fillOpacity={1}
                    fill="url(#scoreColor)"
                    dot={{
                      r: 6,
                      fill: "#818cf8",
                      stroke: "#0f172a",
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 8,
                      fill: "#6366f1",
                      stroke: "#ffffff",
                      strokeWidth: 2.5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="lg:col-span-5 xl:col-span-5 p-3.5 sm:p-6 lg:p-7 rounded-3xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-xl flex flex-col gap-6 transform hover:-translate-y-2.5 hover:scale-[1.015] hover:border-purple-500/50 hover:shadow-purple-500/25 transition-all duration-500 group relative overflow-hidden cursor-pointer w-full">
          {/* Top glowing light beam when box opens/moves forward */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Skill Topic Insights
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Generated from your evaluated answers
            </p>
          </div>

          {!hasEvaluatedData ? (
            <div className="min-h-56 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center p-4 sm:p-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
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
            <div className="flex flex-col gap-5 w-full">
              <div className="w-full">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Strong Topics
                </p>

                {strongTopics.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No strong topics identified yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    {strongTopics.map(
                      (topic, index) => (
                        <div
                          key={`${topic}-${index}`}
                          onMouseEnter={() => playDashboardChime(700)}
                          className="relative overflow-hidden py-2.5 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 text-xs font-semibold flex items-start gap-2.5 hover:bg-gradient-to-r hover:from-emerald-600 hover:to-teal-600 hover:text-white hover:border-emerald-400 hover:shadow-md hover:shadow-emerald-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group/topic w-full"
                        >
                          {/* Opening vertical line accent on left border */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-300 rounded-l-xl scale-y-0 group-hover/topic:scale-y-100 transition-transform duration-200 origin-center" />

                          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500 dark:text-emerald-400 group-hover/topic:text-white group-hover/topic:scale-110 transition-all duration-200" />
                          <span className="leading-snug flex-1">{topic}</span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              <div className="w-full">
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Recommended Focus Areas
                </p>

                {weakTopics.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No improvement areas identified yet.
                  </p>
                ) : (
                  <div className="flex flex-col gap-2 w-full">
                    {weakTopics.map(
                      (topic, index) => (
                        <div
                          key={`${topic}-${index}`}
                          onMouseEnter={() => playDashboardChime(500)}
                          className="relative overflow-hidden py-2.5 px-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-start gap-2.5 hover:bg-gradient-to-r hover:from-rose-600 hover:to-pink-600 hover:text-white hover:border-rose-400 hover:shadow-md hover:shadow-rose-500/20 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group/topic w-full"
                        >
                          {/* Opening vertical line accent on left border */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-300 rounded-l-xl scale-y-0 group-hover/topic:scale-y-100 transition-transform duration-200 origin-center" />

                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500 dark:text-rose-400 group-hover/topic:text-white group-hover/topic:scale-110 transition-all duration-200" />
                          <span className="leading-snug flex-1">{topic}</span>
                        </div>
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
      <div className="p-3.5 sm:p-6 lg:p-7 rounded-3xl glass-card border border-slate-200 dark:border-slate-800/80 shadow-xl flex flex-col gap-5 sm:gap-6 transform hover:-translate-y-2.5 hover:scale-[1.015] hover:border-indigo-500/50 hover:shadow-indigo-500/25 transition-all duration-500 group relative overflow-hidden cursor-pointer w-full">
        {/* Top glowing light beam when box opens/moves forward */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
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
          <div className="flex flex-col gap-4 w-full">
            {interviewHistory.map((interview, index) => (
              <InteractiveHistoryCard key={interview.id} interview={interview} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Interactive History Card Component
interface InteractiveHistoryCardProps {
  interview: any;
  index: number;
}

const InteractiveHistoryCard: React.FC<InteractiveHistoryCardProps> = ({ interview, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => {
        setIsHovered(true);
        playDashboardChime(580);
      }}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 transform w-full ${
        isHovered
          ? "bg-gradient-to-r from-indigo-950/60 via-slate-900 to-indigo-950/60 border-indigo-500/60 shadow-2xl -translate-y-1 scale-[1.01]"
          : "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
        <div>
          <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <span>Interview {index + 1}</span>
            {isHovered && <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
          </p>
          <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">
            {interview.company || "General Company"} • {interview.role || "Software Engineer"}
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            {interview.difficulty} • {interview.interviewType}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ScoreBadge score={interview.score ?? 0} size="sm" />
          <Link
            to={`/report/${interview.id}`}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center transition-all hover:scale-105 shadow-md"
          >
            View Feedback
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 mt-3.5 sm:mt-4 w-full">
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/40 transition-colors w-full">
          <p className="text-[10px] uppercase font-bold text-slate-400">Technical</p>
          <p className="text-lg sm:text-xl font-bold text-indigo-500">{interview.technicalScore ?? 0}%</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-colors w-full">
          <p className="text-[10px] uppercase font-bold text-slate-400">Communication</p>
          <p className="text-lg sm:text-xl font-bold text-emerald-500">{interview.communicationScore ?? 0}%</p>
        </div>
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-purple-500/40 transition-colors w-full">
          <p className="text-[10px] uppercase font-bold text-slate-400">Camera</p>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {interview.cameraEnabled ? "Enabled" : "Not Used"}
          </p>
        </div>
      </div>

      {interview.feedback && (
        <div className="mt-3.5 sm:mt-4 p-3.5 sm:p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 w-full">
          <p className="text-xs font-bold text-indigo-500 mb-1">Final Feedback</p>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed break-words font-medium">{interview.feedback}</p>
        </div>
      )}

      {interview.improvements && interview.improvements.length > 0 && (
        <div className="mt-3.5 sm:mt-4 w-full">
          <p className="text-xs font-bold text-amber-500 mb-2">Improvements</p>
          <ul className="list-disc list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1">
            {interview.improvements.map((item: string, improvementIndex: number) => (
              <li key={improvementIndex} className="break-words leading-relaxed">{item}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
  hoverGradient?: string;
  chimeFreq?: number;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon,
  iconClassName,
  hoverGradient = "bg-gradient-to-br from-indigo-600 via-purple-700 to-indigo-900 text-white border-indigo-400 shadow-indigo-500/50",
  chimeFreq = 600,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    playDashboardChime(chimeFreq);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className={`p-6 rounded-3xl border transition-all duration-500 transform cursor-pointer relative overflow-hidden group shadow-xl ${
        isHovered
          ? `${hoverGradient} -translate-y-3 scale-[1.03] shadow-2xl ring-2 ring-white/20`
          : "glass-card bg-white dark:bg-[#15151A] border-slate-200 dark:border-slate-800/80"
      }`}
    >
      {/* Top glowing light beam when box opens/moves forward */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p
            className={`text-xs font-black uppercase tracking-widest transition-colors ${
              isHovered ? "text-slate-100" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {title}
          </p>

          <p
            className={`text-3xl font-black mt-1 transition-all ${
              isHovered ? "text-white scale-105 origin-left" : "text-slate-900 dark:text-white"
            }`}
          >
            {value}
          </p>

          <p
            className={`text-[11px] font-medium mt-1 transition-colors ${
              isHovered ? "text-slate-200" : "text-slate-500 dark:text-slate-400"
            }`}
          >
            {description}
          </p>
        </div>

        <div
          className={`w-13 h-13 rounded-2xl flex items-center justify-center shrink-0 shadow-md transition-all duration-300 ${
            isHovered
              ? "bg-white/20 text-white rotate-12 scale-110 shadow-lg backdrop-blur-md"
              : iconClassName
          }`}
        >
          {icon}
        </div>
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