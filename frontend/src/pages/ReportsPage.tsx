import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../services/api";
import { FinalReport } from "../types";
import { ScoreBadge } from "../components/ScoreBadge";
import { generateCandidatePDFReport } from "../services/pdfService";
import {
  FileText,
  Search,
  Download,
  Trash2,
  Calendar,
  Building2,
  Briefcase,
  ChevronRight,
} from "lucide-react";

const REPORT_COLOR_THEMES = [
  {
    border: "border-teal-500/50 hover:border-teal-400/80 shadow-teal-500/10",
    gradient: "from-teal-900/50 via-emerald-900/35 to-slate-950",
    badge: "bg-teal-500/20 text-teal-300 border border-teal-400/30",
    iconColor: "text-teal-400",
    btnBg: "bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-400/30",
  },
  {
    border: "border-cyan-500/50 hover:border-cyan-400/80 shadow-cyan-500/10",
    gradient: "from-cyan-900/50 via-blue-900/35 to-slate-950",
    badge: "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30",
    iconColor: "text-cyan-400",
    btnBg: "bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30",
  },
  {
    border: "border-violet-500/50 hover:border-violet-400/80 shadow-violet-500/10",
    gradient: "from-violet-900/50 via-fuchsia-900/35 to-slate-950",
    badge: "bg-violet-500/20 text-violet-300 border border-violet-400/30",
    iconColor: "text-violet-400",
    btnBg: "bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 border border-violet-400/30",
  },
  {
    border: "border-amber-500/50 hover:border-amber-400/80 shadow-amber-500/10",
    gradient: "from-amber-900/50 via-orange-900/35 to-slate-950",
    badge: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
    iconColor: "text-amber-400",
    btnBg: "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-400/30",
  },
];

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<FinalReport[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        const res = await apiService.getReports({ search });
        setReports(res.reports);
      } catch (err) {
        console.error("Error loading reports:", err);
      } finally {
        setLoading(false);
      }
    }
    loadReports();
  }, [search]);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm(
      "Delete this interview permanently?\n\n" +
      "This interview will be removed from Reports and Dashboard statistics. " +
      "Your leaderboard score and rank may also change.\n\n" +
      "This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiService.deleteReport(id);

      setReports((prev) =>
        prev.filter((report) => report.id !== id)
      );
    } catch (error) {
      console.error(
        "Failed to delete interview:",
        error
      );

      window.alert(
        "Unable to delete this interview. Please try again."
      );
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20 text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" /> Assessment Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Interview Reports & Transcripts
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Access past performance reports, download executive PDF transcripts, and monitor historical trends.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-teal-500/40 bg-slate-900/90 text-white text-xs sm:text-sm focus:ring-2 focus:ring-teal-400 outline-none shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching candidate report archives...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="relative overflow-hidden bg-[#15151A] border border-teal-500/40 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 text-slate-400 shadow-xl group">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/40 via-emerald-900/30 to-slate-950 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
          <FileText className="relative z-10 w-12 h-12 text-teal-400" />
          <p className="relative z-10 text-base font-extrabold text-white">No Reports Found</p>
          <p className="relative z-10 text-xs max-w-sm text-slate-300">Complete your first AI interview session to generate executive reports.</p>
          <Link
            to="/setup"
            className="relative z-10 mt-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-extrabold text-xs shadow-lg transition"
          >
            Start New AI Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {reports.map((report, idx) => {
            const theme = REPORT_COLOR_THEMES[idx % REPORT_COLOR_THEMES.length];
            return (
              <div
                key={report.id}
                className={`relative overflow-hidden p-4 sm:p-5 lg:p-6 rounded-3xl bg-[#15151A] border ${theme.border} shadow-2xl transform hover:-translate-y-2.5 hover:scale-[1.025] transition-all duration-500 flex flex-col justify-between gap-6 group cursor-pointer`}
              >
                {/* Dynamic color background fill overlay that smoothly fades out on mouse enter */}
                <div className={`absolute inset-0 bg-gradient-to-br ${theme.gradient} group-hover:opacity-20 transition-opacity duration-500 pointer-events-none`} />
                {/* Top glowing light beam when box pops forward */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <span className={`px-3 py-1 rounded-full ${theme.badge} text-[11px] font-extrabold`}>
                      {report.difficulty} • {report.type}
                    </span>
                    <ScoreBadge score={report.overallScore} size="sm" />
                  </div>

                  <div className="mt-1">
                    <h3 className="text-lg font-black text-white flex items-center gap-1.5 group-hover:text-slate-100 transition-colors">
                      <Building2 className={`w-4 h-4 ${theme.iconColor}`} /> {report.company}
                    </h3>
                    <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {report.role}
                    </p>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2 italic leading-relaxed">
                    "{report.finalAiRemark}"
                  </p>

                  <div className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(report.date).toLocaleDateString()}
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/report/${report.id}`}
                      className={`w-full sm:w-auto px-3.5 py-2 rounded-xl ${theme.btnBg} font-extrabold text-xs transition flex items-center justify-center gap-1`}
                    >
                      View Detail <ChevronRight className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      onClick={() => generateCandidatePDFReport(report)}
                      className="p-2 rounded-xl border border-white/20 hover:bg-white/10 text-white transition"
                      title="Export PDF Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleDelete(report.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 transition"
                    title="Delete Report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
