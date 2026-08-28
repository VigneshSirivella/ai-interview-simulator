import React, { useEffect, useState, useRef } from "react";
import { apiService } from "../services/api";
import { LeaderboardEntry, Achievement } from "../types";
import { ScoreBadge } from "../components/ScoreBadge";
import { useAuth } from "../context/AuthContext";
import { Trophy, Medal, Award, Flame, Sparkles, CheckCircle2, Shield, User, Info, Zap } from "lucide-react";

// Singleton Web Audio API Synth Chime for badge hover sound
let sharedBadgeAudioCtx: AudioContext | null = null;
let lastBadgeChimeTime = 0;

const playBadgeChime = () => {
  const now = Date.now();
  if (now - lastBadgeChimeTime < 100) return; // Throttle chime rate
  lastBadgeChimeTime = now;

  try {
    if (!sharedBadgeAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      sharedBadgeAudioCtx = new AudioCtx();
    }

    if (sharedBadgeAudioCtx.state === "suspended") {
      sharedBadgeAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedBadgeAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
  }
};

const LeaderboardCandidateAvatar: React.FC<{
  candidate: LeaderboardEntry;
  isCurrentUser: boolean;
  currentUser: any;
  sizeClass?: string;
  initialsSizeClass?: string;
}> = ({ candidate, isCurrentUser, currentUser, sizeClass = "w-9 h-9", initialsSizeClass = "text-xs font-bold" }) => {
  const [hasError, setHasError] = useState(false);

  const customAvatar = isCurrentUser ? (localStorage.getItem("user_custom_avatar") || currentUser?.profilePicture) : null;
  const avatarSrc = customAvatar || candidate?.avatar;

  useEffect(() => {
    setHasError(false);
  }, [avatarSrc]);

  if (avatarSrc && !hasError) {
    return (
      <img
        src={avatarSrc}
        alt={candidate.name}
        onError={() => setHasError(true)}
        className={`${sizeClass} rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-sm transition-transform hover:scale-110`}
      />
    );
  }

  return (
    <div className={`${sizeClass} rounded-full bg-indigo-600 text-white flex items-center justify-center ${initialsSizeClass} transition-transform hover:scale-110`}>
      {(candidate?.name || "U").charAt(0).toUpperCase()}
    </div>
  );
};

interface HoverBadgePillProps {
  label: string;
  detail: string;
  baseColor: string;
  hoverGradient: string;
  icon?: string;
}

const HoverBadgePill: React.FC<HoverBadgePillProps> = ({
  label,
  detail,
  baseColor,
  hoverGradient,
  icon,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    playBadgeChime();
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <div
        className={`px-3 py-1 rounded-full border text-[11px] font-extrabold flex items-center gap-1.5 transition-all duration-300 transform ${
          isHovered
            ? `${hoverGradient} scale-110 shadow-lg -translate-y-0.5 ring-2 ring-white/30`
            : baseColor
        }`}
      >
        <span>{icon || "✨"}</span>
        <span>{label}</span>
      </div>

      {/* Dynamic Hover Tooltip Popup */}
      {isHovered && (
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-2xl border border-slate-700 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-1.5 font-bold text-amber-300 text-[11px] mb-1">
            <Zap className="w-3.5 h-3.5" /> Badge Unlocked
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">{detail}</p>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700"></div>
        </div>
      )}
    </div>
  );
};

export const LeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCandidate, setHoveredCandidate] = useState<string | null>(null);

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
          <Trophy className="w-3.5 h-3.5 animate-bounce" /> Interactive Leaderboard & Badges
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
          Global Candidate Leaderboard
          <span className="text-xs font-normal text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20">
            Hover Badges for Details
          </span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Top engineering candidates evaluated across FAANG-level mock technical & HR interview loops.
        </p>
      </div>

      {/* TOP 3 PODIUM CARDS WITH INTERACTIVE MOUSE HOVER EFFECTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-end">
        {/* Rank 2 - Silver */}
        {leaderboard[1] && (
          <div
            onMouseEnter={() => playBadgeChime()}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#15151A] border-2 border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center gap-3 relative order-2 md:order-1 hover:border-slate-400 hover:shadow-2xl hover:shadow-slate-500/10 transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-extrabold text-lg flex items-center justify-center border-2 border-slate-300 group-hover:rotate-12 transition-transform">
              #2
            </div>
            <LeaderboardCandidateAvatar
              candidate={leaderboard[1]}
              isCurrentUser={Boolean(user && (leaderboard[1].name.toLowerCase() === user.name.toLowerCase() || leaderboard[1].id === user.id))}
              currentUser={user}
              sizeClass="w-16 h-16 ring-4 ring-slate-300 shadow-md group-hover:ring-slate-400"
              initialsSizeClass="text-xl font-black"
            />
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {leaderboard[1].name}
              </h3>
              <p className="text-xs text-slate-500">{leaderboard[1].targetRole}</p>
            </div>
            <ScoreBadge score={leaderboard[1].averageScore} size="md" />

            {/* Interactive Badges Row */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              <HoverBadgePill
                label="Diamond Tier"
                icon="🥈"
                detail="Ranked #2 globally in evaluation performance"
                baseColor="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                hoverGradient="bg-gradient-to-r from-slate-700 to-slate-900 text-white border-slate-500 shadow-slate-500/30"
              />
              <HoverBadgePill
                label="90%+ Accuracy"
                icon="⚡"
                detail="Consistently scores over 90% technical accuracy"
                baseColor="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                hoverGradient="bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-purple-500/40"
              />
              <HoverBadgePill
                label="ATS Verified"
                icon="🛡️"
                detail="Resume parsed with 85%+ ATS compatibility score"
                baseColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                hoverGradient="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-emerald-500/40"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-1">{leaderboard[1].totalInterviews} Mock Loops Completed</p>
          </div>
        )}

        {/* Rank 1 - Gold */}
        {leaderboard[0] && (
          <div
            onMouseEnter={() => playBadgeChime()}
            className="p-5 sm:p-6 lg:p-8 rounded-3xl bg-gradient-to-b from-amber-500/20 via-white to-white dark:via-[#15151A] dark:to-[#15151A] border-2 border-amber-400 shadow-2xl flex flex-col items-center text-center gap-3 relative order-1 md:order-2 transform hover:-translate-y-3.5 hover:scale-[1.035] hover:shadow-amber-500/40 transition-all duration-500 group overflow-hidden cursor-pointer"
          >
            {/* Top glowing light beam when box opens/moves forward */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="absolute -top-5 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-widest shadow-xl flex items-center gap-1.5 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4 fill-current animate-pulse" /> Grandmaster #1
            </div>
            <LeaderboardCandidateAvatar
              candidate={leaderboard[0]}
              isCurrentUser={Boolean(user && (leaderboard[0].name.toLowerCase() === user.name.toLowerCase() || leaderboard[0].id === user.id))}
              currentUser={user}
              sizeClass="w-20 h-20 ring-4 ring-amber-400 mt-2 shadow-xl group-hover:ring-amber-300"
              initialsSizeClass="text-2xl font-black"
            />
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-lg flex items-center justify-center gap-1.5 group-hover:text-amber-500 transition-colors">
                {leaderboard[0].name}
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500 animate-spin" />
              </h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{leaderboard[0].targetRole}</p>
            </div>
            <ScoreBadge score={leaderboard[0].averageScore} size="lg" />

            {/* Interactive Badges Row */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              <HoverBadgePill
                label="Grandmaster"
                icon="👑"
                detail="Undisputed #1 Global Leaderboard Champion"
                baseColor="bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40"
                hoverGradient="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 text-slate-950 border-amber-300 shadow-amber-500/50"
              />
              <HoverBadgePill
                label="FAANG Ready"
                icon="🚀"
                detail="Achieved 85%+ score on Hard Technical Loops"
                baseColor="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20"
                hoverGradient="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-300 shadow-indigo-500/40"
              />
              <HoverBadgePill
                label="10x Streak"
                icon="🔥"
                detail="10 consecutive high-scoring mock interviews"
                baseColor="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                hoverGradient="bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-300 shadow-rose-500/40"
              />
            </div>

            <p className="text-xs text-slate-500 font-medium">{leaderboard[0].totalInterviews} Mock Loops Completed</p>
          </div>
        )}

        {/* Rank 3 - Bronze */}
        {leaderboard[2] && (
          <div
            onMouseEnter={() => playBadgeChime()}
            className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#15151A] border-2 border-slate-200 dark:border-slate-800 shadow-md flex flex-col items-center text-center gap-3 relative order-3 hover:border-amber-700/40 hover:shadow-2xl hover:shadow-amber-900/10 transform hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 group"
          >
            <div className="w-12 h-12 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-400 font-extrabold text-lg flex items-center justify-center border-2 border-amber-700/40 group-hover:-rotate-12 transition-transform">
              #3
            </div>
            <LeaderboardCandidateAvatar
              candidate={leaderboard[2]}
              isCurrentUser={Boolean(user && (leaderboard[2].name.toLowerCase() === user.name.toLowerCase() || leaderboard[2].id === user.id))}
              currentUser={user}
              sizeClass="w-16 h-16 ring-4 ring-amber-700/40 shadow-md"
              initialsSizeClass="text-xl font-black"
            />
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                {leaderboard[2].name}
              </h3>
              <p className="text-xs text-slate-500">{leaderboard[2].targetRole}</p>
            </div>
            <ScoreBadge score={leaderboard[2].averageScore} size="md" />

            {/* Interactive Badges Row */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-1">
              <HoverBadgePill
                label="Master Tier"
                icon="🥉"
                detail="Top 3 Global Podium Finisher"
                baseColor="bg-amber-700/10 text-amber-700 dark:text-amber-400 border-amber-700/30"
                hoverGradient="bg-gradient-to-r from-amber-700 to-amber-900 text-white border-amber-500 shadow-amber-700/40"
              />
              <HoverBadgePill
                label="Voice Virtuoso"
                icon="🎙️"
                detail="Completed full 1-on-1 interview using live speech recognition"
                baseColor="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                hoverGradient="bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-blue-300 shadow-blue-500/40"
              />
              <HoverBadgePill
                label="Top Communicator"
                icon="🎯"
                detail="Scored 90%+ clarity & communication rating"
                baseColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                hoverGradient="bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-emerald-300 shadow-emerald-500/40"
              />
            </div>

            <p className="text-[11px] text-slate-400 mt-1">{leaderboard[2].totalInterviews} Mock Loops Completed</p>
          </div>
        )}
      </div>

      {/* FULL LEADERBOARD TABLE WITH BADGES COLUMN */}
      <div className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Medal className="w-5 h-5 text-indigo-500" /> Complete Candidate Standings & Badges
            </h3>
            <p className="text-xs text-slate-500">Real-time candidate evaluation rank with earned achievement badges.</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            {leaderboard.length} Candidates Ranked
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="pb-3 px-2">Rank</th>
                <th className="pb-3 px-2">Candidate</th>
                <th className="pb-3 px-2">Target Role</th>
                <th className="pb-3 px-2">Earned Badges</th>
                <th className="pb-3 px-2">Interviews</th>
                <th className="pb-3 px-2 text-right">Avg Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {leaderboard.map((entry) => {
                const role = entry.targetRole || (entry as any).topRole || "Software Engineer";
                const score = entry.averageScore ?? (entry as any).avgScore ?? 85;
                const interviews = entry.totalInterviews ?? (entry as any).interviewsCompleted ?? 0;
                const isCurrentUser =
                  user &&
                  (((entry as any).email && (entry as any).email.toLowerCase() === user.email.toLowerCase()) ||
                    entry.id === user.id ||
                    entry.name.toLowerCase() === user.name.toLowerCase());

                // Generate dynamic badges per candidate rank
                const candidateBadges = [];
                if (entry.rank === 1) {
                  candidateBadges.push({ label: "Grandmaster", detail: "#1 Candidate Globally", icon: "👑", baseColor: "bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40", hoverGradient: "bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950 border-amber-300 shadow-amber-500/50" });
                  candidateBadges.push({ label: "FAANG Ace", detail: "Scored 85%+ on Hard Loop", icon: "🚀", baseColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", hoverGradient: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-300 shadow-indigo-500/40" });
                  candidateBadges.push({ label: "10x Streak", detail: "10 active interview loops", icon: "🔥", baseColor: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20", hoverGradient: "bg-gradient-to-r from-rose-500 to-red-600 text-white border-rose-300 shadow-rose-500/40" });
                } else if (entry.rank === 2) {
                  candidateBadges.push({ label: "Diamond Tier", detail: "Top 2 Rank Globally", icon: "💎", baseColor: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30", hoverGradient: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-300 shadow-purple-500/40" });
                  candidateBadges.push({ label: "90%+ Accuracy", detail: "Over 90% technical accuracy", icon: "⚡", baseColor: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20", hoverGradient: "bg-gradient-to-r from-indigo-500 to-blue-600 text-white border-indigo-300 shadow-indigo-500/40" });
                  candidateBadges.push({ label: "ATS Ninja", detail: "ATS compatibility > 80%", icon: "🛡️", baseColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20", hoverGradient: "bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-emerald-300 shadow-emerald-500/40" });
                } else if (entry.rank === 3) {
                  candidateBadges.push({ label: "Master Tier", detail: "Top 3 Rank Globally", icon: "🥉", baseColor: "bg-amber-700/15 text-amber-700 dark:text-amber-400 border-amber-700/30", hoverGradient: "bg-gradient-to-r from-amber-700 to-amber-900 text-white border-amber-500 shadow-amber-700/40" });
                  candidateBadges.push({ label: "Voice Virtuoso", detail: "Speech recognition expert", icon: "🎙️", baseColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20", hoverGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-300 shadow-blue-500/40" });
                } else if (score >= 85) {
                  candidateBadges.push({ label: "Platinum Pro", detail: "High evaluation score (85%+)", icon: "🌟", baseColor: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20", hoverGradient: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-300 shadow-cyan-500/40" });
                  candidateBadges.push({ label: "Tech Solver", detail: "Solid problem solving skills", icon: "🎯", baseColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700", hoverGradient: "bg-gradient-to-r from-slate-700 to-slate-900 text-white border-slate-500 shadow-slate-500/40" });
                } else {
                  candidateBadges.push({ label: "Rising Candidate", detail: "Active candidate in training", icon: "⚡", baseColor: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700", hoverGradient: "bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-300 shadow-indigo-500/40" });
                }

                return (
                  <tr
                    key={entry.rank}
                    className={`transition duration-200 ${
                      isCurrentUser
                        ? "bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600 font-bold"
                        : "hover:bg-indigo-50/30 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <td className="py-4 px-2 font-black text-slate-900 dark:text-white text-base">
                      #{entry.rank}
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <LeaderboardCandidateAvatar
                          candidate={entry}
                          isCurrentUser={Boolean(isCurrentUser)}
                          currentUser={user}
                          sizeClass="w-9 h-9"
                          initialsSizeClass="text-xs font-bold"
                        />
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white">{entry.name}</span>
                            {isCurrentUser && (
                              <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-sm animate-pulse">
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
                    <td className="py-4 px-2">
                      <div className="flex flex-wrap gap-1.5">
                        {candidateBadges.map((b, i) => (
                          <HoverBadgePill
                            key={i}
                            label={b.label}
                            detail={b.detail}
                            icon={b.icon}
                            baseColor={b.baseColor}
                            hoverGradient={b.hoverGradient}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-slate-600 dark:text-slate-300 font-mono font-bold">
                      {interviews} loops
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

      {/* ACHIEVEMENTS & UNLOCKABLE BADGES SHOWCASE GALLERY WITH COLOR CHANGING HOVER EFFECTS */}
      <div className="p-5 sm:p-6 lg:p-8 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 gap-3">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" /> Interactive Badge Collection
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">
              Unlockable Candidate Badges & Rewards
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Hover mouse over any badge card to see dynamic color transformations, detail popups, and sound chimes!
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <Flame className="w-4 h-4 text-rose-500 animate-bounce" />
            <span>{achievements.filter(a => a.unlocked).length} / {achievements.length} Badges Unlocked</span>
          </div>
        </div>

        {/* BADGES GALLERY GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              id: "b_1",
              title: "👑 Grandmaster Rank #1",
              description: "Reach Rank #1 on the global candidate evaluation leaderboard.",
              icon: "👑",
              category: "Rank Mastery",
              unlocked: leaderboard[0] && user && leaderboard[0].name.toLowerCase() === user.name.toLowerCase(),
              progress: leaderboard[0] && user && leaderboard[0].name.toLowerCase() === user.name.toLowerCase() ? 100 : 85,
              req: "Rank #1 Global Standings",
              baseStyle: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
              hoverStyle: "hover:bg-gradient-to-br hover:from-amber-500 hover:to-yellow-600 hover:text-slate-950 hover:border-amber-300 hover:shadow-amber-500/40",
            },
            {
              id: "b_2",
              title: "🚀 FAANG Ace",
              description: "Achieve an overall score of 85%+ in a Hard difficulty interview loop.",
              icon: "🚀",
              category: "Interview Skill",
              unlocked: true,
              progress: 100,
              req: "Score >= 85% on Hard Loop",
              baseStyle: "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-300",
              hoverStyle: "hover:bg-gradient-to-br hover:from-indigo-600 hover:to-purple-700 hover:text-white hover:border-indigo-400 hover:shadow-indigo-500/40",
            },
            {
              id: "b_3",
              title: "🛡️ ATS Resume Ninja",
              description: "Score above 80% ATS Compatibility on your uploaded target resume.",
              icon: "📄",
              category: "Resume Optimization",
              unlocked: true,
              progress: 100,
              req: "ATS Resume Score >= 80%",
              baseStyle: "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
              hoverStyle: "hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-700 hover:text-white hover:border-emerald-300 hover:shadow-emerald-500/40",
            },
            {
              id: "b_4",
              title: "🎙️ Voice Virtuoso",
              description: "Complete an entire 1-on-1 interview using live voice speech recognition.",
              icon: "🎙️",
              category: "Speech & Delivery",
              unlocked: true,
              progress: 100,
              req: "Full Voice Response Loop",
              baseStyle: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
              hoverStyle: "hover:bg-gradient-to-br hover:from-blue-600 hover:to-cyan-700 hover:text-white hover:border-blue-300 hover:shadow-blue-500/40",
            },
            {
              id: "b_5",
              title: "🔥 Practice Marathoner",
              description: "Complete 10 full AI mock interview sessions.",
              icon: "🔥",
              category: "Consistency",
              unlocked: false,
              progress: 60,
              req: "10 Completed Mock Loops",
              baseStyle: "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300",
              hoverStyle: "hover:bg-gradient-to-br hover:from-rose-500 hover:to-red-700 hover:text-white hover:border-rose-300 hover:shadow-rose-500/40",
            },
            {
              id: "b_6",
              title: "🎥 Perfect Proctor Alignment",
              description: "Maintain 90%+ camera posture and face attention score during a live loop.",
              icon: "🎥",
              category: "Proctoring & Body Language",
              unlocked: true,
              progress: 100,
              req: "Proctor Posture Score >= 90%",
              baseStyle: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
              hoverStyle: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-700 hover:text-white hover:border-purple-300 hover:shadow-purple-500/40",
            },
          ].map((badge) => (
            <div
              key={badge.id}
              onMouseEnter={() => playBadgeChime()}
              className={`p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.03] shadow-md hover:shadow-2xl group cursor-pointer ${badge.baseStyle} ${badge.hoverStyle}`}
            >
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-2xl shadow-md border border-slate-200 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  {badge.icon}
                </div>
                {badge.unlocked ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-white group-hover:text-emerald-700 border border-emerald-500/30 text-[10px] font-black uppercase flex items-center gap-1 shadow-sm">
                    <CheckCircle2 className="w-3 h-3" /> Unlocked
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px] font-bold">
                    Locked
                  </span>
                )}
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider opacity-75 group-hover:opacity-100">
                  {badge.category}
                </span>
                <h4 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-white mt-0.5 transition-colors">
                  {badge.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-100 mt-1 leading-relaxed transition-colors">
                  {badge.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 group-hover:border-white/20 flex flex-col gap-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 group-hover:text-slate-200">
                  <span>Requirement: {badge.req}</span>
                  <span>{badge.progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 group-hover:bg-black/20 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      badge.unlocked ? "bg-indigo-600 group-hover:bg-white" : "bg-slate-400"
                    }`}
                    style={{ width: `${badge.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
