import React, { useState } from "react";
import {
  Video,
  Play,
  CheckCircle,
  ExternalLink,
  Sparkles,
  UserCheck,
  Code,
  BookOpen,
  Award,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

export interface PrepVideo {
  id: string;
  title: string;
  channel: string;
  category: string;
  description: string;
  youtubeUrl: string;
  embedUrl: string;
  thumbnailUrl: string;
  keyPoints: string[];
  icon: React.ReactNode;
  cardGradient: string;
  borderStyle: string;
  activeRing: string;
  badgeStyle: string;
  glowShadow: string;
}

// EXACTLY 6 VERIFIED REAL INTERVIEW PREPARATION VIDEOS WITH RICH DISTINCT COLORING
const PREP_VIDEOS: PrepVideo[] = [
  {
    id: "f2zRCoObJ1E",
    title: 'How To Answer "Tell Me About Yourself"',
    channel: "Indeed India",
    category: "INTERVIEW BASICS",
    description: "Learn how to give a clear, confident and professional self-introduction during a job interview.",
    youtubeUrl: "https://www.youtube.com/watch?v=f2zRCoObJ1E",
    embedUrl: "https://www.youtube.com/embed/f2zRCoObJ1E",
    thumbnailUrl: "https://img.youtube.com/vi/f2zRCoObJ1E/hqdefault.jpg",
    icon: <UserCheck className="w-4 h-4 text-indigo-300" />,
    cardGradient: "from-[#1e1b4b]/85 via-[#2e1065]/70 to-[#0f172a]/95",
    borderStyle: "border-indigo-500/40 hover:border-indigo-400/90",
    activeRing: "border-indigo-400 ring-2 ring-indigo-400/40 shadow-indigo-500/30",
    badgeStyle: "bg-indigo-500/25 border-indigo-400/40 text-indigo-200",
    glowShadow: "hover:shadow-indigo-500/20",
    keyPoints: [
      "Use Present -> Past -> Future structure",
      "Focus 70% of talk time on quantifiable accomplishments",
      "Explain clearly why this specific role excites you"
    ]
  },
  {
    id: "xTg5igTYxtA",
    title: "HR Round Interview Tips, Questions & Answers",
    channel: "CareerVidz",
    category: "HR INTERVIEW",
    description: "Prepare for common HR interview questions and learn how to answer them professionally.",
    youtubeUrl: "https://www.youtube.com/watch?v=xTg5igTYxtA",
    embedUrl: "https://www.youtube.com/embed/xTg5igTYxtA",
    thumbnailUrl: "https://img.youtube.com/vi/xTg5igTYxtA/hqdefault.jpg",
    icon: <Award className="w-4 h-4 text-fuchsia-300" />,
    cardGradient: "from-[#3b0764]/85 via-[#581c87]/70 to-[#0f172a]/95",
    borderStyle: "border-fuchsia-500/40 hover:border-fuchsia-400/90",
    activeRing: "border-fuchsia-400 ring-2 ring-fuchsia-400/40 shadow-fuchsia-500/30",
    badgeStyle: "bg-fuchsia-500/25 border-fuchsia-400/40 text-fuchsia-200",
    glowShadow: "hover:shadow-fuchsia-500/20",
    keyPoints: [
      "Prepare answers for common behavioral questions",
      "Demonstrate strong soft skills and cultural fit",
      "Show genuine enthusiasm for the company mission"
    ]
  },
  {
    id: "rAxOebp_iG0",
    title: "Mistakes to Avoid During a Job Interview",
    channel: "Learn English | Let's Talk",
    category: "INTERVIEW TIPS",
    description: "Learn the common mistakes candidates make during job interviews and how to avoid them.",
    youtubeUrl: "https://www.youtube.com/watch?v=rAxOebp_iG0",
    embedUrl: "https://www.youtube.com/embed/rAxOebp_iG0",
    thumbnailUrl: "https://img.youtube.com/vi/rAxOebp_iG0/hqdefault.jpg",
    icon: <AlertTriangle className="w-4 h-4 text-amber-300" />,
    cardGradient: "from-[#451a03]/85 via-[#78350f]/60 to-[#0f172a]/95",
    borderStyle: "border-amber-500/40 hover:border-amber-400/90",
    activeRing: "border-amber-400 ring-2 ring-amber-400/40 shadow-amber-500/30",
    badgeStyle: "bg-amber-500/25 border-amber-400/40 text-amber-200",
    glowShadow: "hover:shadow-amber-500/20",
    keyPoints: [
      "Avoid badmouthing past employers or teammates",
      "Structure clear concise answers without rambling",
      "Prepare 2-3 thoughtful questions to ask interviewers"
    ]
  },
  {
    id: "E5Uj_66NZwI",
    title: "Common Job Interview Mistakes You Need To Avoid",
    channel: "The Companies Expert",
    category: "INTERVIEW STRATEGY",
    description: "Learn common interview mistakes from a former CEO and understand what recruiters and hiring managers expect from candidates.",
    youtubeUrl: "https://www.youtube.com/watch?v=E5Uj_66NZwI",
    embedUrl: "https://www.youtube.com/embed/E5Uj_66NZwI",
    thumbnailUrl: "https://img.youtube.com/vi/E5Uj_66NZwI/hqdefault.jpg",
    icon: <BookOpen className="w-4 h-4 text-cyan-300" />,
    cardGradient: "from-[#082f49]/85 via-[#0369a1]/60 to-[#0f172a]/95",
    borderStyle: "border-cyan-500/40 hover:border-cyan-400/90",
    activeRing: "border-cyan-400 ring-2 ring-cyan-400/40 shadow-cyan-500/30",
    badgeStyle: "bg-cyan-500/25 border-cyan-400/40 text-cyan-200",
    glowShadow: "hover:shadow-cyan-500/20",
    keyPoints: [
      "Understand what hiring managers look for in answers",
      "Highlight problem-solving initiative and business impact",
      "Maintain authentic, relaxed confidence throughout"
    ]
  },
  {
    id: "8S0FDjFBj8o",
    title: "Official Google Technical & Coding Interview Example",
    channel: "Google Career",
    category: "TECHNICAL INTERVIEW",
    description: "Learn how to prepare for technical and coding interviews, including problem solving and answering technical questions.",
    youtubeUrl: "https://www.youtube.com/watch?v=8S0FDjFBj8o",
    embedUrl: "https://www.youtube.com/embed/8S0FDjFBj8o",
    thumbnailUrl: "https://img.youtube.com/vi/8S0FDjFBj8o/hqdefault.jpg",
    icon: <Code className="w-4 h-4 text-emerald-300" />,
    cardGradient: "from-[#064e3b]/85 via-[#047857]/60 to-[#0f172a]/95",
    borderStyle: "border-emerald-500/40 hover:border-emerald-400/90",
    activeRing: "border-emerald-400 ring-2 ring-emerald-400/40 shadow-emerald-500/30",
    badgeStyle: "bg-emerald-500/25 border-emerald-400/40 text-emerald-200",
    glowShadow: "hover:shadow-emerald-500/20",
    keyPoints: [
      "Talk through constraints and edge cases before coding",
      "Explain time & space complexity (Big-O) out loud",
      "Test code line-by-line with sample inputs"
    ]
  },
  {
    id: "IbJLFOenhpw",
    title: "Confident Body Language in a Job Interview",
    channel: "Mark Bowden",
    category: "COMMUNICATION & BODY LANGUAGE",
    description: "Learn how to use confident posture, professional body language, eye contact, and non-verbal communication effectively during job interviews.",
    youtubeUrl: "https://www.youtube.com/watch?v=IbJLFOenhpw",
    embedUrl: "https://www.youtube.com/embed/IbJLFOenhpw",
    thumbnailUrl: "https://img.youtube.com/vi/IbJLFOenhpw/hqdefault.jpg",
    icon: <MessageSquare className="w-4 h-4 text-rose-300" />,
    cardGradient: "from-[#701a75]/85 via-[#831843]/60 to-[#0f172a]/95",
    borderStyle: "border-rose-500/40 hover:border-rose-400/90",
    activeRing: "border-rose-400 ring-2 ring-rose-400/40 shadow-rose-500/30",
    badgeStyle: "bg-rose-500/25 border-rose-400/40 text-rose-200",
    glowShadow: "hover:shadow-rose-500/20",
    keyPoints: [
      "Sit upright with slight forward lean to show engagement",
      "Keep hands visible and uncrossed above desk level",
      "Sustain natural 60-70% eye contact with interviewer"
    ]
  }
];

export const VideoPrepSection: React.FC = () => {
  // Single active playing video state
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  const handlePlayVideo = (id: string) => {
    setActiveVideoId(id);
  };

  return (
    <section className="bg-gradient-to-br from-[#070913] via-[#0d0f22] to-[#15122e] border border-purple-500/20 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl flex flex-col gap-8 text-white relative overflow-hidden max-w-7xl mx-auto w-full">
      {/* Ambient Deep Navy & Purple Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-purple-500/20 pb-6 gap-4 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-lg shadow-purple-500/25 shrink-0 border border-purple-400/30">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 bg-purple-500/20 px-3 py-0.5 rounded-full border border-purple-400/30">
              SECTION 1
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
              1. Preparation Through Videos
            </h2>
          </div>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
          Watch curated interview preparation masterclasses below. Click play on any thumbnail, or click <strong>Watch on YouTube ↗</strong> to view directly on YouTube.
        </p>
      </div>

      {/* Responsive 2-Column Desktop Grid / 1-Column Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
        {PREP_VIDEOS.map((video) => {
          const isPlaying = activeVideoId === video.id;

          return (
            <div
              key={video.id}
              className={`p-4 sm:p-5 rounded-3xl bg-gradient-to-br ${video.cardGradient} backdrop-blur-md border transition-all duration-300 flex flex-col justify-start gap-4 shadow-xl ${video.glowShadow} ${
                isPlaying
                  ? video.activeRing
                  : `${video.borderStyle} hover:-translate-y-1.5`
              }`}
            >
              <div className="flex flex-col gap-3">
                {/* Category Badge & Watch on YouTube Fallback Link */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-lg border flex items-center gap-1.5 ${video.badgeStyle}`}>
                      {video.icon}
                      <span>{video.category}</span>
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-200 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-700/80">
                      {video.channel}
                    </span>
                  </div>

                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 hover:text-white font-extrabold text-xs border border-purple-500/40 transition flex items-center gap-1.5 shadow-md group/yt shrink-0"
                    title="Open on YouTube in a new tab"
                  >
                    <span>Watch on YouTube ↗</span>
                    <ExternalLink className="w-3.5 h-3.5 group-hover/yt:translate-x-0.5 transition-transform" />
                  </a>
                </div>

                {/* 16:9 VIDEO CONTAINER (THUMBNAIL VS IFRAME PLAYER) */}
                <div className="w-full aspect-video rounded-2xl border border-slate-700/80 bg-black overflow-hidden relative shadow-xl group">
                  {isPlaying ? (
                    /* Active Iframe Player with autoplay=1 & rel=0 */
                    <iframe
                      src={`${video.embedUrl}?autoplay=1&rel=0`}
                      title={video.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen={true}
                    />
                  ) : (
                    /* 16:9 Real YouTube Thumbnail Preview Card with Center Purple Play Button */
                    <div
                      onClick={() => handlePlayVideo(video.id)}
                      className="w-full h-full cursor-pointer relative group/thumb flex items-center justify-center overflow-hidden bg-slate-950"
                    >
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500 opacity-90 group-hover/thumb:opacity-100"
                      />

                      {/* Dark overlay for contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0b16]/85 via-black/30 to-black/20 group-hover/thumb:bg-black/30 transition-all duration-300" />

                      {/* CENTER PURPLE PLAY BUTTON */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-purple-600 via-indigo-600 to-fuchsia-600 text-white flex items-center justify-center shadow-2xl shadow-purple-600/60 group-hover/thumb:scale-110 group-hover/thumb:from-purple-500 group-hover/thumb:to-fuchsia-500 transition-all duration-300 border-2 border-white/40 backdrop-blur-sm">
                          <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
                        </div>
                      </div>

                      {/* Click to Play Badge */}
                      <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 text-[11px] font-black text-white flex items-center gap-1.5 backdrop-blur-md border border-white/10 shadow-lg">
                        <Play className="w-3 h-3 fill-purple-400 text-purple-400" />
                        <span>Click to Play</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="text-base font-black text-white leading-snug">
                    {video.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                    {video.description}
                  </p>
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="pt-3 border-t border-white/10 flex flex-col gap-1.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Key Takeaways
                </span>
                <ul className="flex flex-col gap-1">
                  {video.keyPoints.map((point, idx) => (
                    <li key={idx} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
