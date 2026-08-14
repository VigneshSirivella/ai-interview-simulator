import React, { useEffect, useState } from "react";
import { apiService } from "../services/api";
import { LeaderboardEntry, Achievement } from "../types";
import { ScoreBadge } from "../components/ScoreBadge";
import { useAuth } from "../context/AuthContext";
import { Trophy, Medal, Award, Flame, Sparkles, CheckCircle2, Shield, User } from "lucide-react";

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await apiService.getLeaderboard();
        setLeaderboard(res.leaderboard);
        setAchievements(res.achievements);
      } catch (err) {
        console.error("Error loading leaderboard:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Fetching global candidate rankings & badges...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-6 sm:gap-8 lg:gap-10 overflow-x-hidden">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
          <Trophy className="w-3.5 h-3.5" /> Candidate Ranking
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Global Candidate Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Top engineering candidates evaluated across FAANG-level mock technical & HR interview loops.
        </p>
      </div>

      {/* TOP 3 PODIUM CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-end">
        {/* Rank 2 - Silver */}
        {leaderboard[1] && (
          <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center gap-3 relative order-2 md:order-1">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-lg flex items-center justify-center border-2 border-slate-300">
              #2
            </div>
            {leaderboard[1].avatar ? (
              <img
                src={leaderboard[1].avatar}
                alt={leaderboard[1].name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-slate-300"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black ring-4 ring-slate-300">
                {(leaderboard[1].name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {leaderboard[1].name}
              </h3>
              <p className="text-xs text-slate-500">{leaderboard[1].targetRole}</p>
            </div>
            <ScoreBadge score={leaderboard[1].averageScore} size="md" />
            <p className="text-[11px] text-slate-400">{leaderboard[1].totalInterviews} Mock Loops Completed</p>
          </div>
        )}

        {/* Rank 1 - Gold */}
        {leaderboard[0] && (
          <div className="p-5 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-b from-amber-500/10 via-white to-white dark:via-[#15151A] dark:to-[#15151A] border-2 border-amber-400 shadow-xl flex flex-col items-center text-center gap-3 relative order-1 md:order-2">
            <div className="absolute -top-5 px-4 py-1 rounded-full bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest shadow-md flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 fill-current" /> Champion #1
            </div>
            {leaderboard[0].avatar ? (
              <img
                src={leaderboard[0].avatar}
                alt={leaderboard[0].name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-amber-400 mt-2"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-black ring-4 ring-amber-400 mt-2">
                {(leaderboard[0].name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg">
                {leaderboard[0].name}
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{leaderboard[0].targetRole}</p>
            </div>
            <ScoreBadge score={leaderboard[0].averageScore} size="lg" />
            <p className="text-xs text-slate-500 font-medium">{leaderboard[0].totalInterviews} Mock Loops Completed</p>
          </div>
        )}

        {/* Rank 3 - Bronze */}
        {leaderboard[2] && (
          <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center gap-3 relative order-3">
            <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-400 font-extrabold text-lg flex items-center justify-center border-2 border-amber-700/40">
              #3
            </div>
            {leaderboard[2].avatar ? (
              <img
                src={leaderboard[2].avatar}
                alt={leaderboard[2].name}
                className="w-16 h-16 rounded-full object-cover ring-4 ring-amber-700/40"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xl font-black ring-4 ring-amber-700/40">
                {(leaderboard[2].name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                {leaderboard[2].name}
              </h3>
              <p className="text-xs text-slate-500">{leaderboard[2].targetRole}</p>
            </div>
            <ScoreBadge score={leaderboard[2].averageScore} size="md" />
            <p className="text-[11px] text-slate-400">{leaderboard[2].totalInterviews} Mock Loops Completed</p>
          </div>
        )}
      </div>

      {/* FULL LEADERBOARD TABLE */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
          Complete Candidate Standings
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-2">Rank</th>
                <th className="pb-3 px-2">Candidate</th>
                <th className="pb-3 px-2">Target Role</th>
                <th className="pb-3 px-2">Interviews Completed</th>
                <th className="pb-3 px-2">Top Skill Badges</th>
                <th className="pb-3 px-2 text-right">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {leaderboard.map((entry) => {
                const role = entry.targetRole || (entry as any).topRole || "Software Engineer";
                const score = entry.averageScore ?? (entry as any).avgScore ?? 85;
                const interviews = entry.totalInterviews ?? (entry as any).interviewsCompleted ?? 0;
                const skills = entry.topSkills || ["Algorithms", "Problem Solving"];
                const isCurrentUser =
                  user &&
                  ((entry as any).email && (entry as any).email.toLowerCase() === user.email.toLowerCase() ||
                    entry.id === user.id ||
                    entry.name.toLowerCase() === user.name.toLowerCase());

                return (
                  <tr
                    key={entry.rank}
                    className={`transition ${
                      isCurrentUser
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600 font-bold"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <td className="py-4 px-2 font-black text-slate-900 dark:text-white text-base">
                      #{entry.rank}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        {entry.avatar ? (
                          <img
                            src={entry.avatar}
                            alt={entry.name}
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
                            {(entry.name || "U").charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{entry.name}</span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider">
                                YOU
                              </span>
                            )}
                          </div>
                          {(entry as any).badge && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                              {(entry as any).badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-slate-600 dark:text-slate-300 font-medium">
                      {role}
                    </td>
                    <td className="py-4 px-2 text-slate-500 font-mono font-bold">
                      {interviews}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex flex-wrap gap-1">
                        {skills.map((sk, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-semibold"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <ScoreBadge score={score} size="sm" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACHIEVEMENTS & BADGES */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-500" /> Unlockable Engineering Badges
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Earn badges by practicing technical coding loops, achieving high Gemini score streaks, and scanning ATS resumes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-5 rounded-2xl border flex flex-col gap-2 transition ${
                ach.unlocked
                  ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-900 dark:text-indigo-200"
                  : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{ach.icon}</span>
                {ach.unlocked && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                    Unlocked
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{ach.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{ach.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
