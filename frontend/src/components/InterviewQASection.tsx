import React, { useState } from "react";
import {
  INTERVIEW_QUESTIONS,
  QA_CATEGORIES,
  QACategory,
  QAQuestion,
} from "../data/interviewQAData";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Copy,
  Check,
  Terminal,
  Code,
  Coffee,
  Cpu,
  Users,
  Network,
  Database,
  HardDrive,
  Globe,
  Boxes,
  Layers,
  Sparkles,
  HelpCircle,
  Lightbulb,
} from "lucide-react";

// Icon mapping helper
const categoryIconMap: Record<string, React.ElementType> = {
  Users,
  Terminal,
  Coffee,
  Cpu,
  Code,
  Network,
  Database,
  HardDrive,
  Globe,
  Boxes,
  Layers,
  Sparkles,
};

export const InterviewQASection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<QACategory | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([INTERVIEW_QUESTIONS[0]?.id || ""]));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    const allIds = filteredQuestions.map((q) => q.id);
    setExpandedIds(new Set(allIds));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const handleCopyAnswer = (question: QAQuestion, event: React.MouseEvent) => {
    event.stopPropagation();
    const textToCopy = `Question: ${question.question}\n\nAnswer: ${question.answer}${
      question.keyPoints ? `\n\nKey Points:\n- ${question.keyPoints.join("\n- ")}` : ""
    }${question.codeExample ? `\n\nCode Example:\n${question.codeExample}` : ""}`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedId(question.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredQuestions = INTERVIEW_QUESTIONS.filter((q) => {
    const matchesCat = selectedCategory === "ALL" || q.category === selectedCategory;
    const matchesQuery =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.keyPoints && q.keyPoints.some((kp) => kp.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchesCat && matchesQuery;
  });

  const activeCategoryInfo = QA_CATEGORIES.find((c) => c.id === selectedCategory);

  return (
    <div className="bg-white dark:bg-[#121218] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 lg:p-8 shadow-xl flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-500/20 shadow-md">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                OPTION 2.2
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Self-Paced Learning & Study
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              Interview Questions & Answers
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
          Study frequently asked technical and HR interview questions. Click any question card to reveal the interview-ready answer, key discussion points, and code snippets.
        </p>
      </div>

      {/* Category Pills Slider */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100 dark:border-slate-800/60">
        <button
          type="button"
          onClick={() => setSelectedCategory("ALL")}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border ${
            selectedCategory === "ALL"
              ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
              : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          All Subjects ({INTERVIEW_QUESTIONS.length})
        </button>

        {QA_CATEGORIES.map((cat) => {
          const Icon = categoryIconMap[cat.iconName] || HelpCircle;
          const count = INTERVIEW_QUESTIONS.filter((q) => q.category === cat.id).length;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-1.5 border ${
                isSelected
                  ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-500/20"
                  : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-400"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.title}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                isSelected ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Toolbar: Category Info, Search & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            {activeCategoryInfo ? (
              <>
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {activeCategoryInfo.title} Questions
              </>
            ) : (
              <>
                <BookOpen className="w-4 h-4 text-purple-500" />
                All Categories Questions ({filteredQuestions.length})
              </>
            )}
          </h3>
          {activeCategoryInfo && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {activeCategoryInfo.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>

          {/* Expand/Collapse Actions */}
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
          >
            Collapse
          </button>
        </div>
      </div>

      {/* Accordion Questions List */}
      {filteredQuestions.length === 0 ? (
        <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            No questions found matching your search.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Try resetting the search filter or selecting a different subject category.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filteredQuestions.map((q, index) => {
            const isExpanded = expandedIds.has(q.id);
            const isCopied = copiedId === q.id;

            const difficultyColor =
              q.difficulty === "Easy"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : q.difficulty === "Medium"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

            return (
              <div
                key={q.id}
                className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? "border-purple-500/40 bg-purple-50/30 dark:bg-purple-950/10 shadow-md"
                    : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#16161e] hover:border-purple-300 dark:hover:border-purple-900"
                }`}
              >
                {/* Accordion Header / Question Line */}
                <button
                  type="button"
                  onClick={() => toggleExpand(q.id)}
                  className="w-full p-4 sm:p-5 text-left flex items-start justify-between gap-3 cursor-pointer group"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-purple-600/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      Q{index + 1}
                    </span>

                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition leading-snug">
                        {q.question}
                      </h4>

                      <div className="flex items-center gap-2 mt-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {q.category}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${difficultyColor}`}>
                          {q.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hidden sm:inline group-hover:underline">
                      {isExpanded ? "Hide Answer" : "Show Answer"}
                    </span>
                    <div className="w-8 h-8 rounded-xl bg-slate-200/60 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                {/* Expanded Answer Content */}
                {isExpanded && (
                  <div className="px-4 pb-5 sm:px-5 sm:pb-6 pt-2 border-t border-purple-500/10 dark:border-purple-500/10 flex flex-col gap-4 animate-in fade-in duration-200">
                    {/* Answer Header & Copy button */}
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Ideal Candidate Answer
                      </span>

                      <button
                        type="button"
                        onClick={(e) => handleCopyAnswer(q, e)}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 hover:text-purple-600 dark:hover:text-purple-300 transition flex items-center gap-1.5"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" /> Copy Answer
                          </>
                        )}
                      </button>
                    </div>

                    {/* Answer text */}
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-[#101015] p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
                      {q.answer}
                    </p>

                    {/* Key Discussion Points */}
                    {q.keyPoints && q.keyPoints.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-purple-500/5 dark:bg-purple-500/10 border border-purple-500/20">
                        <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 block mb-1.5">
                          Key Talking Points for Interviewer:
                        </span>
                        <ul className="flex flex-col gap-1">
                          {q.keyPoints.map((point, pIdx) => (
                            <li key={pIdx} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0" />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Optional Code Example */}
                    {q.codeExample && (
                      <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#0A0B10]">
                        <div className="bg-[#14151F] px-3.5 py-1.5 text-[11px] font-mono font-bold text-purple-400 border-b border-slate-800 flex items-center justify-between">
                          <span>Code Example</span>
                          <span className="text-[10px] text-slate-500">Syntax Snippet</span>
                        </div>
                        <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                          <code>{q.codeExample}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
