import React from "react";

interface ScoreBadgeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = "md", showLabel = true }) => {
  let colorClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
  let text = "Excellent";

  if (score < 60) {
    colorClass = "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30";
    text = "Needs Improvement";
  } else if (score < 80) {
    colorClass = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30";
    text = "Good Fit";
  }

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm font-semibold",
    lg: "px-4 py-1.5 text-base font-bold",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${colorClass} ${sizeClasses[size]}`}
    >
      <span>{score}%</span>
      {showLabel && <span className="opacity-80 font-normal">({text})</span>}
    </span>
  );
};
