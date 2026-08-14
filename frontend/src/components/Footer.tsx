import React from "react";
import { Sparkles, Mail, Phone, Github, Linkedin } from "lucide-react";

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0F0F12] text-slate-600 dark:text-slate-400 text-xs py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-1 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-slate-900 dark:text-white">AI Interview Simulator</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Practice technical and HR interviews, analyze resumes, improve weak areas, and build confidence with AI-powered feedback and career guidance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-2">
            <p className="font-bold text-slate-900 dark:text-white mb-1">Interview Tools</p>
            <a href="#/setup" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Company Specific Loops</a>
            <a href="#/practice" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Algorithmic Practice Sandbox</a>
            <a href="#/resume" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">ATS Resume Score Scanner</a>
            <a href="#/leaderboard" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition">Candidate Leaderboard</a>
          </div>

          {/* Project Features */}
          <div className="flex flex-col gap-2">
            <p className="font-bold text-slate-900 dark:text-white mb-1">
              Project Features
            </p>

            <span>AI Mock Interviews</span>
            <span>Resume ATS Analysis</span>
            <span>Career Intelligence</span>
            <span>Practice Lab & Reports</span>
            <span>Real Candidate Leaderboard</span>
          </div>  

          {/* Creator Contact */}
          <div className="flex flex-col gap-2">
            <p className="font-bold text-slate-900 dark:text-white mb-1">
              Creator & Contact
            </p>

            <p className="font-semibold text-slate-700 dark:text-slate-300">
              S Vignesh
            </p>

            <a
              href="mailto:vigni9866@gmail.com"
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <Mail className="w-3.5 h-3.5" />
              vigni9866@gmail.com
            </a>

            <a
              href="tel:+91 8500535949"
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <Phone className="w-3.5 h-3.5" />
              +91 8500535949
            </a>

            <a
              href="https://github.com/VigneshSirivella"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub : https://github.com/vigneshSirivella
            </a>

          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 dark:text-slate-400">
        <p>
          © 2026 AI Interview Simulator. Created by S Vignesh.
        </p>

        <p className="text-center sm:text-right">
          Learn • Practice • Improve • Succeed
        </p>
      </div>
    </div>
    </footer>
    
  );
};
