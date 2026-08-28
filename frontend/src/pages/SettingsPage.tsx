import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Settings, Sun, Moon, Camera, Bell, Sparkles } from "lucide-react";

// Singleton Web Audio API Synth Chime for tactile hover feedback
let sharedSettingsAudioCtx: AudioContext | null = null;
let lastSettingsChimeTime = 0;

const playSettingsChime = (freq = 640) => {
  const now = Date.now();
  if (now - lastSettingsChimeTime < 100) return;
  lastSettingsChimeTime = now;

  try {
    if (!sharedSettingsAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      sharedSettingsAudioCtx = new AudioCtx();
    }

    if (sharedSettingsAudioCtx.state === "suspended") {
      sharedSettingsAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedSettingsAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Ignore audio policies
  }
};

export const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-black uppercase tracking-wider w-fit shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Platform Preferences & Controls
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Simulator Settings & Calibrations
        </h1>
        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium max-w-2xl leading-relaxed">
          Customize your AI proctoring defaults, notifications, and theme appearances for a tailored mock interview experience.
        </p>
      </div>

      {/* Outer Settings Main Box Container */}
      <div
        onMouseEnter={() => playSettingsChime(540)}
        className="relative overflow-hidden group bg-gradient-to-br from-[#12111E] via-[#161527] to-[#0D0B18] border-2 border-indigo-500/50 hover:border-indigo-400/90 rounded-2xl px-5 sm:px-7 py-4 sm:py-5 shadow-2xl shadow-indigo-500/20 flex flex-col gap-3.5 transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_15px_40px_rgba(99,102,241,0.25)] transition-all duration-300 cursor-pointer"
      >
        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-[350px] h-[350px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
        {/* Top glowing beam light line */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20" />

        {/* 1. Theme Mode Card Box */}
        <div
          onMouseEnter={(e) => {
            e.stopPropagation();
            playSettingsChime(620);
          }}
          className="relative overflow-hidden group/card py-3 px-4 sm:px-5 rounded-xl bg-slate-900/90 border-2 border-indigo-500/30 hover:border-indigo-400/90 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xl shadow-indigo-950/40 transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_10px_25px_rgba(99,102,241,0.3)] transition-all duration-300 cursor-pointer"
        >
          {/* Glowing line overlay */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-md shrink-0 group-hover/card:scale-105 transition-transform duration-300">
              {isDarkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-400" />}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 group-hover/card:text-indigo-300 transition-colors">
                Theme Appearance Mode
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Switch between dark high-contrast mode and light mode
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              playSettingsChime(750);
              toggleDarkMode();
            }}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-xs shadow-md shadow-indigo-500/40 border border-indigo-300/40 transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
          >
            {isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          </button>
        </div>

        {/* 2. Webcam Eye Contact Proctoring Card Box */}
        <div
          onMouseEnter={(e) => {
            e.stopPropagation();
            playSettingsChime(680);
          }}
          className="relative overflow-hidden group/card py-3 px-4 sm:px-5 rounded-xl bg-slate-900/90 border-2 border-emerald-500/30 hover:border-emerald-400/90 flex items-center justify-between gap-3 shadow-xl shadow-emerald-950/40 transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_10px_25px_rgba(16,185,129,0.3)] transition-all duration-300 cursor-pointer"
        >
          {/* Glowing line overlay */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shadow-md shrink-0 group-hover/card:scale-105 transition-transform duration-300">
              <Camera className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 group-hover/card:text-emerald-300 transition-colors">
                Webcam Eye Contact Proctoring
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Enable live video proctoring & posture alerts during active mock interviews
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={proctoringEnabled}
              onChange={(e) => {
                playSettingsChime(700);
                setProctoringEnabled(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-emerald-600 peer-checked:to-teal-500 shadow-md"></div>
          </label>
        </div>

        {/* 3. Weekly Assessment Email Digest Card Box */}
        <div
          onMouseEnter={(e) => {
            e.stopPropagation();
            playSettingsChime(720);
          }}
          className="relative overflow-hidden group/card py-3 px-4 sm:px-5 rounded-xl bg-slate-900/90 border-2 border-amber-500/30 hover:border-amber-400/90 flex items-center justify-between gap-3 shadow-xl shadow-amber-950/40 transform hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_10px_25px_rgba(245,158,11,0.3)] transition-all duration-300 cursor-pointer"
        >
          {/* Glowing line overlay */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-300 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0 group-hover/card:scale-105 transition-transform duration-300">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 group-hover/card:text-amber-300 transition-colors">
                Weekly Assessment Email Digest
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                Receive performance summaries, skill growth analytics, and new practice challenges
              </p>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0" onClick={(e) => e.stopPropagation()}>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => {
                playSettingsChime(740);
                setEmailAlerts(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-800 border border-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-600 peer-checked:to-purple-600 shadow-md"></div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
