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
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
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
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {loading ? (
        <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Fetching candidate report archives...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center flex flex-col items-center justify-center gap-4 text-slate-400">
          <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700" />
          <p className="text-base font-bold text-slate-700 dark:text-slate-300">No Reports Found</p>
          <p className="text-xs max-w-sm">Complete your first AI interview session to generate executive reports.</p>
          <Link
            to="/setup"
            className="mt-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg transition"
          >
            Start New AI Interview
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 sm:p-5 lg:p-6 rounded-3xl bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-500/40 transition-all flex flex-col justify-between gap-6"
            >
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                    {report.difficulty} • {report.type}
                  </span>
                  <ScoreBadge score={report.overallScore} size="sm" />
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-indigo-500" /> {report.company}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Briefcase className="w-3.5 h-3.5" /> {report.role}
                  </p>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 italic">
                  "{report.finalAiRemark}"
                </p>

                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> {new Date(report.date).toLocaleDateString()}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/report/${report.id}`}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-xs hover:bg-indigo-100 transition flex items-center justify-center gap-1"
                  >
                    View Detail <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => generateCandidatePDFReport(report)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                    title="Export PDF Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(report.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                  title="Delete Report"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
