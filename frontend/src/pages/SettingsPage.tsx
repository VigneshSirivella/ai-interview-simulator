import React, { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Settings, Sun, Moon, Volume2, Camera, Bell, Shield } from "lucide-react";

export const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  const [speechRate, setSpeechRate] = useState(1.0);
  const [proctoringEnabled, setProctoringEnabled] = useState(true);
  const [autoRecord, setAutoRecord] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings className="w-3.5 h-3.5" /> Platform Preferences
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          Simulator Settings & Calibrations
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Configure AI speech synthesis speed, proctoring camera defaults, and theme appearances.
        </p>
      </div>

      <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col gap-6">
        {/* Appearance */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              {isDarkMode ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
              Theme Mode
            </h3>
            <p className="text-xs text-slate-500">Switch between light and dark high-contrast mode</p>
          </div>

          <button
            onClick={toggleDarkMode}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        {/* Text To Speech Speed */}
        <div className="flex flex-col gap-2 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-indigo-500" /> Speech Synthesis Playback Speed
            </h3>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {speechRate}x Speed
            </span>
          </div>
          <input
            type="range"
            min={0.75}
            max={1.5}
            step={0.05}
            value={speechRate}
            onChange={(e) => setSpeechRate(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer"
          />
        </div>

        {/* Webcam Proctoring */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-500" /> Webcam Eye Contact Proctoring
            </h3>
            <p className="text-xs text-slate-500">Enable camera live view during active mock interviews</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={proctoringEnabled}
              onChange={(e) => setProctoringEnabled(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>

        {/* Notifications */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500" /> Weekly Assessment Email Digest
            </h3>
            <p className="text-xs text-slate-500">Receive performance summaries and new practice challenges</p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
