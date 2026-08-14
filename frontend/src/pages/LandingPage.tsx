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
    },
    {
      icon: Mic,
      title: "Real-time Voice Recognition",
      desc: "Speak your answers directly via Web Speech API. Practice articulate verbal delivery and natural interview pacing.",
    },
    {
      icon: Camera,
      title: "AI Eye Contact & Proctoring",
      desc: "Webcam live stream with posture and eye contact monitoring to build candidate confidence under pressure.",
    },
    {
      icon: FileCheck,
      title: "ATS Resume Analyzer",
      desc: "Instant ATS score, skill extraction, bullet point rewrite recommendations, and target role skill gap analysis.",
    },
    {
      icon: Terminal,
      title: "Interactive Code Console",
      desc: "Solve live coding challenges in JavaScript, Python, C++, Java with test runner execution and AI feedback.",
    },
    {
      icon: Award,
      title: "PDF Executive Reports",
      desc: "Download comprehensive 5-axis competency breakdown PDF reports with actionable strengths & weaknesses.",
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
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Next-Gen AI Campus Placement & Technical Mock Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] max-w-4xl mb-6">
            Master Technical Interviews with{" "}
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Real-time AI Simulation
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-10 leading-relaxed font-normal">
            Simulate realistic FAANG technical & HR interview loops with voice speech recognition, live webcam proctoring, ATS resume parsing, and instant AI answer evaluations.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md">
            <Link
              to={isAuthenticated ? "/setup" : "/login?unregistered=true"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base shadow-xl shadow-indigo-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Start Free AI Interview</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to={isAuthenticated ? "/resume" : "/login?unregistered=true"}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-bold text-base hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all flex items-center justify-center gap-2"
            >
              <FileCheck className="w-5 h-5 text-indigo-500" />
              <span>Analyze Resume ATS</span>
            </Link>
          </div>

          {/* Proof stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl w-full mt-16 pt-12 border-t border-slate-200 dark:border-slate-800/80">
            <div>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">50,000+</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Mock Sessions Generated</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">94.8%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Placement Success Rate</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">&lt; 1.2s</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Gemini AI Evaluation Speed</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">100%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Dynamic Questions</p>
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY LOGOS SLIDER / GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
          Prepares candidates for top tech hiring standards
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-75 grayscale hover:grayscale-0 transition-all">
          <span className="text-xl font-bold tracking-tighter text-slate-700 dark:text-slate-300">Google</span>
          <span className="text-xl font-bold tracking-tighter text-slate-700 dark:text-slate-300">Microsoft</span>
          <span className="text-xl font-bold tracking-tighter text-slate-700 dark:text-slate-300">Amazon</span>
          <span className="text-xl font-bold tracking-tighter text-slate-700 dark:text-slate-300">Meta</span>
          <span className="text-xl font-bold tracking-tighter text-slate-700 dark:text-slate-300">Netflix</span>
          <span className="text-xl font-bold tracking-tighter text-slate-700 dark:text-slate-300">Uber</span>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mb-4">
            Everything You Need for a Startup & FAANG Offer
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
                className="p-8 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all group flex flex-col gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-slate-900 text-white rounded-3xl p-10 sm:p-16 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">4 Simple Steps</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold mt-2">How the Simulator Works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
          <div className="flex flex-col gap-3">
            <span className="text-4xl font-black text-indigo-500">01</span>
            <h4 className="text-lg font-bold">Select Role & Company</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose your target company (Google, Amazon, Startup X), role, difficulty, and question format.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-4xl font-black text-indigo-500">02</span>
            <h4 className="text-lg font-bold">AI Generates Questions</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Gemini AI constructs real-time technical or HR questions based on current hiring benchmarks.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-4xl font-black text-indigo-500">03</span>
            <h4 className="text-lg font-bold">Speak or Code Solution</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Answer verbally using Speech-to-Text or write code in our interactive editor with camera proctoring.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-4xl font-black text-indigo-500">04</span>
            <h4 className="text-lg font-bold">Get Instant PDF Report</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Review detailed scores, missing concepts, strengths, weaknesses, and export your official PDF report.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
            Student & Recruiter Feedback
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Trusted by CS students for final-year placement prep and hackathon demonstrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
              "The AI mock interviews helped me identify my weak areas and improve the way I answer technical questions. The instant feedback makes interview preparation much more effective."
            </p>

            <div className="flex items-center gap-3 mt-auto">
              <img
                src="/testimonials/pavan.jpeg"
                alt="Pavan"
                className="w-12 h-12 rounded-full object-cover object-top shrink-0"
              />

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Pavan
                </p>

                <p className="text-[11px] text-slate-500">
                  B.Tech CSE • RGUKT RK Valley
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
              "The practice lab and AI feedback helped me understand how to structure my answers better. It feels much closer to a real interview than normal question practice."
            </p>

            <div className="flex items-center gap-3 mt-auto">
              <img
                src="/testimonials/basha.jpeg"
                alt="Basha"
                className="w-12 h-12 rounded-full object-cover shrink-0"
                style={{
                  objectPosition: "50% 18%",
                  transform: "scale(1.18)",
                }}
              />

              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Basha
                </p>

                <p className="text-[11px] text-slate-500">
                  B.Tech CSE • RGUKT RK Valley
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 italic">
              "The interview simulator gave me a clear idea of how technical interviews are structured. The detailed feedback and practice questions made my preparation more focused and consistent."
            </p>

            <div className="flex items-center gap-3 mt-auto">
              <img
                src="/testimonials/yashwanth.jpeg"
                alt="Yashwanth Sai"
                className="w-12 h-12 rounded-full object-cover shrink-0"
                style={{
                  objectPosition: "50% 22%",
                  transform: "scale(1.35)",
                }}
              />
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Yashwanth Sai
                </p>

                <p className="text-[11px] text-slate-500">
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
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">Frequently Asked Questions</h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm">Everything you need to know about the platform.</p>
        </div>

        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#15151A] overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-bold text-slate-900 dark:text-white text-base"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-5 h-5 text-indigo-500" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </button>

              {openFaq === idx && (
                <div className="px-6 pb-4 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
