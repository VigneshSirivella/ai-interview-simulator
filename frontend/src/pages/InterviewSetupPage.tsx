import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  apiService,
  getApiError,
} from "../services/api";

import { CameraPreview } from "../components/CameraPreview";
import { VideoPrepSection } from "../components/VideoPrepSection";
import { InterviewQASection } from "../components/InterviewQASection";

import {
  AlertCircle,
  Briefcase,
  Building2,
  Camera,
  CameraOff,
  CheckCircle2,
  Code2,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
  Bot,
  ArrowLeft,
  Video,
  ArrowRight,
  Tv,
} from "lucide-react";

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "TCS",
  "Infosys",
  "Startup X",
];

const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
];

const PROGRAMMING_LANGUAGES = [
  "Python",
  "C",
  "C++",
  "Java",
  "JavaScript",
  "TypeScript",
  "C#",
  "Go",
  "Kotlin",
  "PHP",
  "Ruby",
  "Rust",
  "Swift",
  "SQL",
];

type CameraChoice = "not-selected" | "enabled" | "disabled";
type PracticeMode = "one-on-one" | "language-qa";
type SelectedSection = null | "videos" | "practice";

export const InterviewSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const resumeState = location.state as
    | {
        prefilledRole?: string;
        skills?: string[];
      }
    | undefined;

  // Main UI State: null = Selection Screen, "videos" = Videos view, "practice" = Practice view
  const [selectedSection, setSelectedSection] = useState<SelectedSection>(null);

  // Practice State
  const [practiceMode, setPracticeMode] = useState<PracticeMode>("one-on-one");
  const [company, setCompany] = useState("Google");
  const [role, setRole] = useState(resumeState?.prefilledRole || "Software Engineer");
  const [difficulty, setDifficulty] = useState("Medium");
  const [totalQuestions, setTotalQuestions] = useState(10);
  const [firstLanguage, setFirstLanguage] = useState("Python");
  const [secondLanguage, setSecondLanguage] = useState("");
  const [thirdLanguage, setThirdLanguage] = useState("");

  const [cameraChoice, setCameraChoice] = useState<CameraChoice>("not-selected");
  const [cameraPermissionGranted, setCameraPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cameraEnabled = cameraChoice === "enabled" && cameraPermissionGranted;

  const selectedLanguages = useMemo(
    () => [firstLanguage, secondLanguage, thirdLanguage].filter(Boolean),
    [firstLanguage, secondLanguage, thirdLanguage]
  );

  const resumeSkills = resumeState?.skills || [];

  const handleStartInterview = async () => {
    setError("");

    const effectiveCameraChoice = cameraChoice === "not-selected" ? "disabled" : cameraChoice;
    const cameraEnabled = effectiveCameraChoice === "enabled" && cameraPermissionGranted;

    setLoading(true);

    try {
      const isOneOnOne = practiceMode === "one-on-one";
      const response = await apiService.startInterview({
        mode: isOneOnOne ? "general_hr" : "technical",
        company: isOneOnOne ? "General" : company,
        role: isOneOnOne ? "General Candidate" : role,
        difficulty: isOneOnOne ? "Medium" : difficulty,
        type: isOneOnOne ? "1-on-1 Real Interview" : `Language (${firstLanguage})`,
        totalQuestions,
        cameraEnabled,
        preferredLanguages: isOneOnOne ? [] : selectedLanguages,
      });

      sessionStorage.setItem(
        `interview-options-${response.session.id}`,
        JSON.stringify({
          cameraEnabled,
          preferredLanguages: isOneOnOne ? [] : selectedLanguages,
          totalQuestions,
          sessionMode: practiceMode,
        })
      );

      localStorage.removeItem(`interview-end-time-${response.session.id}`);

      navigate(`/interview/${response.session.id}`);
    } catch (requestError) {
      console.error("Failed to start interview practice:", requestError);
      setError(
        getApiError(
          requestError,
          "Failed to initialize the interview practice session."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-4 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8 min-w-0">
      {/* Back Button displayed when inside a section (State 2 or State 3) */}
      {selectedSection !== null && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setSelectedSection(null)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold bg-slate-200/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 dark:hover:text-white transition duration-200 shadow-sm cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Interview</span>
          </button>
        </div>
      )}

      {/* Error Alert Banner */}
      {error && (
        <div className="max-w-4xl mx-auto w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-3 shadow-md">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* STATE 1: INITIAL SELECTION SCREEN (selectedSection === null) */}
      {selectedSection === null && (
        <div className="flex flex-col gap-6 sm:gap-10 py-2 sm:py-4">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              INTERVIEW PREPARATION & PRACTICE
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              INTERVIEW
            </h1>

            <p className="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-400">
              Choose how you want to prepare
            </p>
          </div>

          {/* TWO LARGE OPTION SELECTION CARDS WITH VIBRANT COLORING */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 max-w-5xl mx-auto w-full">
            {/* Card 1: Preparation Through Videos (Vibrant Indigo / Blue Theme) */}
            <div
              onClick={() => setSelectedSection("videos")}
              className="bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-slate-950 border-2 border-indigo-500/40 hover:border-indigo-400 rounded-3xl p-5 sm:p-7 lg:p-9 shadow-2xl hover:shadow-indigo-500/20 transition-all duration-300 flex flex-col justify-between gap-6 sm:gap-8 group cursor-pointer transform hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl"
            >
              {/* Background Glow Effects */}
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-500 pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl group-hover:bg-cyan-500/20 transition-all duration-500 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Video className="w-6 h-6 sm:w-7 sm:h-7" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider text-cyan-300 bg-indigo-500/20 px-3 py-1 rounded-full border border-indigo-400/30 shadow-sm">
                    VIDEOS & TUTORIALS
                  </span>
                </div>

                <h2 className="text-xl sm:text-3xl font-black text-white group-hover:text-cyan-200 transition-colors">
                  Preparation Through Videos
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 mt-2 sm:mt-3 leading-relaxed">
                  Learn interview techniques, communication, body language, and important tips through curated videos.
                </p>
              </div>

              <div className="pt-4 sm:pt-5 border-t border-indigo-500/20 flex items-center justify-between">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Start Preparation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* Card 2: Interview Practice (Vibrant Purple / Fuchsia Theme) */}
            <div
              onClick={() => setSelectedSection("practice")}
              className="bg-gradient-to-br from-purple-950/60 via-slate-900/90 to-slate-950 border-2 border-purple-500/40 hover:border-fuchsia-400 rounded-3xl p-5 sm:p-7 lg:p-9 shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 flex flex-col justify-between gap-6 sm:gap-8 group cursor-pointer transform hover:-translate-y-2 relative overflow-hidden backdrop-blur-xl"
            >
              {/* Background Glow Effects */}
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-purple-500/20 rounded-full blur-3xl group-hover:bg-purple-500/30 transition-all duration-500 pointer-events-none" />
              <div className="absolute -bottom-12 -left-12 w-44 h-44 bg-fuchsia-500/10 rounded-full blur-3xl group-hover:bg-fuchsia-500/20 transition-all duration-500 pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 to-fuchsia-500 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
                    <Bot className="w-7 h-7" />
                  </div>

                  <span className="text-[10px] font-black uppercase tracking-wider text-fuchsia-300 bg-purple-500/20 px-3 py-1 rounded-full border border-purple-400/30 shadow-sm">
                    AI MOCK SIMULATION
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white group-hover:text-fuchsia-200 transition-colors">
                  Interview Practice
                </h2>

                <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                  Practice realistic interview questions and improve your interview performance.
                </p>
              </div>

              <div className="pt-5 border-t border-purple-500/20 flex items-center justify-between">
                <button
                  type="button"
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-purple-500 to-fuchsia-500 hover:from-purple-500 hover:to-fuchsia-400 text-white font-black text-xs sm:text-sm shadow-xl shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <span>Start Practice</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: PREPARATION THROUGH VIDEOS ONLY (selectedSection === "videos") */}
      {selectedSection === "videos" && (
        <div className="flex flex-col gap-6">
          <VideoPrepSection />
        </div>
      )}

      {/* STATE 3: INTERVIEW PRACTICE ONLY (selectedSection === "practice") */}
      {selectedSection === "practice" && (
        <section className="bg-white dark:bg-[#121218] border border-slate-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-6 lg:p-8 shadow-2xl flex flex-col gap-6 sm:gap-8 w-full min-w-0">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4 sm:pb-5 gap-3.5 w-full min-w-0">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-600/30 shrink-0">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Interview Practice
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  Configure role, company, difficulty, languages & launch AI session
                </p>
              </div>
            </div>
          </div>

          {/* Sub-Mode Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full min-w-0">
            {/* Box 1: 1-to-1 AI Mock Interview */}
            <button
              type="button"
              onClick={() => setPracticeMode("one-on-one")}
              className={`p-4 sm:p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-center justify-between cursor-pointer relative overflow-hidden group transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.98] w-full min-w-0 ${
                practiceMode === "one-on-one"
                  ? "border-indigo-400 bg-gradient-to-r from-indigo-950 via-purple-950/90 to-indigo-900 shadow-[0_15px_35px_rgba(79,70,229,0.35)] ring-2 ring-indigo-400/50 scale-[1.01]"
                  : "border-indigo-500/30 bg-slate-900/70 hover:border-indigo-400/70 hover:bg-indigo-950/40 hover:shadow-[0_15px_30px_rgba(79,70,229,0.25)] shadow-md"
              }`}
            >
              {/* Background Glow Effect */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${
                practiceMode === "one-on-one" ? "bg-indigo-500/30" : "bg-indigo-500/10 group-hover:bg-indigo-500/25"
              }`} />

              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  practiceMode === "one-on-one"
                    ? "bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 text-white shadow-lg shadow-indigo-500/40"
                    : "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30"
                }`}>
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-sm sm:text-base font-black transition-colors truncate ${
                    practiceMode === "one-on-one" ? "text-white" : "text-slate-200 group-hover:text-white"
                  }`}>
                    1-to-1 AI Mock Interview
                  </h3>
                  <p className={`text-[11px] sm:text-xs mt-0.5 transition-colors truncate ${
                    practiceMode === "one-on-one" ? "text-indigo-200" : "text-slate-400 group-hover:text-indigo-300"
                  }`}>
                    General HR & conversational practice
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 sm:px-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 relative z-10 shrink-0 ml-2 ${
                practiceMode === "one-on-one"
                  ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 text-white shadow-md shadow-indigo-500/40 border border-cyan-300/40"
                  : "bg-slate-800/80 text-slate-400 border border-slate-700/60 group-hover:border-indigo-400/50 group-hover:text-indigo-300"
              }`}>
                {practiceMode === "one-on-one" ? "Selected" : "Select"}
              </span>
            </button>

            {/* Box 2: Technical Skill & Language Practice */}
            <button
              type="button"
              onClick={() => setPracticeMode("language-qa")}
              className={`p-4 sm:p-6 rounded-3xl border-2 text-left transition-all duration-300 flex items-center justify-between cursor-pointer relative overflow-hidden group transform hover:-translate-y-1 sm:hover:-translate-y-2 hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.98] w-full min-w-0 ${
                practiceMode === "language-qa"
                  ? "border-fuchsia-400 bg-gradient-to-r from-purple-950 via-fuchsia-950/90 to-purple-900 shadow-[0_15px_35px_rgba(217,70,239,0.35)] ring-2 ring-fuchsia-400/50 scale-[1.01]"
                  : "border-purple-500/30 bg-slate-900/70 hover:border-purple-400/70 hover:bg-purple-950/40 hover:shadow-[0_15px_30px_rgba(217,70,239,0.25)] shadow-md"
              }`}
            >
              {/* Background Glow Effect */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all duration-500 ${
                practiceMode === "language-qa" ? "bg-fuchsia-500/30" : "bg-purple-500/10 group-hover:bg-purple-500/25"
              }`} />

              <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center font-black shrink-0 transition-transform duration-300 group-hover:scale-110 ${
                  practiceMode === "language-qa"
                    ? "bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-400 text-white shadow-lg shadow-purple-500/40"
                    : "bg-purple-600/20 text-purple-400 border border-purple-500/30"
                }`}>
                  <Code2 className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-sm sm:text-base font-black transition-colors truncate ${
                    practiceMode === "language-qa" ? "text-white" : "text-slate-200 group-hover:text-white"
                  }`}>
                    Technical Skill & Language Practice
                  </h3>
                  <p className={`text-[11px] sm:text-xs mt-0.5 transition-colors truncate ${
                    practiceMode === "language-qa" ? "text-fuchsia-200" : "text-slate-400 group-hover:text-fuchsia-300"
                  }`}>
                    Coding, databases & targeted tech Q&A
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-1 sm:px-3 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 relative z-10 shrink-0 ml-2 ${
                practiceMode === "language-qa"
                  ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-md shadow-purple-500/40 border border-fuchsia-300/40"
                  : "bg-slate-800/80 text-slate-400 border border-slate-700/60 group-hover:border-purple-400/50 group-hover:text-fuchsia-300"
              }`}>
                {practiceMode === "language-qa" ? "Selected" : "Select"}
              </span>
            </button>
          </div>

          {/* Configuration Form Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start w-full min-w-0">
            {practiceMode === "one-on-one" ? (
              /* VIBRANT 1-TO-1 AI MOCK INTERVIEW SETUP (Full width column) */
              <div className="lg:col-span-12 flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto min-w-0">
                {/* 1. Heading / Introduction */}
                <div className="relative p-4 sm:p-7 rounded-3xl bg-gradient-to-r from-indigo-900/80 via-purple-900/60 to-indigo-950 border-2 border-indigo-500/50 text-white shadow-2xl shadow-indigo-500/20 overflow-hidden backdrop-blur-xl group transform transition-all duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_25px_60px_rgba(99,102,241,0.35)] hover:border-indigo-400/80 w-full min-w-0">
                  {/* Ambient Background Glow Orbs */}
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl group-hover:bg-indigo-500/50 transition-all duration-500 pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 flex flex-col gap-2 w-full min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/40 shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-base sm:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-100 to-purple-200 truncate">
                          1-to-1 AI Mock Interview
                        </h3>
                        <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-indigo-300 bg-indigo-500/25 px-2 sm:px-2.5 py-0.5 rounded-full border border-indigo-400/30 inline-block mt-0.5">
                          General HR & Behavioral
                        </span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed mt-1">
                      Practice a realistic, conversational HR interview covering self-introductions, career goals, personal strengths, and behavioral scenarios.
                    </p>
                  </div>
                </div>

                {/* 2. Optional Camera & AI Proctoring Card */}
                <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-purple-950/90 border-2 border-indigo-500/40 rounded-3xl p-3.5 sm:p-6 lg:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-4 sm:gap-5 relative overflow-hidden group transform transition-all duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_25px_60px_rgba(16,185,129,0.3)] hover:border-emerald-400/60 w-full min-w-0 box-border">
                  {/* Glowing Background Accents */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl group-hover:bg-emerald-500/30 transition-all duration-500 pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-indigo-500/25 rounded-full blur-3xl pointer-events-none" />

                  <h3 className="text-sm sm:text-base font-black text-white flex items-center justify-between border-b border-indigo-500/20 pb-3 sm:pb-4 relative z-10 w-full min-w-0 gap-2">
                    <span className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-lg shadow-emerald-500/20 shrink-0">
                        <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                      <span className="truncate">Optional Camera & AI Proctoring</span>
                    </span>
                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/30 border border-cyan-200/30 shrink-0">
                      Proctoring AI
                    </span>
                  </h3>

                  {/* Information Box */}
                  <div className="p-3 sm:p-4.5 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-400/40 text-indigo-100 shadow-xl relative z-10 w-full min-w-0 box-border">
                    <p className="text-xs font-black text-white flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                      <span>Enable Camera Proctoring Analysis?</span>
                    </p>
                    <p className="mt-1.5 text-xs text-indigo-100/90 leading-relaxed font-normal">
                      AI will analyze eye contact, sitting posture, facial confidence, and non-verbal delivery during your interview session.
                    </p>
                    <p className="mt-1.5 text-[11px] text-indigo-300/80 font-medium leading-normal">
                      Camera access is controlled by your browser and can be disabled at any point. Technical answer scoring works normally without camera.
                    </p>
                  </div>

                  {/* Option Cards: Without Camera vs Enable Camera */}
                  <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 relative z-10 w-full min-w-0">
                    <button
                      type="button"
                      onClick={() => {
                        setCameraChoice("disabled");
                        setCameraPermissionGranted(false);
                      }}
                      className={`p-3 sm:p-4.5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.97] w-full min-w-0 flex flex-col justify-between ${
                        cameraChoice === "disabled"
                          ? "border-slate-300 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl shadow-slate-900/80 ring-2 ring-slate-400/50 scale-[1.01]"
                          : "border-slate-800/80 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/50 hover:shadow-xl text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-800/80 flex items-center justify-center mb-2 border border-slate-700/60 shrink-0">
                        <CameraOff className={`w-4 h-4 sm:w-5 sm:h-5 ${cameraChoice === "disabled" ? "text-white" : "text-slate-400"}`} />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black truncate ${cameraChoice === "disabled" ? "text-white" : "text-slate-300"}`}>
                          Without Camera
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-0.5 font-medium truncate">Standard audio mode</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setCameraChoice("enabled");
                        setCameraPermissionGranted(false);
                      }}
                      className={`p-3 sm:p-4.5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] active:scale-[0.97] w-full min-w-0 flex flex-col justify-between ${
                        cameraChoice === "enabled"
                          ? "border-emerald-400 bg-gradient-to-br from-emerald-950/90 via-teal-900/70 to-indigo-950 text-white shadow-2xl shadow-emerald-500/40 ring-2 ring-emerald-400/60 scale-[1.01]"
                          : "border-emerald-500/30 bg-slate-900/60 hover:border-emerald-400/80 hover:bg-emerald-950/30 hover:shadow-[0_10px_25px_rgba(16,185,129,0.2)] text-emerald-300/70 hover:text-emerald-200"
                      }`}
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-2 shadow-md shadow-emerald-500/20 shrink-0">
                        <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs font-black truncate ${cameraChoice === "enabled" ? "text-emerald-200" : "text-emerald-300"}`}>
                          Enable Camera
                        </p>
                        <span className="text-[10px] text-emerald-300/80 block mt-0.5 font-medium truncate">Full AI proctoring</span>
                      </div>
                    </button>
                  </div>

                  {cameraChoice !== "not-selected" && (
                    <div className="relative z-10 w-full min-w-0">
                      <CameraPreview
                        enabled={cameraChoice === "enabled"}
                        onPermissionChange={setCameraPermissionGranted}
                      />
                    </div>
                  )}

                  {cameraChoice === "enabled" && cameraPermissionGranted && (
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-900/90 to-teal-900/80 border-2 border-emerald-400 text-white text-xs flex items-center gap-3 font-bold shadow-xl shadow-emerald-500/20 relative z-10 w-full min-w-0">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/40">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      </div>
                      <span>Camera permission verified and active.</span>
                    </div>
                  )}
                </div>

                {/* 3. Number of Questions Selector */}
                <div className="w-full">
                  <div className="flex items-center justify-between mb-3 w-full">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-indigo-300 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                      Number of Questions
                    </label>
                    <span className="text-[11px] font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
                      {totalQuestions} mins total • 1 min per question
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
                    {[5, 10, 15, 20].map((count) => (
                      <button
                        type="button"
                        key={count}
                        onClick={() => setTotalQuestions(count)}
                        className={`py-4 px-4 rounded-2xl text-xs font-black border transition-all duration-300 cursor-pointer transform hover:-translate-y-1.5 hover:scale-[1.05] active:scale-[0.96] w-full ${
                          totalQuestions === count
                            ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 text-white border-indigo-400 shadow-[0_12px_25px_rgba(99,102,241,0.4)] ring-2 ring-indigo-400/50 scale-[1.03]"
                            : "bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-indigo-900/60 hover:border-indigo-500/60 hover:bg-indigo-500/15 hover:shadow-xl"
                        }`}
                      >
                        <span className="block text-sm font-black mb-0.5">{count} Questions</span>
                        <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">{count} min (1 min/q)</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Start 1-to-1 Interview Button */}
                <button
                  type="button"
                  onClick={handleStartInterview}
                  disabled={loading}
                  className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-black text-base shadow-[0_15px_35px_rgba(99,102,241,0.35)] hover:shadow-[0_20px_45px_rgba(168,85,247,0.5)] transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.015] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer mt-2 border border-indigo-400/30"
                >
                  {loading ? (
                    <>
                      <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Starting 1-to-1 Interview...
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner">
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </div>
                      <span>Start 1-to-1 Interview</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* VIBRANT TECHNICAL SKILL & LANGUAGE PRACTICE SETUP (Full Width Column) */
              <div className="lg:col-span-12 flex flex-col gap-5 sm:gap-6 w-full max-w-4xl mx-auto min-w-0">
                <div className="bg-gradient-to-br from-purple-950/90 via-slate-900/95 to-indigo-950/90 border-2 border-purple-500/40 rounded-3xl p-3.5 sm:p-6 lg:p-7 shadow-2xl backdrop-blur-xl flex flex-col gap-5 sm:gap-6 relative overflow-hidden group transform transition-all duration-500 ease-out hover:-translate-y-1.5 hover:scale-[1.01] hover:shadow-[0_25px_60px_rgba(168,85,247,0.35)] hover:border-purple-400/80 w-full min-w-0 box-border">
                  {/* Glowing Background Accents */}
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-fuchsia-500/20 rounded-full blur-3xl group-hover:bg-fuchsia-500/30 transition-all duration-500 pointer-events-none" />
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-purple-500/25 rounded-full blur-3xl pointer-events-none" />

                  {/* 1. Header Banner inside Technical Box */}
                  <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4 relative z-10 w-full min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 via-fuchsia-500 to-pink-500 text-white flex items-center justify-center font-black shadow-lg shadow-purple-500/40 shrink-0 transition-transform duration-300 group-hover:scale-110">
                      <Code2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-black text-white truncate">
                        Technical Skill & Language Practice
                      </h3>
                      <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-fuchsia-300 bg-fuchsia-500/20 px-2.5 py-0.5 rounded-full border border-fuchsia-400/30 inline-block mt-0.5">
                        Targeted Technical Q&A
                      </span>
                    </div>
                  </div>

                  {/* 2. Optional Camera & AI Proctoring Card */}
                  <div className="bg-gradient-to-br from-indigo-950/90 via-slate-900/95 to-purple-950/90 border-2 border-indigo-500/40 rounded-3xl p-3.5 sm:p-5 shadow-2xl backdrop-blur-xl flex flex-col gap-4 relative overflow-hidden group/cam w-full min-w-0 box-border">
                    {/* Glowing Accents */}
                    <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

                    <h3 className="text-xs sm:text-sm font-black text-white flex items-center justify-between border-b border-indigo-500/20 pb-3 relative z-10 w-full min-w-0 gap-2">
                      <span className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-md shrink-0">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="truncate">Optional Camera & AI Proctoring</span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-cyan-500 text-white border border-cyan-200/30 shrink-0">
                        Proctoring AI
                      </span>
                    </h3>

                    {/* Information Box */}
                    <div className="p-3 sm:p-4 rounded-2xl bg-gradient-to-r from-indigo-900/60 via-purple-900/40 to-slate-900/80 border border-indigo-400/40 text-indigo-100 shadow-lg relative z-10 w-full min-w-0 box-border">
                      <p className="text-xs font-black text-white flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                        <span>Enable Camera Proctoring Analysis?</span>
                      </p>
                      <p className="mt-1.5 text-xs text-indigo-100/90 leading-relaxed font-normal">
                        AI will analyze eye contact, sitting posture, facial confidence, and non-verbal delivery during your practice session.
                      </p>
                      <p className="mt-1.5 text-[11px] text-indigo-300/80 font-medium leading-normal">
                        Camera access is controlled by your browser and can be disabled at any point. Technical answer scoring works normally without camera.
                      </p>
                    </div>

                    {/* Option Cards */}
                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 relative z-10 w-full min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          setCameraChoice("disabled");
                          setCameraPermissionGranted(false);
                        }}
                        className={`p-3 sm:p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.97] w-full min-w-0 flex flex-col justify-between ${
                          cameraChoice === "disabled"
                            ? "border-slate-300 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl ring-2 ring-slate-400/50 scale-[1.01]"
                            : "border-slate-800/80 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-800/50 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-slate-800/80 flex items-center justify-center mb-2 border border-slate-700/60 shrink-0">
                          <CameraOff className={`w-4 h-4 ${cameraChoice === "disabled" ? "text-white" : "text-slate-400"}`} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate ${cameraChoice === "disabled" ? "text-white" : "text-slate-300"}`}>
                            Without Camera
                          </p>
                          <span className="text-[10px] text-slate-400 block mt-0.5 font-medium truncate">Standard audio mode</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCameraChoice("enabled");
                          setCameraPermissionGranted(false);
                        }}
                        className={`p-3 sm:p-4 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer transform hover:-translate-y-0.5 active:scale-[0.97] w-full min-w-0 flex flex-col justify-between ${
                          cameraChoice === "enabled"
                            ? "border-emerald-400 bg-gradient-to-br from-emerald-950/90 via-teal-900/70 to-indigo-950 text-white shadow-xl ring-2 ring-emerald-400/60 scale-[1.01]"
                            : "border-emerald-500/30 bg-slate-900/60 hover:border-emerald-400/80 hover:bg-emerald-950/30 text-emerald-300/70 hover:text-emerald-200"
                        }`}
                      >
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-2 shadow-md shrink-0">
                          <Camera className="w-4 h-4 text-emerald-300" />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-black truncate ${cameraChoice === "enabled" ? "text-emerald-200" : "text-emerald-300"}`}>
                            Enable Camera
                          </p>
                          <span className="text-[10px] text-emerald-300/80 block mt-0.5 font-medium truncate">Full AI proctoring</span>
                        </div>
                      </button>
                    </div>

                    {cameraChoice !== "not-selected" && (
                      <div className="relative z-10 w-full min-w-0">
                        <CameraPreview
                          enabled={cameraChoice === "enabled"}
                          onPermissionChange={setCameraPermissionGranted}
                        />
                      </div>
                    )}

                    {cameraChoice === "enabled" && cameraPermissionGranted && (
                      <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-900/90 to-teal-900/80 border-2 border-emerald-400 text-white text-xs flex items-center gap-2.5 font-bold shadow-lg relative z-10 w-full min-w-0">
                        <div className="w-6 h-6 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center shrink-0 border border-emerald-400/40">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        </div>
                        <span>Camera permission verified and active.</span>
                      </div>
                    )}
                  </div>

                  {/* 3. Target Company */}
                  <div className="relative z-10 w-full">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wide text-fuchsia-300 mb-2.5 flex items-center gap-2">
                      <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
                      Target Company
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                      {COMPANIES.map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setCompany(item)}
                          className={`py-2.5 sm:py-3 px-2.5 rounded-xl text-xs font-black border transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 w-full ${
                            company === item
                              ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white border-fuchsia-400 shadow-lg shadow-purple-500/40 ring-2 ring-fuchsia-400/50 scale-[1.02]"
                              : "bg-slate-900/60 text-slate-200 border-slate-700/80 hover:border-purple-400/70 hover:bg-purple-950/40 hover:text-white"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 4. Target Role */}
                  <div className="relative z-10 w-full">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wide text-fuchsia-300 mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
                      Target Role
                    </label>
                    <select
                      value={role}
                      onChange={(event) => setRole(event.target.value)}
                      className="w-full p-3 sm:p-3.5 rounded-2xl border-2 border-purple-500/30 bg-slate-900/80 text-white text-xs sm:text-sm outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/40 transition-all cursor-pointer font-black"
                    >
                      {ROLES.map((item) => (
                        <option key={item} value={item} className="bg-slate-900 text-white font-bold">
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 5. Preferred Programming Languages */}
                  <div className="relative z-10 w-full">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wide text-fuchsia-300 mb-1 flex items-center gap-2">
                      <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
                      Preferred Programming Languages
                    </label>
                    <p className="text-[11px] text-purple-300/70 mb-2.5 font-medium">
                      Technical questions will align with your primary language choice.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full">
                      <LanguageSelect
                        label="First Preference *"
                        value={firstLanguage}
                        required={true}
                        onChange={setFirstLanguage}
                      />
                      <LanguageSelect
                        label="Second Preference"
                        value={secondLanguage}
                        onChange={setSecondLanguage}
                      />
                      <LanguageSelect
                        label="Third Preference"
                        value={thirdLanguage}
                        onChange={setThirdLanguage}
                      />
                    </div>
                  </div>

                  {/* 6. Difficulty Level */}
                  <div className="relative z-10 w-full">
                    <label className="text-xs sm:text-sm font-black uppercase tracking-wide text-fuchsia-300 mb-2.5 flex items-center gap-2">
                      <Layers className="w-4 h-4 sm:w-5 sm:h-5 text-fuchsia-400" />
                      Difficulty Level
                    </label>
                    <div className="grid grid-cols-3 gap-2.5 sm:gap-3 w-full">
                      {["Easy", "Medium", "Hard"].map((item) => (
                        <button
                          type="button"
                          key={item}
                          onClick={() => setDifficulty(item)}
                          className={`py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black border transition-all duration-200 cursor-pointer transform hover:-translate-y-0.5 hover:scale-105 active:scale-95 w-full ${
                            difficulty === item
                              ? "bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 text-white border-fuchsia-300 shadow-lg shadow-purple-500/40 ring-2 ring-fuchsia-400/50 scale-[1.02]"
                              : "bg-slate-900/60 text-slate-200 border-slate-700/80 hover:border-purple-400/70 hover:bg-purple-950/40 hover:text-white"
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 7. Questions Slider */}
                  <div className="relative z-10 w-full">
                    <div className="flex justify-between items-center mb-2 w-full">
                      <label className="text-xs font-black uppercase tracking-wide text-fuchsia-300 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-pulse" />
                        Total Questions
                      </label>
                      <span className="text-xs font-black text-white bg-gradient-to-r from-purple-600 to-fuchsia-600 px-3 py-1 rounded-full shadow-md border border-fuchsia-400/40">
                        {totalQuestions} Questions
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={10}
                      value={totalQuestions}
                      onChange={(event) => setTotalQuestions(Number(event.target.value))}
                      className="w-full accent-fuchsia-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* 8. Resume Skills */}
                  {resumeSkills.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 relative z-10 w-full">
                      <p className="text-xs font-extrabold text-emerald-300 mb-2">
                        Resume Skills Detected
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {resumeSkills.map((skill) => (
                          <span
                            key={skill}
                            className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-bold border border-emerald-500/30"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 9. Start Technical Practice Button */}
                  <button
                    type="button"
                    onClick={handleStartInterview}
                    disabled={loading}
                    className="w-full py-4.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-indigo-500 text-white font-black text-base shadow-[0_15px_35px_rgba(168,85,247,0.35)] hover:shadow-[0_20px_45px_rgba(217,70,239,0.5)] transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.015] active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer border border-fuchsia-400/30 relative z-10"
                  >
                    {loading ? (
                      <>
                        <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Starting Technical Practice...
                      </>
                    ) : (
                      <>
                        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center text-white shadow-inner">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                        <span>Start Technical Practice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

interface LanguageSelectProps {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({
  label,
  value,
  required = false,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-xs sm:text-sm font-black text-fuchsia-200 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full p-3.5 rounded-2xl border-2 border-purple-500/30 bg-slate-900/90 text-white text-xs sm:text-sm font-bold outline-none focus:border-fuchsia-400 focus:ring-2 focus:ring-fuchsia-400/40 transition-all cursor-pointer"
      >
        {!required && <option value="" className="bg-slate-900 text-slate-400">Not selected</option>}
        {PROGRAMMING_LANGUAGES.map((language) => (
          <option key={language} value={language} className="bg-slate-900 text-white font-bold">
            {language}
          </option>
        ))}
      </select>
    </div>
  );
};