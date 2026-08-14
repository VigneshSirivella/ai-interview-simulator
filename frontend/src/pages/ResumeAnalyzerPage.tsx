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
        category: string;
        reason: string;
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
          await apiService.getJobRecommendations();

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
        {/* Left Form */}
        <form
          onSubmit={handleAnalyze}
          className="lg:col-span-6 bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl flex flex-col gap-5 sm:gap-6"
        >
          {/* Toggle Input Mode */}
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setInputMode("upload")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  inputMode === "upload"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setInputMode("paste")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  inputMode === "paste"
                    ? "bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Paste Text
              </button>
            </div>

            <button
              type="button"
              onClick={handleFillSample}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Fill Sample Resume
            </button>
          </div>

          {/* Upload Dropzone Mode */}
          {inputMode === "upload" ? (
            <div className="flex flex-col gap-3">
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
                  className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 text-center flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]"
                      : "border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/50 dark:bg-slate-800/40"
                  }`}
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
                    <Upload className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Drag & Drop your Resume here
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Supports PDF, DOCX, TXT or RTF (Max 10MB)
                    </p>
                  </div>
                  <span className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs shadow-md">
                    Browse Resume File
                  </span>
                </div>
              ) : (
                <div className="p-3 sm:p-4 rounded-2xl border border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-950/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-[260px]">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
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
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Paste Text Mode */
            <textarea
              rows={10}
              required
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content here (Summary, Technical Skills, Projects, Experience, Education)..."
              className="w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 outline-none leading-relaxed resize-none font-mono"
            />
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-indigo-500" /> Target Job Role
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Frontend Engineer">Frontend Engineer</option>
              <option value="Backend Engineer">Backend Engineer</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="Product Manager">Product Manager</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || (!resumeText.trim() && !file)}
            className="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
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
            <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl flex flex-col gap-5 sm:gap-6 animate-fade-in min-w-0">
              {/* Score header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                    ATS Resume Evaluation
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Target Role: {targetRole}</p>
                </div>
                <ScoreBadge score={result.atsScore} size="lg" />
              </div>

              {/* Subscores */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Formatting Score</p>
                  <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                    {result.formattingScore}%
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Keyword Match</p>
                  <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-1">
                    {result.keywordDensityScore}%
                  </p>
                </div>
              </div>

              {/* Extracted vs Missing Skills */}
              <div className="flex flex-col gap-3">
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Detected Candidate Skills
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.extractedSkills || []).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-2">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Skill Gaps for {targetRole}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(result.missingSkills || []).map((skill, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-700 dark:text-rose-300 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Suggested Alternative Roles */}
              {result.suggestedRoles && result.suggestedRoles.length > 0 && (
                <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/60 flex flex-col gap-2">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-indigo-500" /> Recommended Job Matches Based on Resume:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedRoles.map((role, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 text-slate-800 dark:text-slate-200 text-xs font-bold shadow-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Career Opportunities */}
              <div className="flex flex-col gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-indigo-500" />
                    Career Opportunities
                  </h4>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Jobs and internships recommended from your resume skills.
                  </p>
                </div>

                {loadingJobs ? (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500">
                    Finding suitable career opportunities...
                  </div>
                ) : jobRecommendations.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {jobRecommendations.map((job, index) => (
                      <a
                        key={index}
                        href={`https://www.google.com/search?q=${encodeURIComponent(
                          job.title + " internship jobs apply"
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-lg transition cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white">
                            {job.title}
                          </h5>

                          <span className="shrink-0 px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold">
                            {job.category}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-5">
                          {job.reason}
                        </p>

                        <p className="text-xs font-bold text-indigo-500 mt-3 flex items-center gap-1">
                          Search & Apply
                          <ArrowRight className="w-3.5 h-3.5" />
                        </p>
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No additional career recommendations found.
                    </p>
                  </div>
                )}
              </div>

              {/* Actionable Tips */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col gap-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-amber-400" /> Actionable Resume Recommendations:
                </span>
                <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1">
                  {(result.bulletPointFeedback || []).map((fb, i) => (
                    <li key={i}>{fb}</li>
                  ))}
                </ul>
              </div>

              {/* Launch Tailored Interview Action */}
              <button
                type="button"
                onClick={launchTailoredInterview}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2"
              >
                <Rocket className="w-5 h-5 text-amber-300" />
                <span>Launch Mock Interview Tailored to My Resume</span>
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center flex flex-col items-center justify-center gap-3 text-slate-400 shadow-sm min-h-[340px]">
              <FileCheck className="w-12 h-12 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Ready to Audit Candidate Resume
              </p>
              <p className="text-xs max-w-xs text-slate-500 dark:text-slate-400">
                Upload your resume file or paste text on the left to extract skills, compute ATS matching, and launch custom mock interviews.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
