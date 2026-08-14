import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../services/api";
import {
  User,
  Mail,
  Phone,
  Github,
  Linkedin,
  Building2,
  Briefcase,
  Award,
  Save,
  CheckCircle2,
  X,
  ArrowLeft,
} from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "+1 (555) 000-0000",
    targetCompany: user?.targetCompany || "Google",
    targetRole: user?.targetRole || "Software Engineer",
    githubUrl: user?.githubUrl || "",
    linkedinUrl: user?.linkedinUrl || "",
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [profileFile, setProfileFile] =
    useState<File | null>(null);

  const [profilePreview, setProfilePreview] =
    useState<string | null>(
      user?.profilePicture || null
    );

  const fileInputRef =
    useRef<HTMLInputElement>(null);
  
  const [careerLoading, setCareerLoading] =
    useState(false);

  const [careerError, setCareerError] =
    useState("");

  const [careerResult, setCareerResult] =
    useState<any>(null);

  const [showPhotoPreview, setShowPhotoPreview] =
    useState(false);  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (
        e: React.FormEvent
      ) => {
        e.preventDefault();

        setSaving(true);

        try {
          await updateProfile({
            name: formData.name,
            phone: formData.phone,
            githubUrl: formData.githubUrl,
            linkedinUrl: formData.linkedinUrl,
            targetCompany:
              formData.targetCompany,
            targetRole:
              formData.targetRole,
            profileFile:
              profileFile || undefined,
          });

          setSuccessMsg(
            "Profile saved successfully! GitHub, LinkedIn and personal details have been updated."
          );

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          setTimeout(
            () => setSuccessMsg(""),
            3000
          );
        } finally {
          setSaving(false);
        }
      };

  const handleProfilePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile =
      e.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    setProfileFile(selectedFile);

    const previewUrl =
      URL.createObjectURL(selectedFile);

    setProfilePreview(previewUrl);
  };

    const handleCareerAnalysis = async () => {
      setCareerLoading(true);
      setCareerError("");

      try {
        const result =
          await apiService.getCareerIntelligence();

        setCareerResult(result);
      } catch (error) {
        setCareerError(
          error instanceof Error
            ? error.message
            : "Unable to analyze career profile."
        );
      } finally {
        setCareerLoading(false);
      }
    };

  return (
    <div className="max-w-4xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-5 sm:py-6 lg:py-8 flex flex-col gap-5 sm:gap-6 lg:gap-8 overflow-x-hidden">
      {showPhotoPreview && profilePreview && (
          <div
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPhotoPreview(false)}
          >
            <div
              className="relative max-w-3xl w-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={profilePreview}
                alt={user?.name || "Profile"}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />

              <button
                type="button"
                onClick={() => setShowPhotoPreview(false)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black transition"
                aria-label="Close photo preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-bold uppercase tracking-wider mb-2">
          <User className="w-3.5 h-3.5" /> Candidate Profile
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
          Account & Engineering Career Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage target role benchmarks, social portfolio links, and personal credentials.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl flex flex-col gap-6"
      >
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="relative shrink-0">
            {profilePreview ? (
              <button
                type="button"
                onClick={() => setShowPhotoPreview(true)}
                className="block rounded-2xl"
                title="View profile photo"
              >
                <img
                  src={profilePreview}
                  alt={user?.name || "Profile"}
                  className="w-24 h-24 rounded-2xl object-cover object-top ring-4 ring-indigo-500/30 cursor-pointer hover:scale-105 transition"
                />
              </button>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-extrabold ring-4 ring-indigo-500/30">
                {(user?.name || "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Change Photo
            </button>
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold mt-1">
              B.Tech Computer Science Candidate
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              readOnly
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed outline-none"
            />

            <p className="text-[10px] text-slate-400 mt-1">
              Login email cannot be changed.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Company
            </label>
            <select
              name="targetCompany"
              value={formData.targetCompany}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Google">Google</option>
              <option value="Microsoft">Microsoft</option>
              <option value="Amazon">Amazon</option>
              <option value="Meta">Meta</option>
              <option value="Netflix">Netflix</option>
              <option value="Startup X">Startup X</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Target Role
            </label>
            <input
              type="text"
              name="targetRole"
              value={formData.targetRole}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              GitHub Profile URL
            </label>
            <input
              type="url"
              name="githubUrl"
              value={formData.githubUrl}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="self-end px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 mt-4"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </form>
        <div className="bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                AI Career Intelligence
              </h2>

              <p className="text-xs text-slate-500 mt-1">
                Analyze your GitHub profile and receive personalized
                career recommendations.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCareerAnalysis}
              disabled={careerLoading}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm disabled:opacity-60"
            >
              {careerLoading
                ? "Analyzing GitHub..."
                : "Analyze My Career Profile"}
            </button>
          </div>

          {careerError && (
            <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold">
              {careerError}
            </div>
          )}

          {careerResult && (
            <div className="mt-6 flex flex-col gap-5">

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40">
                  <p className="text-xs text-slate-500">
                    GitHub Score
                  </p>

                  <p className="text-3xl font-black text-indigo-600">
                    {careerResult.analysis.githubScore}/100
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">
                    Public Repositories
                  </p>

                  <p className="text-2xl font-black">
                    {careerResult.github.public_repositories}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                  <p className="text-xs text-slate-500">
                    GitHub Followers
                  </p>

                  <p className="text-2xl font-black">
                    {careerResult.github.followers}
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <h3 className="font-bold mb-2">
                  AI Profile Summary
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {careerResult.analysis.profileSummary}
                </p>
              </div>

              <CareerList
                title="Strong Skills"
                items={careerResult.analysis.strongSkills}
              />

              <CareerList
                title="Skills To Improve"
                items={careerResult.analysis.missingSkills}
              />

              <CareerList
                title="Recommended Jobs"
                items={careerResult.analysis.recommendedJobs}
              />

              <CareerList
                title="Recommended Internships"
                items={careerResult.analysis.recommendedInternships}
              />

              <CareerList
                title="Projects You Should Build"
                items={careerResult.analysis.recommendedProjects}
              />

              <CareerList
                title="GitHub Improvements"
                items={careerResult.analysis.githubImprovements}
              />

              <CareerList
                title="Resume Improvements"
                items={careerResult.analysis.resumeImprovements}
              />

              <CareerList
                title="Next Learning Steps"
                items={careerResult.analysis.nextLearningSteps}
              />

            </div>
          )}
      </div>
    </div>
  );
};

const CareerList = ({
  title,
  items,
}: {
  title: string;
  items: string[];
}) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
      <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">
        {title}
      </h3>

      <ul className="space-y-2">
        {items.map((item, index) => (
          <li
            key={index}
            className="text-xs text-slate-600 dark:text-slate-300 flex gap-2"
          >
            <span className="text-indigo-500 font-black">
              •
            </span>

            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
