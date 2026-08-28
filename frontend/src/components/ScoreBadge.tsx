import React from "react";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = "md", showLabel = true }) => {
  let colorClass = "bg-gradient-to-r from-emerald-600/50 via-teal-600/40 to-slate-950 border-2 border-emerald-400 text-emerald-200 shadow-lg shadow-emerald-500/30";
  let text = "Excellent";

  if (score < 60) {
    colorClass = "bg-gradient-to-r from-rose-600/50 via-pink-600/40 to-slate-950 border-2 border-rose-400 text-rose-100 shadow-lg shadow-rose-500/30";
    text = "Needs Improvement";
  } else if (score < 80) {
    colorClass = "bg-gradient-to-r from-amber-600/50 via-orange-600/40 to-slate-950 border-2 border-amber-400 text-amber-100 shadow-lg shadow-amber-500/30";
    text = "Good Fit";
  }

  const sizeClasses = {
    sm: "px-2.5 py-0.5 text-xs font-black",
    md: "px-3.5 py-1 text-sm font-black",
    lg: "px-4 py-2 text-base font-black",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-2xl ${colorClass} ${sizeClasses[size]} backdrop-blur-md hover:scale-105 transition-all duration-300 transform cursor-pointer`}
    >
      <span className="text-white drop-shadow font-extrabold">{score}%</span>
      {showLabel && <span className="font-bold text-white/90">({text})</span>}
    </span>
  );
};
