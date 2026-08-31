import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Mic,
  Camera,
  FileCheck,
  TrendingUp,
  CheckCircle2,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Star,
  Terminal,
  Award,
} from "lucide-react";

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const features = [
    {
      icon: Sparkles,
      title: "Dynamic Gemini AI Interviewer",
      desc: "Generates tailored technical & HR questions specific to your chosen company, role, and difficulty level in real time.",
      bg: "bg-gradient-to-br from-indigo-500/20 via-indigo-600/25 to-purple-700/30 dark:from-indigo-900/60 dark:via-purple-900/50 dark:to-indigo-950/80",
      border: "border-2 border-indigo-500/40 hover:border-indigo-400",
      shadow: "hover:shadow-2xl hover:shadow-indigo-500/40",
      iconBg: "bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30",
      titleGradient: "from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-200 dark:via-purple-200 dark:to-pink-200",
    },
    {
      icon: Mic,
      title: "Real-time Voice Recognition",
      desc: "Speak your answers directly via Web Speech API. Practice articulate verbal delivery and natural interview pacing.",
      bg: "bg-gradient-to-br from-cyan-500/20 via-blue-600/25 to-teal-700/30 dark:from-cyan-900/60 dark:via-blue-900/50 dark:to-teal-950/80",
      border: "border-2 border-cyan-500/40 hover:border-cyan-400",
      shadow: "hover:shadow-2xl hover:shadow-cyan-500/40",
      iconBg: "bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30",
      titleGradient: "from-cyan-500 via-teal-500 to-blue-600 dark:from-cyan-200 dark:via-teal-200 dark:to-blue-200",
    },
    {
      icon: Camera,
      title: "AI Eye Contact & Proctoring",
      desc: "Webcam live stream with posture and eye contact monitoring to build candidate confidence under pressure.",
      bg: "bg-gradient-to-br from-rose-500/20 via-pink-600/25 to-purple-700/30 dark:from-rose-900/60 dark:via-pink-900/50 dark:to-purple-950/80",
      border: "border-2 border-rose-500/40 hover:border-rose-400",
      shadow: "hover:shadow-2xl hover:shadow-rose-500/40",
      iconBg: "bg-gradient-to-tr from-rose-500 to-pink-600 text-white shadow-md shadow-rose-500/30",
      titleGradient: "from-rose-500 via-pink-500 to-purple-600 dark:from-rose-200 dark:via-pink-200 dark:to-purple-200",
    },
    {
      icon: FileCheck,
      title: "ATS Resume Analyzer",
      desc: "Instant ATS score, skill extraction, bullet point rewrite recommendations, and target role skill gap analysis.",
      bg: "bg-gradient-to-br from-emerald-500/20 via-teal-600/25 to-green-700/30 dark:from-emerald-900/60 dark:via-teal-900/50 dark:to-green-950/80",
      border: "border-2 border-emerald-500/40 hover:border-emerald-400",
      shadow: "hover:shadow-2xl hover:shadow-emerald-500/40",
      iconBg: "bg-gradient-to-tr from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30",
      titleGradient: "from-emerald-500 via-teal-500 to-cyan-600 dark:from-emerald-200 dark:via-teal-200 dark:to-cyan-200",
    },
    {
      icon: Terminal,
      title: "Interactive Code Console",
      desc: "Solve live coding challenges in JavaScript, Python, C++, Java with test runner execution and AI feedback.",
      bg: "bg-gradient-to-br from-amber-500/20 via-orange-600/25 to-yellow-700/30 dark:from-amber-900/60 dark:via-orange-900/50 dark:to-amber-950/80",
      border: "border-2 border-amber-500/40 hover:border-amber-400",
      shadow: "hover:shadow-2xl hover:shadow-amber-500/40",
      iconBg: "bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/30",
      titleGradient: "from-amber-500 via-orange-500 to-yellow-500 dark:from-amber-200 dark:via-orange-200 dark:to-yellow-200",
    },
    {
      icon: Award,
      title: "PDF Executive Reports",
      desc: "Download comprehensive 5-axis competency breakdown PDF reports with actionable strengths & weaknesses.",
      bg: "bg-gradient-to-br from-violet-500/20 via-fuchsia-600/25 to-indigo-700/30 dark:from-violet-900/60 dark:via-fuchsia-900/50 dark:to-indigo-950/80",
      border: "border-2 border-violet-500/40 hover:border-violet-400",
      shadow: "hover:shadow-2xl hover:shadow-violet-500/40",
      iconBg: "bg-gradient-to-tr from-violet-500 to-fuchsia-600 text-white shadow-md shadow-violet-500/30",
      titleGradient: "from-violet-500 via-fuchsia-500 to-indigo-600 dark:from-violet-200 dark:via-fuchsia-200 dark:to-indigo-200",
    },
  ];

  const faqs = [
    {
      q: "How does the AI evaluate my answers?",
      a: "Our backend uses Google Gemini 3.6 models fine-tuned for engineering recruitment. It analyzes technical accuracy, clarity, completeness, missing edge cases, and provides a benchmark exemplar answer.",
    },
    {
      q: "Can I practice for specific companies like Google or Amazon?",
      a: "Yes! You can select target companies (Google, Amazon, Microsoft, Meta, Netflix, Startups) and target roles (Software Engineer, Backend, Frontend, Full Stack, Data Science, DevOps). The AI adjusts question domain standards accordingly.",
    },
    {
      q: "Is speech recognition supported across browsers?",
      a: "Yes, we integrate native Web Speech Recognition API with fallback text input, allowing both spoken audio dictation and manual typing.",
    },
    {
      q: "Is this suitable for B.Tech final-year placement prep?",
      a: "Absolutely! It was engineered as a final-year CS project specifically designed to mimic real FAANG and top startup technical campus recruitment loops.",
    },
  ];

  return (
    <div className="flex flex-col gap-24 pb-16">
      {/* HERO SECTION */}
      <section className="relative pt-8 sm:pt-12 pb-14 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-6 sm:mb-8 animate-fade-in max-w-full">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500 shrink-0" />
            <span className="truncate">Next-Gen AI Campus Placement & Technical Mock Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-5xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.1] max-w-4xl mb-4 sm:mb-6">
            Master Technical Interviews with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Real-time AI Simulation
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-xs sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-8 sm:mb-10 leading-relaxed font-normal">
            Simulate realistic FAANG technical & HR interview loops with voice speech recognition, live webcam proctoring, ATS resume parsing, and instant AI answer evaluations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-5 w-full justify-center max-w-lg">
            <Link
              to={isAuthenticated ? "/setup" : "/login?unregistered=true"}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 text-white font-extrabold text-sm sm:text-base shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-purple-500/50 hover:-translate-y-1.5 hover:scale-105 active:scale-95 transition-all duration-300 transform flex items-center justify-center gap-2.5 group cursor-pointer"
            >
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200 group-hover:rotate-12 transition-transform" />
              <span>Start Free AI Interview</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link
              to={isAuthenticated ? "/resume" : "/login?unregistered=true"}
              className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-indigo-500/20 dark:from-purple-900/50 dark:via-pink-900/40 dark:to-indigo-900/50 hover:from-purple-500/35 hover:via-pink-500/35 hover:to-indigo-500/35 border-2 border-indigo-500/50 dark:border-purple-400/50 text-slate-900 dark:text-white font-extrabold text-sm sm:text-base shadow-lg shadow-purple-500/15 hover:shadow-2xl hover:shadow-pink-500/40 hover:border-pink-500 dark:hover:border-pink-400 hover:-translate-y-1.5 hover:scale-105 active:scale-95 transition-all duration-300 transform flex items-center justify-center gap-2.5 group cursor-pointer backdrop-blur-md"
            >
              <FileCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500 dark:text-purple-300 group-hover:scale-110 transition-transform" />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-200 dark:via-purple-200 dark:to-pink-200 bg-clip-text text-transparent">
                Analyze Resume ATS
              </span>
            </Link>
          </div>

          {/* Proof stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 max-w-5xl w-full mt-10 sm:mt-16 pt-8 sm:pt-12 border-t border-slate-200 dark:border-slate-800/80">
            <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-indigo-600/25 to-purple-700/30 dark:from-indigo-900/60 dark:via-purple-900/50 dark:to-indigo-950/80 border-2 border-indigo-500/50 hover:border-indigo-400 backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 transform cursor-pointer">
              <p className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                50,000+
              </p>
              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-extrabold mt-1 sm:mt-2">
                Mock Sessions
              </p>
            </div>
            <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-600/25 to-rose-700/30 dark:from-purple-900/60 dark:via-pink-900/50 dark:to-purple-950/80 border-2 border-purple-500/50 hover:border-purple-400 backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 transform cursor-pointer">
              <p className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                94.8%
              </p>
              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-extrabold mt-1 sm:mt-2">
                Placement Rate
              </p>
            </div>
            <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-teal-600/25 to-blue-700/30 dark:from-cyan-900/60 dark:via-teal-900/50 dark:to-blue-950/80 border-2 border-cyan-500/50 hover:border-cyan-400 backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 transform cursor-pointer">
              <p className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                &lt; 1.2s
              </p>
              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-extrabold mt-1 sm:mt-2">
                AI Evaluation Speed
              </p>
            </div>
            <div className="p-3.5 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-600/25 to-pink-700/30 dark:from-amber-900/60 dark:via-orange-900/50 dark:to-pink-950/80 border-2 border-amber-500/50 hover:border-amber-400 backdrop-blur-md flex flex-col items-center justify-center text-center group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 transform cursor-pointer">
              <p className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent group-hover:scale-110 transition-transform duration-300">
                100%
              </p>
              <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-200 font-extrabold mt-1 sm:mt-2">
                Dynamic Questions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY LOGOS SLIDER / GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          Prepares candidates for top tech hiring standards
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8">
          <div className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-blue-500/30 hover:border-blue-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 transform cursor-pointer">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-500 via-red-500 via-yellow-500 to-green-500 bg-clip-text text-transparent">
              Google
            </span>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-cyan-500/30 hover:border-cyan-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 transition-all duration-300 transform cursor-pointer">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-400 bg-clip-text text-transparent">
              Microsoft
            </span>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-amber-500/30 hover:border-amber-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 transform cursor-pointer">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-amber-400 via-orange-500 to-yellow-400 bg-clip-text text-transparent">
              Amazon
            </span>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-105 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 transform cursor-pointer">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Meta
            </span>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-rose-500/30 hover:border-rose-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20 transition-all duration-300 transform cursor-pointer">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 bg-clip-text text-transparent">
              Netflix
            </span>
          </div>
          <div className="px-5 py-2.5 rounded-2xl bg-white/60 dark:bg-slate-900/60 border border-emerald-500/30 hover:border-emerald-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 transition-all duration-300 transform cursor-pointer">
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              Uber
            </span>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Everything You Need for a{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              Startup & FAANG Offer
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-base">
            Integrated full-stack features combining speech recognition, code execution, resume ATS scanning, and Gemini intelligence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className={`p-8 rounded-3xl ${item.bg} ${item.border} ${item.shadow} backdrop-blur-md hover:-translate-y-2.5 hover:scale-[1.03] transition-all duration-300 transform cursor-pointer group flex flex-col gap-4 relative overflow-hidden`}
              >
                <div className={`w-14 h-14 rounded-2xl ${item.iconBg} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className={`text-xl font-extrabold bg-gradient-to-r ${item.titleGradient} bg-clip-text text-transparent`}>
                  {item.title}
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed font-semibold">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl p-10 sm:p-16 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">4 Simple Steps</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">
            How the{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Simulator Works
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-slate-950/80 border-2 border-indigo-500/40 hover:border-indigo-400 backdrop-blur-md flex flex-col gap-3 group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/40 transition-all duration-300 transform cursor-pointer">
            <span className="text-4xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">
              01
            </span>
            <h4 className="text-lg font-extrabold bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Select Role & Company
            </h4>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              Choose your target company (Google, Amazon, Startup X), role, difficulty, and question format.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-600/30 via-teal-600/20 to-slate-950/80 border-2 border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md flex flex-col gap-3 group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/40 transition-all duration-300 transform cursor-pointer">
            <span className="text-4xl font-black bg-gradient-to-r from-cyan-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">
              02
            </span>
            <h4 className="text-lg font-extrabold bg-gradient-to-r from-cyan-200 to-teal-200 bg-clip-text text-transparent">
              AI Generates Questions
            </h4>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              Gemini AI constructs real-time technical or HR questions based on current hiring benchmarks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-600/30 via-pink-600/20 to-slate-950/80 border-2 border-rose-500/40 hover:border-rose-400 backdrop-blur-md flex flex-col gap-3 group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-rose-500/40 transition-all duration-300 transform cursor-pointer">
            <span className="text-4xl font-black bg-gradient-to-r from-rose-400 via-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">
              03
            </span>
            <h4 className="text-lg font-extrabold bg-gradient-to-r from-rose-200 to-pink-200 bg-clip-text text-transparent">
              Speak or Code Solution
            </h4>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              Answer verbally using Speech-to-Text or write code in our interactive editor with camera proctoring.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-slate-950/80 border-2 border-amber-500/40 hover:border-amber-400 backdrop-blur-md flex flex-col gap-3 group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-amber-500/40 transition-all duration-300 transform cursor-pointer">
            <span className="text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform origin-left">
              04
            </span>
            <h4 className="text-lg font-extrabold bg-gradient-to-r from-amber-200 to-orange-200 bg-clip-text text-transparent">
              Get Instant PDF Report
            </h4>
            <p className="text-xs text-slate-300 font-semibold leading-relaxed">
              Review detailed scores, missing concepts, strengths, weaknesses, and export your official PDF report.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Student &{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Recruiter Feedback
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Trusted by CS students for final-year placement prep and hackathon demonstrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pavan */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-500/20 via-purple-600/25 to-indigo-900/40 dark:from-indigo-900/60 dark:via-purple-900/50 dark:to-slate-900/90 border-2 border-indigo-500/40 hover:border-indigo-400 backdrop-blur-md flex flex-col gap-4 group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 transform cursor-pointer">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current drop-shadow" />
              ))}
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed font-medium">
              "The AI mock interviews helped me identify my weak areas and improve the way I answer technical questions. The instant feedback makes interview preparation much more effective."
            </p>

            <div className="flex items-center gap-3 mt-auto">
              <img
                src="/testimonials/pavan.jpeg"
                alt="Pavan"
                className="w-12 h-12 rounded-full object-cover object-top shrink-0 border-2 border-indigo-400 p-0.5 shadow-md shadow-indigo-500/40 group-hover:scale-110 transition-transform"
              />

              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Pavan
                </p>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                  B.Tech CSE • RGUKT RK Valley
                </p>
              </div>
            </div>
          </div>

          {/* Basha */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-purple-500/20 via-pink-600/25 to-rose-900/40 dark:from-purple-900/60 dark:via-pink-900/50 dark:to-slate-900/90 border-2 border-purple-500/40 hover:border-purple-400 backdrop-blur-md flex flex-col gap-4 group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 transform cursor-pointer">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current drop-shadow" />
              ))}
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed font-medium">
              "The practice lab and AI feedback helped me understand how to structure my answers better. It feels much closer to a real interview than normal question practice."
            </p>

            <div className="flex items-center gap-3 mt-auto">
              <img
                src="/testimonials/basha.jpeg"
                alt="Basha"
                className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-purple-400 p-0.5 shadow-md shadow-purple-500/40 group-hover:scale-110 transition-transform"
                style={{
                  objectPosition: "50% 18%",
                }}
              />

              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Basha
                </p>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                  B.Tech CSE • RGUKT RK Valley
                </p>
              </div>
            </div>
          </div>

          {/* Yashwanth Sai */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-500/20 via-teal-600/25 to-blue-900/40 dark:from-cyan-900/60 dark:via-teal-900/50 dark:to-slate-900/90 border-2 border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md flex flex-col gap-4 group hover:-translate-y-2 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform cursor-pointer">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current drop-shadow" />
              ))}
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 italic leading-relaxed font-medium">
              "The interview simulator gave me a clear idea of how technical interviews are structured. The detailed feedback and practice questions made my preparation more focused and consistent."
            </p>

            <div className="flex items-center gap-3 mt-auto">
              <img
                src="/testimonials/yashwanth.jpeg"
                alt="Yashwanth Sai"
                className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-cyan-400 p-0.5 shadow-md shadow-cyan-500/40 group-hover:scale-110 transition-transform"
                style={{
                  objectPosition: "50% 22%",
                }}
              />
              <div>
                <p className="text-xs font-black text-slate-900 dark:text-white bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
                  Yashwanth Sai
                </p>

                <p className="text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
                  B.Tech CSE • RGUKT RK Valley
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-pink-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Everything you need to know about the platform.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            const themes = [
              {
                bg: "bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-indigo-900/30 dark:from-indigo-900/50 dark:via-purple-900/40 dark:to-slate-900/80",
                border: "border-2 border-indigo-500/40 hover:border-indigo-400",
                shadow: "hover:shadow-indigo-500/30",
                icon: "text-indigo-400",
              },
              {
                bg: "bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-teal-900/30 dark:from-cyan-900/50 dark:via-blue-900/40 dark:to-slate-900/80",
                border: "border-2 border-cyan-500/40 hover:border-cyan-400",
                shadow: "hover:shadow-cyan-500/30",
                icon: "text-cyan-400",
              },
              {
                bg: "bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-purple-900/30 dark:from-rose-900/50 dark:via-pink-900/40 dark:to-slate-900/80",
                border: "border-2 border-rose-500/40 hover:border-rose-400",
                shadow: "hover:shadow-rose-500/30",
                icon: "text-rose-400",
              },
              {
                bg: "bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-yellow-900/30 dark:from-amber-900/50 dark:via-orange-900/40 dark:to-slate-900/80",
                border: "border-2 border-amber-500/40 hover:border-amber-400",
                shadow: "hover:shadow-amber-500/30",
                icon: "text-amber-400",
              },
            ];
            const theme = themes[idx % themes.length];

            return (
              <div
                key={idx}
                className={`rounded-2xl ${theme.bg} ${theme.border} ${theme.shadow} backdrop-blur-md hover:-translate-y-1 hover:scale-[1.01] transition-all duration-300 transform cursor-pointer overflow-hidden`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left font-extrabold text-slate-900 dark:text-white text-base group"
                >
                  <span className="group-hover:text-indigo-300 transition-colors">{faq.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className={`w-5 h-5 ${theme.icon}`} />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
                  )}
                </button>

                {openFaq === idx && (
                  <div className="px-6 pb-4 text-sm text-slate-700 dark:text-slate-200 leading-relaxed border-t border-slate-200/50 dark:border-slate-800/80 pt-3 font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
