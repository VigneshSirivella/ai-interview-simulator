import React from "react";
import { Sparkles, Mail, Phone, Github, Linkedin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-100/50 dark:bg-[#0A0E1A]/90 backdrop-blur-xl text-slate-600 dark:text-slate-400 text-xs py-14 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Col */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">AI Interview Simulator</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
              Practice technical and HR interviews, analyze resumes, conquer algorithms, and build confidence with real-time AI feedback and insights.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-[11px] font-bold w-fit">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Powered by Google Gemini AI
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2.5">
            <p className="font-extrabold text-slate-900 dark:text-white mb-1 uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">Interview Tools</p>
            <a href="#/setup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">Company Mock Loops</a>
            <a href="#/practice" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">Coding & Algorithm Lab</a>
            <a href="#/resume" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">ATS Resume Scanner</a>
            <a href="#/leaderboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium">Global Candidate Leaderboard</a>
          </div>

          {/* Project Features */}
          <div className="flex flex-col gap-2.5">
            <p className="font-extrabold text-slate-900 dark:text-white mb-1 uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
              Platform Modules
            </p>
            <span className="font-medium">Real-Time Voice Analysis</span>
            <span className="font-medium">Webcam Posture & Eye Contact</span>
            <span className="font-medium">AI Feedback & Scorecard</span>
            <span className="font-medium">Target Company Customization</span>
            <span className="font-medium">Candidate Performance Matrix</span>
          </div>  

          {/* Creator Contact */}
          <div className="flex flex-col gap-3">
            <p className="font-extrabold text-slate-900 dark:text-white mb-1 uppercase tracking-wider text-[11px] text-indigo-600 dark:text-indigo-400">
              Creator & Contact
            </p>
            <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              S Vignesh
            </p>

            <a
              href="mailto:vigni9866@gmail.com"
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
            >
              <Mail className="w-3.5 h-3.5 text-indigo-500" />
              vigni9866@gmail.com
            </a>

            <a
              href="tel:+918500535949"
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-500" />
              +91 8500535949
            </a>

            <a
              href="https://github.com/VigneshSirivella"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition font-medium"
            >
              <Github className="w-3.5 h-3.5 text-indigo-500" />
              github.com/VigneshSirivella
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-400 font-medium">
          <p>
            © 2026 AI Interview Simulator. Designed for high-impact software engineering preparation.
          </p>
          <p className="text-center sm:text-right text-indigo-600 dark:text-indigo-400 font-bold">
            Learn • Practice • Excel • Get Hired
          </p>
        </div>
      </div>
    </footer>
    
  );
};
