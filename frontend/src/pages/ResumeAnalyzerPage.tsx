import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api";
import { ResumeATSResult } from "../types";
import { ScoreBadge } from "../components/ScoreBadge";
import {
  Sparkles,
  FileCheck,
  Upload,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  FileText,
  Target,
  Send,
  X,
  ArrowRight,
  Rocket,
  Award,
  Layers,
  Clock,
  Building2,
} from "lucide-react";

export const ResumeAnalyzerPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [resumeText, setResumeText] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [result, setResult] = useState<ResumeATSResult | null>(null);
  const [loading, setLoading] = useState(false);

  const [jobRecommendations, setJobRecommendations] =
    useState<
      {
        title: string;
        company?: string;
        category: string;
        reason: string;
        deadline?: string;
      }[]
    >([]);

  const [loadingJobs, setLoadingJobs] = useState(false);
  
  // File Upload states
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  const sampleResume = `ALEX VANCE
Software Engineer | alex@university.edu | github.com/alexvance

SUMMARY
Senior Computer Science student with strong foundations in React, TypeScript, Node.js, REST APIs, and PostgreSQL. Built scalable capstone web applications.

TECHNICAL SKILLS
Languages: JavaScript, TypeScript, Python, HTML/CSS, SQL
Frameworks & Tools: React 19, Express.js, Tailwind CSS, Vite, Git, PostgreSQL, REST APIs

PROJECTS
AI Interview Simulator (2026)
- Developed full-stack web application with React 19 and Express server.
- Integrated Google Gemini 3.6 API for real-time interview evaluation.
- Implemented speech recognition and jsPDF report exporter.

Distributed E-Commerce API (2025)
- Designed REST endpoints with Express and PostgreSQL handling 10k requests/sec.
- Implemented JWT token authentication and role-based middleware.

EDUCATION
B.Tech Computer Science Engineering — GPA: 3.8/4.0 (2022 - 2026)`;

  const handleFileRead = (uploadedFile: File) => {
    setFile(uploadedFile);
    
    // Read text file directly if text, md, json, txt
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text && text.trim().length > 10) {
        setResumeText(text);
      } else {
        // Fallback for PDF or binary files: create structured text metadata representation
        const simulatedText = `RESUME FILE: ${uploadedFile.name} (${Math.round(uploadedFile.size / 1024)} KB)
Target Position: ${targetRole}

Parsed Candidate Data:
Experience in Software Engineering, Full Stack Web Architecture, RESTful APIs, Cloud Systems, Data Structures & Algorithms, React, Node.js, TypeScript, and SQL databases.
Demonstrated leadership in collaborative capstone projects, backend microservices, and client-side performance optimizations.`;
        setResumeText(simulatedText);
      }
    };
    reader.readAsText(uploadedFile);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileRead(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileRead(e.target.files[0]);
    }
  };

  const handleFillSample = () => {
    setInputMode("paste");
    setResumeText(sampleResume);
    setFile(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
  e.preventDefault();

    if (!file && !resumeText.trim()) {
      alert("Please upload a resume or paste resume text.");
      return;
    }

    setLoading(true);

    try {
      let textToAnalyze = resumeText.trim();

      if (file) {
        const uploadedResume =
          await apiService.uploadResumeFile(file);

        textToAnalyze =
          uploadedResume.extracted_text?.trim();

        if (!textToAnalyze) {
          throw new Error(
            "Resume was uploaded, but no text could be extracted."
          );
        }
      }

      const response = await apiService.analyzeResume(
        textToAnalyze,
        targetRole
      );

      setResult(response.result);
      try {
        setLoadingJobs(true);

        const jobs =
          await apiService.getJobRecommendations(targetRole, Date.now());

        setJobRecommendations(
          jobs.recommendations || []
        );
      } catch (jobError) {
        console.error(
          "Failed to load career recommendations:",
          jobError
        );

        setJobRecommendations([]);
      } finally {
        setLoadingJobs(false);
      }
    } catch (error) {
      console.error("Resume analysis error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to analyze resume. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const launchTailoredInterview = () => {
    navigate("/setup", {
      state: {
        prefilledRole: targetRole,
        skills: result?.extractedSkills || [],
      },
    });
  };

  return (
    <div className="max-w-6xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
          <FileCheck className="w-3.5 h-3.5" /> AI Resume ATS & Career Advisor
        </div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white">
          Upload Resume for Smart AI Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
          Drop your resume (PDF, DOCX, TXT) to get instant ATS scores, missing skill alerts, and tailored mock interview recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* Left Form Box with Vibrant Background Fill & Hover Fade-Out */}
        <form
          onSubmit={handleAnalyze}
          className="relative overflow-hidden group lg:col-span-6 bg-[#15151A] border border-indigo-500/50 hover:border-indigo-400/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-indigo-500/10 flex flex-col gap-5 sm:gap-6 transform hover:-translate-y-3 hover:scale-[1.02] transition-all duration-500 cursor-pointer"
        >
          {/* Rich vibrant background color overlay that smoothly fades out on mouse enter */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 via-purple-900/40 to-slate-950 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none" />
          {/* Top glowing light beam when box opens/moves forward */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Centered Upload File Header */}
          <div className="relative z-10 flex items-center justify-center border-b border-indigo-500/30 pb-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600/40 via-purple-600/30 to-slate-900 border border-indigo-400/40 text-white text-xs font-black uppercase tracking-wider shadow-md">
              <Upload className="w-4 h-4 text-indigo-300" />
              <span>Upload Resume File</span>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div className="relative z-10 flex flex-col gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.doc,.txt,.rtf,.md"
              onChange={handleFileSelect}
              className="hidden"
            />

            {!file ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative overflow-hidden border-2 border-dashed rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-500 group/drop ${
                  isDragging
                    ? "border-indigo-400 bg-indigo-900/60 scale-[1.01]"
                    : "border-indigo-400/40 hover:border-indigo-400 bg-indigo-950/40"
                }`}
              >
                {/* Dropzone subtle background gradient tint */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-transparent group-hover/drop:opacity-30 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-10 w-14 h-14 rounded-2xl bg-indigo-500/30 text-indigo-200 flex items-center justify-center shadow-lg border border-indigo-400/30">
                  <Upload className="w-7 h-7 text-indigo-300" />
                </div>
                <div className="relative z-10">
                  <p className="text-sm font-extrabold text-white">
                    Drag & Drop your Resume here
                  </p>
                  <p className="text-xs text-indigo-200 mt-1">
                    Supports PDF, DOCX, TXT or RTF (Max 10MB)
                  </p>
                </div>
                <span className="relative z-10 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg transition">
                  Browse Resume File
                </span>
              </div>
            ) : (
              <div className="relative overflow-hidden p-3.5 sm:p-4 rounded-2xl border border-indigo-500/50 bg-indigo-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 group/file">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/30 to-purple-600/20 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-white truncate max-w-[200px] sm:max-w-[260px]">
                      {file.name}
                    </p>
                    <p className="text-[11px] text-indigo-200">
                      {Math.round(file.size / 1024)} KB • Ready for AI Audit
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    setResumeText("");
                  }}
                  className="relative z-10 p-1.5 rounded-lg text-indigo-300 hover:text-rose-400 hover:bg-rose-500/20 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Target Role Box with Vibrant Accent & Gradient Fill */}
          <div className="relative z-10">
            <label className="block text-xs font-black uppercase tracking-wider text-indigo-200 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-400" /> Target Job Role
            </label>
            <div className="relative">
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-indigo-500/50 bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 text-white font-extrabold text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none cursor-pointer shadow-lg transition-all duration-300 hover:border-indigo-400"
              >
                <option value="Software Engineer" className="bg-slate-900 text-white">Software Engineer</option>
                <option value="Frontend Engineer" className="bg-slate-900 text-white">Frontend Engineer</option>
                <option value="Backend Engineer" className="bg-slate-900 text-white">Backend Engineer</option>
                <option value="Full Stack Developer" className="bg-slate-900 text-white">Full Stack Developer</option>
                <option value="Data Scientist" className="bg-slate-900 text-white">Data Scientist</option>
                <option value="DevOps Engineer" className="bg-slate-900 text-white">DevOps Engineer</option>
                <option value="Product Manager" className="bg-slate-900 text-white">Product Manager</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || (!resumeText.trim() && !file)}
            className="relative z-10 w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-indigo-500/30 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scanning Resume via Gemini Engine...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Run Resume ATS Audit</span>
              </>
            )}
          </button>
        </form>

        {/* Right Output Results */}
        <div className="lg:col-span-6 flex flex-col gap-4 sm:gap-6 min-w-0">
          {result ? (
            <div className="bg-[#15151A] border-2 border-indigo-500/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl shadow-indigo-500/10 flex flex-col gap-5 sm:gap-6 animate-fade-in min-w-0">
              {/* Score header */}
              <div className="flex items-center justify-between border-b border-indigo-500/30 pb-4">
                <div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
                    ATS Resume Evaluation
                  </h3>
                  <p className="text-xs font-bold text-indigo-300 mt-0.5">Target Role: {targetRole}</p>
                </div>
                <ScoreBadge score={result.atsScore} size="lg" />
              </div>

              {/* Subscores with Distinct Beautiful Light Color Gradients & 3D Pop Hover */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Formatting Score: Electric Sky Cyan & Blue Light Gradient */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-500/90 via-sky-600/85 to-indigo-900/90 border-2 border-cyan-300 shadow-xl shadow-cyan-500/30 hover:border-white hover:shadow-cyan-400/60 backdrop-blur-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 transform cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-cyan-100 drop-shadow">Formatting Score</p>
                    <FileText className="w-5 h-5 text-cyan-200 group-hover:scale-125 transition-transform" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg mt-2 group-hover:scale-105 transition-transform origin-left">
                    {result.formattingScore}%
                  </p>
                </div>

                {/* Keyword Match: Sunburst Amber & Pink Coral Light Gradient */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/90 via-pink-600/85 to-purple-900/90 border-2 border-amber-300 shadow-xl shadow-amber-500/30 hover:border-white hover:shadow-amber-400/60 backdrop-blur-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 transform cursor-pointer group">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black uppercase tracking-wider text-amber-100 drop-shadow">Keyword Match</p>
                    <Target className="w-5 h-5 text-amber-200 group-hover:scale-125 transition-transform" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-black text-white drop-shadow-lg mt-2 group-hover:scale-105 transition-transform origin-left">
                    {result.keywordDensityScore}%
                  </p>
                </div>
              </div>

              {/* Extracted vs Missing Skills */}
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-black text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Detected Candidate Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.extractedSkills || []).map((skill, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600/35 via-teal-600/25 to-slate-950 border-2 border-emerald-500/50 hover:border-emerald-400 text-emerald-200 font-extrabold text-xs shadow-md shadow-emerald-500/20 hover:-translate-y-1 hover:scale-110 transition-all duration-300 transform cursor-pointer"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-black text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" /> Skill Gaps for {targetRole}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {(result.missingSkills || []).map((skill, i) => (
                      <span
                        key={i}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600/35 via-pink-600/25 to-slate-950 border-2 border-rose-500/50 hover:border-rose-400 text-rose-200 font-extrabold text-xs shadow-md shadow-rose-500/20 hover:-translate-y-1 hover:scale-110 transition-all duration-300 transform cursor-pointer"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Alternative Roles */}
              {result.suggestedRoles && result.suggestedRoles.length > 0 && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-600/25 via-indigo-600/20 to-slate-950 border-2 border-cyan-500/40 hover:border-cyan-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-cyan-500/30 transition-all duration-300 transform cursor-pointer flex flex-col gap-2.5">
                  <span className="text-xs font-black text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-cyan-400" /> Recommended Job Matches Based on Resume:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/30 via-indigo-500/20 to-slate-900 border-2 border-cyan-400/50 text-white text-xs font-black shadow-md hover:scale-105 transition-transform"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Opportunities Cards */}
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="text-base font-black text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-400" />
                    Career Opportunities
                  </h4>
                  <p className="text-xs font-semibold text-indigo-200 mt-0.5">
                    Jobs and internships recommended from your resume skills.
                  </p>
                </div>

                {loadingJobs ? (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/30 text-xs font-bold text-indigo-300">
                    Finding suitable career opportunities...
                  </div>
                ) : jobRecommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    {jobRecommendations.map((job, index) => {
                      const careerCardThemes = [
                        {
                          card: "bg-gradient-to-br from-cyan-500/90 via-sky-600/85 to-indigo-950 border-2 border-cyan-300 shadow-xl shadow-cyan-500/30 hover:border-white hover:shadow-cyan-400/60",
                          badge: "bg-cyan-300/30 text-cyan-100 border-cyan-300/50",
                          desc: "text-cyan-100",
                          cta: "text-cyan-200",
                        },
                        {
                          card: "bg-gradient-to-br from-fuchsia-500/90 via-purple-600/85 to-slate-950 border-2 border-fuchsia-300 shadow-xl shadow-fuchsia-500/30 hover:border-white hover:shadow-fuchsia-400/60",
                          badge: "bg-fuchsia-300/30 text-fuchsia-100 border-fuchsia-300/50",
                          desc: "text-fuchsia-100",
                          cta: "text-fuchsia-200",
                        },
                        {
                          card: "bg-gradient-to-br from-emerald-500/90 via-teal-600/85 to-slate-950 border-2 border-emerald-300 shadow-xl shadow-emerald-500/30 hover:border-white hover:shadow-emerald-400/60",
                          badge: "bg-emerald-300/30 text-emerald-100 border-emerald-300/50",
                          desc: "text-emerald-100",
                          cta: "text-emerald-200",
                        },
                        {
                          card: "bg-gradient-to-br from-amber-500/90 via-rose-600/85 to-purple-950 border-2 border-amber-300 shadow-xl shadow-amber-500/30 hover:border-white hover:shadow-amber-400/60",
                          badge: "bg-amber-300/30 text-amber-100 border-amber-300/50",
                          desc: "text-amber-100",
                          cta: "text-amber-200",
                        },
                      ];

                      const theme = careerCardThemes[index % careerCardThemes.length];

                      return (
                        <a
                          key={index}
                          href={`https://www.google.com/search?q=${encodeURIComponent(
                            job.title + " internship jobs apply"
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`p-4 sm:p-5 rounded-2xl ${theme.card} backdrop-blur-xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 transform cursor-pointer group flex flex-col justify-between`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h5 className="text-sm sm:text-base font-black text-white drop-shadow group-hover:scale-105 transition-transform origin-left">
                                  {job.title}
                                </h5>
                                {job.company && (
                                  <p className="text-xs font-bold text-white/90 flex items-center gap-1 mt-0.5">
                                    <Building2 className="w-3.5 h-3.5 text-white/80" />
                                    <span>{job.company}</span>
                                  </p>
                                )}
                              </div>
                              <span className={`shrink-0 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider drop-shadow ${theme.badge}`}>
                                {job.category}
                              </span>
                            </div>

                            <p className={`text-xs font-semibold mt-2.5 leading-relaxed drop-shadow-sm ${theme.desc}`}>
                              {job.reason}
                            </p>

                            {job.deadline && (
                              <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/30 border border-white/20 text-[11px] font-bold text-white/90">
                                <Clock className="w-3 h-3 text-amber-300 animate-pulse" />
                                <span>{job.deadline}</span>
                              </div>
                            )}
                          </div>
                          <p className={`text-xs font-black mt-3.5 flex items-center gap-1.5 drop-shadow ${theme.cta} group-hover:translate-x-1.5 transition-transform`}>
                            Search & Apply
                            <ArrowRight className="w-4 h-4" />
                          </p>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-indigo-950/40 border-2 border-indigo-500/30 text-xs font-bold text-indigo-300">
                    No additional career recommendations found.
                  </div>
                )}
              </div>

              {/* Actionable Tips */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-600/30 via-orange-600/20 to-slate-950 border-2 border-amber-500/40 hover:border-amber-400 backdrop-blur-md hover:-translate-y-1.5 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 transform cursor-pointer flex flex-col gap-2 text-xs">
                <span className="font-black text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Actionable Resume Recommendations:
                </span>
                <ul className="list-disc list-inside text-slate-200 font-semibold space-y-1.5 leading-relaxed">
                  {(result.bulletPointFeedback || []).map((fb, i) => (
                    <li key={i}>{fb}</li>
                  ))}
                </ul>
              </div>

              {/* Launch Tailored Interview Action */}
              <button
                type="button"
                onClick={launchTailoredInterview}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 border-2 border-purple-400/50 text-white font-black text-sm sm:text-base shadow-2xl shadow-indigo-500/40 hover:-translate-y-1.5 hover:scale-[1.02] active:scale-95 transition-all duration-300 transform cursor-pointer flex items-center justify-center gap-2 group"
              >
                <Rocket className="w-5 h-5 text-amber-300 group-hover:scale-125 transition-transform" />
                <span>Launch Mock Interview Tailored to My Resume</span>
              </button>
            </div>
          ) : (
            <div className="relative overflow-hidden group lg:col-span-6 bg-gradient-to-br from-indigo-600/30 via-purple-600/20 to-slate-950 border-2 border-indigo-500/40 hover:border-indigo-400 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 text-slate-300 shadow-2xl shadow-indigo-500/10 min-h-[340px] hover:-translate-y-2 hover:scale-[1.02] transition-all duration-300 transform cursor-pointer">
              <FileCheck className="w-14 h-14 text-indigo-300 animate-bounce" />
              <p className="text-lg font-black text-white">
                Ready to Audit Candidate Resume
              </p>
              <p className="text-xs font-semibold max-w-xs text-indigo-200">
                Upload your resume file or paste text on the left to extract skills, compute ATS matching, and launch custom mock interviews.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
