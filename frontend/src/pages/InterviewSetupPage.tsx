import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  apiService,
  getApiError,
} from "../services/api";

import { CameraPreview } from "../components/CameraPreview";

import {
  AlertCircle,
  Briefcase,
  Building2,
  Camera,
  CameraOff,
  CheckCircle2,
  Code2,
  HelpCircle,
  Layers,
  Play,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const COMPANIES = [
  "Google",
  "Microsoft",
  "Amazon",
  "Meta",
  "Apple",
  "Netflix",
  "Uber",
  "TCS",
  "Infosys",
  "Startup X",
];

const ROLES = [
  "Software Engineer",
  "Frontend Engineer",
  "Backend Engineer",
  "Full Stack Developer",
  "Data Scientist",
  "DevOps Engineer",
  "Product Manager",
];

const PROGRAMMING_LANGUAGES = [
  "Python",
  "C",
  "C++",
  "Java",
  "JavaScript",
  "TypeScript",
  "C#",
  "Go",
  "Kotlin",
  "PHP",
  "Ruby",
  "Rust",
  "Swift",
  "SQL",
];

type CameraChoice =
  | "not-selected"
  | "enabled"
  | "disabled";

export const InterviewSetupPage: React.FC =
  () => {
    const navigate = useNavigate();

    const location = useLocation();

    const resumeState = location.state as
      | {
          prefilledRole?: string;
          skills?: string[];
        }
      | undefined;

    const [company, setCompany] =
      useState("Google");

    const [role, setRole] = useState(
      resumeState?.prefilledRole || "Software Engineer"
    );

    const [difficulty, setDifficulty] =
      useState("Medium");

    const [type, setType] =
      useState("Technical");

    const [totalQuestions, setTotalQuestions] =
      useState(5);

    const [firstLanguage, setFirstLanguage] =
      useState("Python");

    const [secondLanguage, setSecondLanguage] =
      useState("");

    const [thirdLanguage, setThirdLanguage] =
      useState("");

    const [cameraChoice, setCameraChoice] =
      useState<CameraChoice>("not-selected");

    const [
      cameraPermissionGranted,
      setCameraPermissionGranted,
    ] = useState(false);

    const [loading, setLoading] =
      useState(false);

    const [error, setError] = useState("");

    const cameraEnabled =
      cameraChoice === "enabled" &&
      cameraPermissionGranted;

    const selectedLanguages = useMemo(
      () =>
        [
          firstLanguage,
          secondLanguage,
          thirdLanguage,
        ].filter(Boolean),
      [
        firstLanguage,
        secondLanguage,
        thirdLanguage,
      ]
    );

    const resumeSkills =
      resumeState?.skills || [];

    const hasDuplicateLanguages = () => {
      return (
        new Set(selectedLanguages).size !==
        selectedLanguages.length
      );
    };

    const handleStart = async () => {
      setError("");

      if (
        type !== "HR" &&
        !firstLanguage
      ) {
        setError(
          "Select at least one preferred programming language."
        );
        return;
      }

      if (hasDuplicateLanguages()) {
        setError(
          "First, second and third preferred languages must be different."
        );
        return;
      }

      if (
        cameraChoice === "not-selected"
      ) {
        setError(
          "Choose whether you want to use camera analysis."
        );
        return;
      }

      setLoading(true);

      try {
        const response =
          await apiService.startInterview({
            company,
            role,
            difficulty,
            type,
            totalQuestions,
            cameraEnabled,
            preferredLanguages:
              selectedLanguages,
          });

        sessionStorage.setItem(
          `interview-options-${response.session.id}`,
          JSON.stringify({
            cameraEnabled,
            preferredLanguages:
              selectedLanguages,
            totalQuestions,
          })
        );

        navigate(
          `/interview/${response.session.id}`
        );
      } catch (requestError) {
        console.error(
          "Failed to start session:",
          requestError
        );

        setError(
          getApiError(
            requestError,
            "Failed to initialize the interview session."
          )
        );
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-6xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-7 lg:py-10 flex flex-col gap-6 sm:gap-8 lg:gap-10 overflow-x-hidden">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Configure Interview
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            AI Interview Setup
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
            Select your company, role, preferred
            languages, interview format and camera
            preference.
          </p>
        </div>

        {error && (
          <div className="max-w-4xl mx-auto w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />

            <p className="text-sm font-semibold">
              {error}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-7 bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl flex flex-col gap-5 sm:gap-6">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-indigo-500" />
                Target Company
              </label>

              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2.5">
                {COMPANIES.map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setCompany(item)
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      company === item
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-indigo-500" />
                Target Role
              </label>

              <select
                value={role}
                onChange={(event) =>
                  setRole(event.target.value)
                }
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {ROLES.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-500" />
                Preferred Programming Languages
              </label>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Technical and programming questions
                will primarily use your first preferred
                language.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <LanguageSelect
                  label="First Preference"
                  value={firstLanguage}
                  required={type !== "HR"}
                  onChange={setFirstLanguage}
                />

                <LanguageSelect
                  label="Second Preference"
                  value={secondLanguage}
                  onChange={setSecondLanguage}
                />

                <LanguageSelect
                  label="Third Preference"
                  value={thirdLanguage}
                  onChange={setThirdLanguage}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Difficulty
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  "Easy",
                  "Medium",
                  "Hard",
                ].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setDifficulty(item)
                    }
                    className={`py-3 rounded-xl text-xs font-bold border transition ${
                      difficulty === item
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                Interview Type
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {[
                  "Technical",
                  "HR",
                  "Behavioral",
                  "Mixed",
                ].map((item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setType(item)
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition ${
                      type === item
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Number of Questions
                </label>

                <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                  {totalQuestions} Questions
                </span>
              </div>

              <input
                type="range"
                min={3}
                max={10}
                value={totalQuestions}
                onChange={(event) =>
                  setTotalQuestions(
                    Number(
                      event.target.value
                    )
                  )
                }
                className="w-full accent-indigo-600 cursor-pointer"
              />
            </div>

                        {resumeSkills.length > 0 && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                  Resume Skills Detected
                </p>

                <div className="flex flex-wrap gap-2">
                  {resumeSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleStart}
              disabled={loading}
              className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-base shadow-xl shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Starting interview...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 fill-current" />
                  Start AI Interview
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-4 sm:gap-6">
            <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col gap-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Optional Camera Analysis
              </h3>

              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Would you like to enable camera
                  analysis?
                </p>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-5">
                  When enabled, AI can analyse eye
                  contact, posture, confidence and facial
                  engagement to improve your final
                  report. Camera access is controlled by
                  your browser and can be denied or
                  revoked at any time.
                </p>

                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-5">
                  The interview works normally without
                  camera. Technical-answer scoring does
                  not depend on camera access.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setCameraChoice("disabled");
                    setCameraPermissionGranted(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition ${
                    cameraChoice === "disabled"
                      ? "border-slate-900 dark:border-white bg-slate-100 dark:bg-slate-800"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <CameraOff className="w-5 h-5 text-slate-500" />

                  <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                    Continue Without Camera
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCameraChoice("enabled");
                    setCameraPermissionGranted(false);
                  }}
                  className={`p-4 rounded-2xl border text-left transition ${
                    cameraChoice === "enabled"
                      ? "border-indigo-600 bg-indigo-500/10"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Camera className="w-5 h-5 text-indigo-500" />

                  <p className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                    Enable Camera Analysis
                  </p>
                </button>
              </div>

              {cameraChoice !==
                "not-selected" && (
                <CameraPreview
                  enabled={
                    cameraChoice === "enabled"
                  }
                  onPermissionChange={
                    setCameraPermissionGranted
                  }
                />
              )}

              {cameraChoice === "enabled" &&
                cameraPermissionGranted && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Camera permission granted.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    );
  };

interface LanguageSelectProps {
  label: string;
  value: string;
  required?: boolean;
  onChange: (value: string) => void;
}

const LanguageSelect: React.FC<
  LanguageSelectProps
> = ({
  label,
  value,
  required = false,
  onChange,
}) => {
  return (
    <div>
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5">
        {label}
        {required ? " *" : ""}
      </label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {!required && (
          <option value="">
            Not selected
          </option>
        )}

        {PROGRAMMING_LANGUAGES.map(
          (language) => (
            <option
              key={language}
              value={language}
            >
              {language}
            </option>
          )
        )}
      </select>
    </div>
  );
};