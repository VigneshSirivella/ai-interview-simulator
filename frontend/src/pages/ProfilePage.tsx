import React, { useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Save,
  CheckCircle2,
  X,
} from "lucide-react";


export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    targetCompany: user?.targetCompany || "Google",
    targetRole: user?.targetRole || "Software Engineer",
    preferredLanguage: user?.preferredLanguage || "Python",
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
            targetCompany:
              formData.targetCompany,
            targetRole:
              formData.targetRole,
            preferredLanguage:
              formData.preferredLanguage,
            profileFile:
              profileFile || undefined,
          });

          setSuccessMsg(
            "Profile updated successfully!"
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
          Manage your personal details and interview preferences.
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

            {(() => {
              const localNumber =
                formData.phone.startsWith("+91")
                  ? formData.phone.slice(3)
                  : formData.phone.replace(/\D/g, "");

              const isIndianNumber =
                localNumber.length >= 4 &&
                /^[6-9]/.test(localNumber);

              return (
                <div className="w-full h-[50px] px-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2 focus-within:ring-2 focus-within:ring-indigo-500">
                  {isIndianNumber && (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-lg">🇮🇳</span>

                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                        +91
                      </span>

                      <div className="h-5 w-px bg-slate-300 dark:bg-slate-600" />
                    </div>
                  )}

                  <input
                    type="tel"
                    inputMode="numeric"
                    value={localNumber}
                    placeholder="Enter phone number"
                    maxLength={10}
                    onChange={(event) => {
                      const digits = event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                      const detectedAsIndia =
                        digits.length >= 4 &&
                        /^[6-9]/.test(digits);

                      setFormData({
                        ...formData,
                        phone: detectedAsIndia
                          ? `+91${digits}`
                          : digits,
                      });
                    }}
                    className="flex-1 min-w-0 bg-transparent border-0 outline-none ring-0 shadow-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              );
            })()}
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
              Primary Programming Language
            </label>

            <select
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C">C</option>
              <option value="C++">C++</option>
              <option value="JavaScript">JavaScript</option>
              <option value="TypeScript">TypeScript</option>
              <option value="C#">C#</option>
              <option value="Go">Go</option>
              <option value="Rust">Rust</option>
            </select>

            <p className="text-[10px] text-slate-400 mt-1">
              Used as your default language for technical interviews.
            </p>
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
        
    </div>
  );
};
