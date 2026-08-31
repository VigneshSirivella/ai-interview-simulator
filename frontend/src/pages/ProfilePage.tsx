import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Save,
  CheckCircle2,
  X,
  Building2,
  Briefcase,
  Code2,
  Phone,
  Mail,
  Sparkles,
  Camera,
  Trophy,
  Target,
  Award,
  Zap,
  Check,
  Globe,
  Sliders,
  Bell,
  Cpu,
  Flame,
  CheckSquare,
  Laptop,
  Image,
  Smile,
  Trash2,
} from "lucide-react";

// Generator for crisp, ultra-clear cute animal character avatars
const createAnimalSvgAvatar = (type: string, bg1: string, bg2: string) => {
  let innerSvg = "";

  if (type === "monkey") {
    innerSvg = `
      <!-- Ears -->
      <circle cx="18" cy="42" r="11" fill="#78350F"/>
      <circle cx="18" cy="42" r="6" fill="#FDE68A"/>
      <circle cx="82" cy="42" r="11" fill="#78350F"/>
      <circle cx="82" cy="42" r="6" fill="#FDE68A"/>
      <!-- Head -->
      <circle cx="50" cy="50" r="30" fill="#92400E"/>
      <!-- Face Muzzle -->
      <ellipse cx="50" cy="56" rx="21" ry="17" fill="#FDE68A"/>
      <!-- Eye patches -->
      <ellipse cx="39" cy="42" rx="9" ry="11" fill="#FDF6B2"/>
      <ellipse cx="61" cy="42" rx="9" ry="11" fill="#FDF6B2"/>
      <!-- Eyes -->
      <circle cx="40" cy="42" r="4.5" fill="#1E293B"/>
      <circle cx="60" cy="42" r="4.5" fill="#1E293B"/>
      <circle cx="41.5" cy="40.5" r="1.5" fill="white"/>
      <circle cx="61.5" cy="40.5" r="1.5" fill="white"/>
      <!-- Nose -->
      <ellipse cx="50" cy="52" rx="5" ry="3.5" fill="#451A03"/>
      <!-- Smile -->
      <path d="M41 58 Q50 67 59 58" stroke="#451A03" stroke-width="3.5" stroke-linecap="round" fill="none"/>
      <!-- Rosy Cheeks -->
      <circle cx="34" cy="56" r="3" fill="#F472B6" opacity="0.6"/>
      <circle cx="66" cy="56" r="3" fill="#F472B6" opacity="0.6"/>
    `;
  } else if (type === "panda") {
    innerSvg = `
      <!-- Ears -->
      <circle cx="24" cy="28" r="11" fill="#0F172A"/>
      <circle cx="76" cy="28" r="11" fill="#0F172A"/>
      <!-- Head -->
      <circle cx="50" cy="52" r="30" fill="#FFFFFF"/>
      <!-- Eye Patches -->
      <ellipse cx="38" cy="48" rx="9" ry="11" fill="#0F172A" transform="rotate(-15 38 48)"/>
      <ellipse cx="62" cy="48" rx="9" ry="11" fill="#0F172A" transform="rotate(15 62 48)"/>
      <!-- Eyes -->
      <circle cx="38" cy="47" r="3.5" fill="#FFFFFF"/>
      <circle cx="62" cy="47" r="3.5" fill="#FFFFFF"/>
      <circle cx="39" cy="46" r="1.5" fill="#0F172A"/>
      <circle cx="63" cy="46" r="1.5" fill="#0F172A"/>
      <!-- Nose -->
      <ellipse cx="50" cy="57" rx="5" ry="3.5" fill="#0F172A"/>
      <!-- Mouth -->
      <path d="M44 62 Q50 67 56 62" stroke="#0F172A" stroke-width="3" stroke-linecap="round" fill="none"/>
      <!-- Cheeks -->
      <circle cx="30" cy="58" r="4" fill="#F472B6" opacity="0.4"/>
      <circle cx="70" cy="58" r="4" fill="#F472B6" opacity="0.4"/>
    `;
  } else if (type === "fox") {
    innerSvg = `
      <!-- Ears -->
      <polygon points="20,15 38,45 15,45" fill="#EA580C"/>
      <polygon points="23,20 35,42 18,42" fill="#FDE68A"/>
      <polygon points="80,15 62,45 85,45" fill="#EA580C"/>
      <polygon points="77,20 65,42 82,42" fill="#FDE68A"/>
      <!-- Head -->
      <path d="M20 45 Q50 35 80 45 Q85 70 50 85 Q15 70 20 45 Z" fill="#F97316"/>
      <!-- White Muzzle -->
      <path d="M32 55 Q50 48 68 55 Q50 85 32 55 Z" fill="#FFFFFF"/>
      <!-- Eyes -->
      <ellipse cx="38" cy="48" rx="4" ry="5" fill="#0F172A"/>
      <ellipse cx="62" cy="48" rx="4" ry="5" fill="#0F172A"/>
      <circle cx="39" cy="46" r="1.5" fill="white"/>
      <circle cx="63" cy="46" r="1.5" fill="white"/>
      <!-- Nose -->
      <circle cx="50" cy="72" r="4" fill="#0F172A"/>
    `;
  } else if (type === "lion") {
    innerSvg = `
      <!-- Mane -->
      <circle cx="50" cy="50" r="38" fill="#D97706"/>
      <!-- Ears -->
      <circle cx="26" cy="30" r="9" fill="#F59E0B"/>
      <circle cx="74" cy="30" r="9" fill="#F59E0B"/>
      <!-- Head -->
      <circle cx="50" cy="52" r="27" fill="#FBBF24"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="59" rx="14" ry="11" fill="#FEF3C7"/>
      <!-- Eyes -->
      <circle cx="40" cy="46" r="4" fill="#451A03"/>
      <circle cx="60" cy="46" r="4" fill="#451A03"/>
      <circle cx="41.5" cy="44.5" r="1.5" fill="white"/>
      <circle cx="61.5" cy="44.5" r="1.5" fill="white"/>
      <!-- Nose -->
      <polygon points="50,54 44,60 56,60" fill="#78350F"/>
      <!-- Mouth -->
      <path d="M43 64 Q50 70 57 64" stroke="#78350F" stroke-width="3" stroke-linecap="round" fill="none"/>
    `;
  } else if (type === "cat") {
    innerSvg = `
      <!-- Ears -->
      <polygon points="20,18 40,40 15,45" fill="#EC4899"/>
      <polygon points="24,24 36,40 20,43" fill="#FBCFE8"/>
      <polygon points="80,18 60,40 85,45" fill="#EC4899"/>
      <polygon points="76,24 64,40 80,43" fill="#FBCFE8"/>
      <!-- Head -->
      <ellipse cx="50" cy="52" rx="30" ry="25" fill="#F472B6"/>
      <!-- Eyes -->
      <ellipse cx="38" cy="46" rx="5" ry="7" fill="#0F172A"/>
      <ellipse cx="62" cy="46" rx="5" ry="7" fill="#0F172A"/>
      <circle cx="39.5" cy="44" r="2" fill="white"/>
      <circle cx="63.5" cy="44" r="2" fill="white"/>
      <!-- Whiskers -->
      <path d="M12 50 L30 52 M10 58 L30 56 M88 50 L70 52 M90 58 L70 56" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      <!-- Nose & Mouth -->
      <polygon points="50,53 46,57 54,57" fill="#BE185D"/>
      <path d="M44 61 Q50 66 56 61" stroke="#BE185D" stroke-width="3" stroke-linecap="round" fill="none"/>
    `;
  } else if (type === "dog") {
    innerSvg = `
      <!-- Ears -->
      <ellipse cx="20" cy="50" rx="10" ry="20" fill="#78350F" transform="rotate(15 20 50)"/>
      <ellipse cx="80" cy="50" rx="10" ry="20" fill="#78350F" transform="rotate(-15 80 50)"/>
      <!-- Head -->
      <circle cx="50" cy="48" r="28" fill="#FDE68A"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="58" rx="16" ry="13" fill="#FFFFFF"/>
      <!-- Eyes -->
      <circle cx="39" cy="44" r="4.5" fill="#1E293B"/>
      <circle cx="61" cy="44" r="4.5" fill="#1E293B"/>
      <circle cx="40.5" cy="42.5" r="1.5" fill="white"/>
      <circle cx="62.5" cy="42.5" r="1.5" fill="white"/>
      <!-- Nose -->
      <ellipse cx="50" cy="53" rx="6" ry="4.5" fill="#1E293B"/>
      <!-- Tongue -->
      <path d="M47 62 Q50 72 53 62 Z" fill="#EF4444"/>
      <path d="M43 60 Q50 65 57 60" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    `;
  } else if (type === "bear") {
    innerSvg = `
      <!-- Ears -->
      <circle cx="25" cy="28" r="10" fill="#78350F"/>
      <circle cx="25" cy="28" r="5" fill="#FDE68A"/>
      <circle cx="75" cy="28" r="10" fill="#78350F"/>
      <circle cx="75" cy="28" r="5" fill="#FDE68A"/>
      <!-- Head -->
      <circle cx="50" cy="52" r="30" fill="#92400E"/>
      <!-- Muzzle -->
      <ellipse cx="50" cy="60" rx="15" ry="11" fill="#FDE68A"/>
      <!-- Eyes -->
      <circle cx="38" cy="46" r="4" fill="#1E293B"/>
      <circle cx="62" cy="46" r="4" fill="#1E293B"/>
      <circle cx="39.5" cy="44.5" r="1.5" fill="white"/>
      <circle cx="63.5" cy="44.5" r="1.5" fill="white"/>
      <!-- Glasses -->
      <circle cx="38" cy="46" r="9" stroke="#38BDF8" stroke-width="3" fill="none"/>
      <circle cx="62" cy="46" r="9" stroke="#38BDF8" stroke-width="3" fill="none"/>
      <line x1="47" y1="46" x2="53" y2="46" stroke="#38BDF8" stroke-width="3"/>
      <!-- Nose -->
      <ellipse cx="50" cy="56" rx="5" ry="3.5" fill="#1E293B"/>
      <!-- Smile -->
      <path d="M44 63 Q50 68 56 63" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    `;
  } else {
    // Koala
    innerSvg = `
      <!-- Ears -->
      <circle cx="20" cy="32" r="14" fill="#94A3B8"/>
      <circle cx="20" cy="32" r="8" fill="#E2E8F0"/>
      <circle cx="80" cy="32" r="14" fill="#94A3B8"/>
      <circle cx="80" cy="32" r="8" fill="#E2E8F0"/>
      <!-- Head -->
      <circle cx="50" cy="52" r="29" fill="#CBD5E1"/>
      <!-- Eyes -->
      <circle cx="37" cy="46" r="4" fill="#0F172A"/>
      <circle cx="63" cy="46" r="4" fill="#0F172A"/>
      <circle cx="38.5" cy="44.5" r="1.5" fill="white"/>
      <circle cx="64.5" cy="44.5" r="1.5" fill="white"/>
      <!-- Large Koala Nose -->
      <ellipse cx="50" cy="57" rx="8" ry="12" fill="#334155"/>
      <!-- Cheeks -->
      <circle cx="30" cy="56" r="4" fill="#F472B6" opacity="0.5"/>
      <circle cx="70" cy="56" r="4" fill="#F472B6" opacity="0.5"/>
    `;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="120" height="120"><defs><linearGradient id="g_${type}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="100" height="100" rx="28" fill="url(#g_${type})"/>${innerSvg}</svg>`;
  const encoded = typeof window !== "undefined" ? window.btoa(svg) : "";
  return `data:image/svg+xml;base64,${encoded}`;
};

const PRESET_AVATARS = [
  { id: "monkey", name: "Clear Monkey 🐒", theme: "from-amber-500 to-orange-600", url: createAnimalSvgAvatar("monkey", "#F59E0B", "#D97706") },
  { id: "panda", name: "Cool Panda 🐼", theme: "from-emerald-500 to-teal-600", url: createAnimalSvgAvatar("panda", "#10B981", "#059669") },
  { id: "fox", name: "Smart Fox 🦊", theme: "from-orange-500 to-rose-600", url: createAnimalSvgAvatar("fox", "#F97316", "#E11D48") },
  { id: "lion", name: "Brave Lion 🦁", theme: "from-yellow-500 to-amber-600", url: createAnimalSvgAvatar("lion", "#EAB308", "#D97706") },
  { id: "cat", name: "Cyber Cat 🐱", theme: "from-pink-500 to-fuchsia-600", url: createAnimalSvgAvatar("cat", "#EC4899", "#C026D3") },
  { id: "dog", name: "Developer Dog 🐶", theme: "from-sky-500 to-blue-600", url: createAnimalSvgAvatar("dog", "#0EA5E9", "#2563EB") },
  { id: "bear", name: "Tech Bear 🐻", theme: "from-purple-500 to-indigo-600", url: createAnimalSvgAvatar("bear", "#8B5CF6", "#4F46E5") },
  { id: "koala", name: "Chill Koala 🐨", theme: "from-teal-500 to-cyan-600", url: createAnimalSvgAvatar("koala", "#14B8A6", "#0891B2") },
];

// Singleton Web Audio API Synth Chime for tactile hover feedback
let sharedProfileAudioCtx: AudioContext | null = null;
let lastProfileChimeTime = 0;

const playProfileChime = (freq = 600) => {
  const now = Date.now();
  if (now - lastProfileChimeTime < 100) return;
  lastProfileChimeTime = now;

  try {
    if (!sharedProfileAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      sharedProfileAudioCtx = new AudioCtx();
    }

    if (sharedProfileAudioCtx.state === "suspended") {
      sharedProfileAudioCtx.resume().catch(() => {});
    }

    const ctx = sharedProfileAudioCtx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.3, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (e) {
    // Ignore audio policies
  }
};

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<"personal" | "career" | "ai">("personal");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: (user as any)?.location || "",
    headline: (user as any)?.headline || "",
    targetCompany: user?.targetCompany || "Google",
    targetRole: user?.targetRole || "Software Engineer",
    targetLevel: (user as any)?.targetLevel || "L4 / Mid-Senior",
    preferredLanguage: user?.preferredLanguage || "Python",
    secondarySkills: (user as any)?.secondarySkills || ["React", "System Design", "Node.js", "Docker"],
    voiceSpeed: (user as any)?.voiceSpeed || "1.0x",
    autoPlaySpeech: (user as any)?.autoPlaySpeech ?? true,
    proctorAlerts: (user as any)?.proctorAlerts ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    user?.profilePicture || localStorage.getItem("user_custom_avatar") || null
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("user_custom_avatar") || user?.profilePicture;
    if (saved) {
      setProfilePreview(saved);
    }
  }, [user?.profilePicture]);

  const targetCompanies = [
    { name: "Google", color: "from-blue-500 to-red-500", label: "FAANG Tier" },
    { name: "Microsoft", color: "from-blue-600 to-cyan-400", label: "Enterprise Scale" },
    { name: "Amazon", color: "from-amber-500 to-orange-500", label: "Cloud & Distributed" },
    { name: "Meta", color: "from-blue-600 to-indigo-600", label: "Social & AI Labs" },
    { name: "Netflix", color: "from-red-600 to-rose-600", label: "High Performance" },
    { name: "Apple", color: "from-slate-400 to-slate-200", label: "Systems & UX" },
    { name: "Startup X", color: "from-emerald-500 to-teal-500", label: "Uncapped Growth" },
  ];

  const targetRoles = [
    "Software Engineer",
    "Frontend Engineer",
    "Backend Engineer",
    "Full Stack Developer",
    "AI / ML Engineer",
    "System Architect",
    "DevOps / Cloud Engineer",
  ];

  const seniorityLevels = [
    "L3 / Entry-Level Engineer",
    "L4 / Mid-Senior Engineer",
    "L5 / Senior Technical Lead",
    "L6 / Staff System Architect",
  ];

  const languages = [
    { name: "Python", color: "bg-blue-500/20 text-blue-300 border-blue-400/40" },
    { name: "JavaScript", color: "bg-amber-500/20 text-amber-300 border-amber-400/40" },
    { name: "TypeScript", color: "bg-sky-500/20 text-sky-300 border-sky-400/40" },
    { name: "Java", color: "bg-orange-500/20 text-orange-300 border-orange-400/40" },
    { name: "C++", color: "bg-indigo-500/20 text-indigo-300 border-indigo-400/40" },
    { name: "Go", color: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40" },
    { name: "Rust", color: "bg-rose-500/20 text-rose-300 border-rose-400/40" },
  ];

  const availableSkills = [
    "React", "Node.js", "System Design", "Docker", "Kubernetes", "AWS", "SQL / PostgreSQL", "Redis", "GraphQL", "Data Structures"
  ];

  const toggleSkill = (skill: string) => {
    const current = formData.secondarySkills;
    if (current.includes(skill)) {
      setFormData({ ...formData, secondarySkills: current.filter((s: string) => s !== skill) });
    } else {
      setFormData({ ...formData, secondarySkills: [...current, skill] });
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    playProfileChime(800);

    try {
      if (profilePreview) {
        try {
          localStorage.setItem("user_custom_avatar", profilePreview);
          window.dispatchEvent(new Event("avatar_changed"));
        } catch (err) {}
      }

      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        targetCompany: formData.targetCompany,
        targetRole: formData.targetRole,
        preferredLanguage: formData.preferredLanguage,
        profileFile: profileFile || undefined,
      });

      setSuccessMsg("Profile & career settings saved successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => setSuccessMsg(""), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePhotoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setProfileFile(selectedFile);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      setProfilePreview(base64Data);
      try {
        localStorage.setItem("user_custom_avatar", base64Data);
        window.dispatchEvent(new Event("avatar_changed"));
      } catch (err) {
        console.warn("Avatar storage quota exceeded:", err);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-3 sm:px-5 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 flex flex-col gap-6 sm:gap-8 lg:gap-10 overflow-x-hidden">
      {/* Photo Lightbox Modal */}
      {showPhotoPreview && profilePreview && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowPhotoPreview(false)}
        >
          <div
            className="relative max-w-2xl w-full flex flex-col items-center justify-center bg-[#15151A] border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowPhotoPreview(false)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-rose-600 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={profilePreview}
              alt={user?.name || "Profile"}
              className="max-w-full max-h-[70vh] object-contain rounded-2xl ring-4 ring-indigo-500/50 shadow-2xl"
            />
            <p className="mt-4 text-xs font-black text-indigo-300 tracking-wider uppercase">
              Candidate Verified Photo Preview
            </p>
          </div>
        </div>
      )}
      {/* Preset AI Avatar Selection Modal */}
      {showAvatarModal && (
        <div
          className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShowAvatarModal(false)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col bg-[#15151A] border-2 border-indigo-500/50 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-indigo-500/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-200" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">Select Candidate Avatar</h3>
                  <p className="text-[11px] sm:text-xs text-indigo-200">Choose a cute character avatar (Clear Monkey 🐒, Panda 🐼, Fox 🦊), upload a photo, or use initials.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAvatarModal(false)}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center hover:bg-rose-600 hover:text-white transition cursor-pointer shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Preset Avatars Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 py-4 sm:py-6">
              {PRESET_AVATARS.map((av) => {
                const isSelected = profilePreview === av.url;
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => {
                      playProfileChime(750);
                      setProfilePreview(av.url);
                      try {
                        localStorage.setItem("user_custom_avatar", av.url);
                        window.dispatchEvent(new Event("avatar_changed"));
                      } catch (err) {}
                      setShowAvatarModal(false);
                    }}
                    className={`relative p-2.5 sm:p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all duration-300 transform hover:scale-105 cursor-pointer ${
                      isSelected
                        ? "border-indigo-400 bg-indigo-500/25 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/30"
                        : "border-slate-800 bg-slate-900/70 hover:border-indigo-500/50 hover:bg-slate-900"
                    }`}
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden p-0.5 bg-gradient-to-tr ${av.theme} shadow-md`}>
                      <img src={av.url} alt={av.name} className="w-full h-full object-cover rounded-[14px]" />
                    </div>
                    <span className="text-[11px] sm:text-xs font-black text-white text-center leading-tight">{av.name}</span>
                    {isSelected && (
                      <span className="absolute top-1.5 right-1.5 p-0.5 sm:p-1 rounded-full bg-emerald-500 text-white shadow-md">
                        <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Alternative Actions */}
            <div className="pt-3 sm:pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowAvatarModal(false);
                  fileInputRef.current?.click();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-400/40 text-indigo-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Camera className="w-4 h-4 text-indigo-300" />
                <span>Upload Custom Photo File</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfilePreview(null);
                  setProfileFile(null);
                  try {
                    localStorage.removeItem("user_custom_avatar");
                    window.dispatchEvent(new Event("avatar_changed"));
                  } catch (err) {}
                  setShowAvatarModal(false);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
                <span>Leave as Default Initials</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-300 text-xs sm:text-sm font-extrabold flex items-center gap-3 shadow-2xl shadow-emerald-950/60 animate-in fade-in slide-in-from-top-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 border border-emerald-400/40 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="font-extrabold text-white text-sm">{successMsg}</p>
            <p className="text-[11px] text-emerald-200 mt-0.5">
              Your profile intelligence and target interview settings are active across all AI loops.
            </p>
          </div>
        </div>
      )}

      {/* CANDIDATE HERO BANNER CARD WITH 3D POP-FORWARD ANIMATION */}
      <div
        onMouseEnter={() => playProfileChime(540)}
        className="relative overflow-hidden group bg-[#15151A] border-2 border-indigo-500/50 hover:border-indigo-400/80 rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-10 shadow-2xl shadow-indigo-500/10 flex flex-col md:flex-row items-center md:items-start justify-between gap-5 sm:gap-8 transform hover:-translate-y-3 hover:scale-[1.015] transition-all duration-500 cursor-pointer"
      >
        {/* Soft colorful background gradient overlay that smoothly fades on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/45 via-purple-900/35 to-slate-950 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none" />
        {/* Top glowing light beam when box opens/moves forward */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-8 flex-1 w-full">
          {/* Avatar Section */}
          <div className="relative group/avatar shrink-0">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-2xl shadow-indigo-500/30">
              {profilePreview ? (
                <button
                  type="button"
                  onClick={() => setShowPhotoPreview(true)}
                  className="w-full h-full rounded-[22px] overflow-hidden block group-hover/avatar:opacity-90 transition"
                  title="Click to view high-resolution photo"
                >
                  <img
                    src={profilePreview}
                    alt={user?.name || "Profile"}
                    onError={() => {
                      setProfilePreview(null);
                    }}
                    className="w-full h-full object-cover object-top group-hover/avatar:scale-105 transition-transform duration-300"
                  />
                </button>
              ) : (
                <div className="w-full h-full rounded-[22px] bg-slate-900 text-white flex items-center justify-center text-2xl sm:text-3xl font-black">
                  {(user?.name || "C").charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleProfilePhotoChange}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => setShowAvatarModal(true)}
              className="absolute -top-2 -right-2 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl hover:scale-110 transition cursor-pointer border border-pink-300/40 z-10"
              title="Select from AI Avatar Gallery"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-200" />
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xl hover:scale-110 transition group-hover/avatar:scale-110 cursor-pointer border border-indigo-300/40 z-10"
              title="Upload custom photo from computer"
            >
              <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {profilePreview && (
              <button
                type="button"
                onClick={() => {
                  setProfilePreview(null);
                  setProfileFile(null);
                  try {
                    localStorage.removeItem("user_custom_avatar");
                    window.dispatchEvent(new Event("avatar_changed"));
                  } catch (err) {}
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="absolute -bottom-2 -left-2 p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-xl hover:scale-110 transition cursor-pointer border border-rose-300/40 z-10"
                title="Remove photo and leave as default initials"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

          {/* User Info Overview */}
          <div className="flex-1 text-center md:text-left flex flex-col gap-2.5 sm:gap-3 w-full">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 text-[10px] sm:text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 animate-spin" /> Candidate Readiness Center
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 text-[10px] sm:text-xs font-black shadow-sm">
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> Verified Candidate
              </span>
            </div>

            <h1 className="text-xl sm:text-4xl font-black text-white tracking-tight break-words">
              {user?.name || "Candidate Name"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
              Targeting <span className="font-extrabold text-indigo-300">{formData.targetRole}</span> position at <span className="font-extrabold text-purple-300">{formData.targetCompany}</span>. Preferred tech stack: <span className="font-extrabold text-cyan-300">{formData.preferredLanguage}</span>.
            </p>

            {/* Avatar Photo & Preset Gallery Action Pills */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5 sm:gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAvatarModal(true)}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/40 text-purple-200 text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Preset AI Avatars</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/35 border border-indigo-400/40 text-indigo-200 text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-300" />
                <span>Upload Photo</span>
              </button>

              {profilePreview && (
                <button
                  type="button"
                  onClick={() => {
                    setProfilePreview(null);
                    setProfileFile(null);
                    try {
                      localStorage.removeItem("user_custom_avatar");
                    } catch (err) {}
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 border border-rose-400/40 text-rose-200 text-[11px] sm:text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-300" />
                  <span>Leave as Initials</span>
                </button>
              )}
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3 pt-2 max-w-md w-full mx-auto md:mx-0">
              <div className="p-2.5 sm:p-3 rounded-2xl bg-indigo-950/60 border border-indigo-500/30 text-center shadow-md">
                <p className="text-[9px] sm:text-[10px] font-black text-indigo-300 uppercase tracking-wider">Target Role</p>
                <p className="text-xs sm:text-sm font-black text-white mt-0.5 sm:mt-1 truncate">{formData.targetRole}</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center shadow-md">
                <p className="text-[9px] sm:text-[10px] font-black text-emerald-300 uppercase tracking-wider">AI Score Index</p>
                <p className="text-xs sm:text-sm font-black text-emerald-300 mt-0.5 sm:mt-1">92 / 100</p>
              </div>
              <div className="p-2.5 sm:p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-center shadow-md">
                <p className="text-[9px] sm:text-[10px] font-black text-purple-300 uppercase tracking-wider">Loop Status</p>
                <p className="text-xs sm:text-sm font-black text-purple-200 mt-0.5 sm:mt-1 truncate">Interview Ready</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* REAL WEBSITE NAVIGATION TAB BAR */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: "personal", label: "Personal Details & Bio", icon: User },
          { id: "career", label: "Career & Tech Stack", icon: Target },
          { id: "ai", label: "AI & Voice Preferences", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onMouseEnter={() => playProfileChime(580)}
              onClick={() => {
                playProfileChime(720);
                setActiveTab(tab.id as any);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/30 border border-indigo-300/40 scale-[1.02]"
                  : "bg-[#15151A] text-slate-400 border border-slate-800 hover:border-indigo-500/50 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN SETTINGS CONTENT AREA WITH 3D POP-FORWARD BOX OPENING ANIMATION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        {/* Left Form Box */}
        <form
          onSubmit={handleSubmit}
          onMouseEnter={() => playProfileChime(620)}
          className="relative overflow-hidden group lg:col-span-8 bg-[#15151A] border-2 border-indigo-500/50 hover:border-indigo-400/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 flex flex-col gap-6 transform hover:-translate-y-2.5 hover:scale-[1.01] transition-all duration-500 cursor-pointer"
        >
          {/* Subtle colorful background fill overlay that smoothly fades on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none" />
          {/* Top glowing light beam when box opens/moves forward */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />

          {/* TAB 1: PERSONAL & CONTACT DETAILS */}
          {activeTab === "personal" && (
            <div className="relative z-10 flex flex-col gap-6 animate-fade-in">
              <div className="pb-3 border-b border-indigo-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <User className="w-5 h-5 text-indigo-400" /> Personal Identity & Bio
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Update your contact profile, location, and candidate summary.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-indigo-200 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name..."
                    className="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-slate-900/90 text-white font-extrabold text-sm focus:ring-2 focus:ring-indigo-400 focus:bg-slate-950 placeholder:text-slate-500 placeholder:font-normal placeholder:italic outline-none transition"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-black uppercase tracking-wider text-indigo-200 mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      readOnly
                      className="w-full p-3.5 rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 font-extrabold text-sm cursor-not-allowed outline-none"
                    />
                    <span className="absolute right-3.5 top-3 text-[10px] font-black text-emerald-400 uppercase bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-indigo-200 mb-1.5">
                    Phone Number
                  </label>
                  {(() => {
                    const localNumber = formData.phone.startsWith("+91")
                      ? formData.phone.slice(3)
                      : formData.phone.replace(/\D/g, "");

                    const isIndianNumber =
                      localNumber.length >= 4 && /^[6-9]/.test(localNumber);

                    return (
                      <div className="w-full h-[52px] px-4 rounded-xl border border-indigo-500/40 bg-slate-900/90 flex items-center gap-3 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:bg-slate-950 transition">
                        {isIndianNumber && (
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xl">🇮🇳</span>
                            <span className="text-sm font-black text-indigo-200">
                              +91
                            </span>
                            <div className="h-5 w-px bg-indigo-500/40" />
                          </div>
                        )}
                        <input
                          type="tel"
                          inputMode="numeric"
                          value={localNumber}
                          placeholder="Click to enter 10-digit mobile number..."
                          maxLength={10}
                          onChange={(event) => {
                            const digits = event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10);
                            const detectedAsIndia =
                              digits.length >= 4 && /^[6-9]/.test(digits);
                            setFormData({
                              ...formData,
                              phone: detectedAsIndia ? `+91${digits}` : digits,
                            });
                          }}
                          className="flex-1 min-w-0 bg-transparent border-0 outline-none ring-0 text-sm font-extrabold text-white placeholder:text-slate-500 placeholder:font-normal placeholder:italic"
                        />
                      </div>
                    );
                  })()}
                </div>

                {/* Location */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-indigo-200 mb-1.5">
                    Current Location / Preferred Region
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Click to enter location (e.g. San Francisco, CA / Remote)..."
                    className="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-slate-900/90 text-white font-extrabold text-sm focus:ring-2 focus:ring-indigo-400 focus:bg-slate-950 placeholder:text-slate-500 placeholder:font-normal placeholder:italic outline-none transition"
                  />
                </div>

                {/* Headline / Summary Bio */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-indigo-200 mb-1.5">
                    Short Professional Tagline or Bio
                  </label>
                  <textarea
                    rows={3}
                    name="headline"
                    value={formData.headline}
                    onChange={handleChange}
                    placeholder="Click to enter short professional tagline or bio..."
                    className="w-full p-3.5 rounded-xl border border-indigo-500/40 bg-slate-900/90 text-white text-xs sm:text-sm focus:ring-2 focus:ring-indigo-400 focus:bg-slate-950 placeholder:text-slate-500 placeholder:font-normal placeholder:italic outline-none leading-relaxed resize-none font-medium transition"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CAREER TARGETS & TECH STACK */}
          {activeTab === "career" && (
            <div className="relative z-10 flex flex-col gap-6 animate-fade-in">
              <div className="pb-3 border-b border-purple-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" /> Target Job Role & Company Environment
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize mock interview difficulty, seniority expectations, and tech stack.
                  </p>
                </div>
              </div>

              {/* Target Company Tiles */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-2">
                  Target Company Culture & Scale
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {targetCompanies.map((comp) => {
                    const isSelected = formData.targetCompany === comp.name;
                    return (
                      <button
                        key={comp.name}
                        type="button"
                        onClick={() => {
                          playProfileChime(700);
                          setFormData({ ...formData, targetCompany: comp.name });
                        }}
                        className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between gap-2 transition-all duration-300 transform hover:scale-[1.03] cursor-pointer ${
                          isSelected
                            ? "border-purple-400 bg-purple-500/20 text-white font-black shadow-lg shadow-purple-500/20 ring-2 ring-purple-400/50"
                            : "border-slate-800 bg-slate-900/60 text-slate-300 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{comp.name}</span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-purple-300" />
                          )}
                        </div>
                        <span className="text-[10px] font-extrabold text-purple-300/80">
                          {comp.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Target Role */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-1.5">
                  Target Role Title
                </label>
                <select
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  className="w-full p-3.5 rounded-xl border border-purple-500/40 bg-slate-900/90 text-white font-black text-sm focus:ring-2 focus:ring-purple-400 outline-none cursor-pointer"
                >
                  {targetRoles.map((role) => (
                    <option key={role} value={role} className="bg-slate-900 text-white">
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Programming Language */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-2">
                  Primary Coding Language
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Python", "JavaScript", "TypeScript", "Java", "C++", "Go", "Rust"].map((langName) => {
                    const isSelected = formData.preferredLanguage === langName;
                    return (
                      <button
                        key={langName}
                        type="button"
                        onClick={() => {
                          playProfileChime(640);
                          setFormData({ ...formData, preferredLanguage: langName });
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-black border transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white border-purple-300 shadow-lg shadow-purple-500/40 scale-105 ring-2 ring-purple-400/40"
                            : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-purple-400/60 hover:text-white"
                        }`}
                      >
                        {langName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Secondary Technical Skill Pills */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-purple-200 mb-2">
                  Secondary Technical Skill Set (Click to Toggle)
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSkills.map((skill) => {
                    const isChecked = formData.secondarySkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => {
                          playProfileChime(600);
                          toggleSkill(skill);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/50 shadow-sm"
                            : "bg-slate-900/60 text-slate-400 border-slate-800 hover:border-slate-600 hover:text-slate-200"
                        }`}
                      >
                        {isChecked ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <span className="w-3.5 h-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI & VOICE PREFERENCES */}
          {activeTab === "ai" && (
            <div className="relative z-10 flex flex-col gap-6 animate-fade-in">
              <div className="pb-3 border-b border-cyan-500/30 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-cyan-400" /> AI Interviewer & Voice Settings
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Configure real-time voice speech rate, audio auto-play, and camera proctoring.
                  </p>
                </div>
              </div>

              {/* Voice Speed */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-cyan-200 mb-2">
                  AI Interviewer Speech Rate
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["0.85x Slow", "1.0x Normal", "1.15x Fast"].map((spd) => {
                    const isSelected = formData.voiceSpeed === spd;
                    return (
                      <button
                        key={spd}
                        type="button"
                        onClick={() => setFormData({ ...formData, voiceSpeed: spd })}
                        className={`p-3 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                          isSelected
                            ? "border-cyan-400 bg-cyan-500/20 text-white shadow-md shadow-cyan-500/20"
                            : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-cyan-500/40"
                        }`}
                      >
                        {spd}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col gap-4">
                <label className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                  <div>
                    <p className="text-xs font-extrabold text-white">Auto-Play Question Voice Audio</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Automatically read interview questions aloud using Web Speech Synthesis.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.autoPlaySpeech}
                    onChange={(e) => setFormData({ ...formData, autoPlaySpeech: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </label>

                <label className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-500/40 transition">
                  <div>
                    <p className="text-xs font-extrabold text-white">Live Proctoring Camera Alerts</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Monitor face orientation and body posture via MediaPipe vision.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.proctorAlerts}
                    onChange={(e) => setFormData({ ...formData, proctorAlerts: e.target.checked })}
                    className="w-5 h-5 accent-indigo-500 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}



          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="relative z-10 self-end px-8 py-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-black text-sm shadow-xl shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2 cursor-pointer mt-2 disabled:opacity-50"
          >
            {saving ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save Profile Settings"}</span>
          </button>
        </form>

        {/* Right Candidate Passport & Skill Mastery Gallery */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Candidate Passport Box */}
          <div
            onMouseEnter={() => playProfileChime(660)}
            className="relative overflow-hidden group bg-[#15151A] border-2 border-indigo-500/40 hover:border-indigo-400/80 rounded-3xl p-6 shadow-2xl shadow-indigo-950/70 flex flex-col gap-5 transform hover:-translate-y-2.5 hover:scale-[1.02] transition-all duration-500 cursor-pointer"
          >
            {/* Top glowing light beam when box opens/moves forward */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-indigo-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-transparent group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-indigo-400" /> Candidate Passport
              </span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            </div>

            <div className="relative z-10 p-4 rounded-2xl bg-slate-900/90 text-white flex flex-col gap-3 border border-indigo-500/30 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                  {(user?.name || "C").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-sm text-white truncate">{formData.name || "Candidate"}</p>
                  <p className="text-[11px] text-indigo-300 font-bold truncate">{formData.targetRole}</p>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block font-semibold">Target Company</span>
                  <span className="font-extrabold text-white">{formData.targetCompany}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Main Tech</span>
                  <span className="font-extrabold text-emerald-400">{formData.preferredLanguage}</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-3">
              <p className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1">
                <Trophy className="w-4 h-4 text-amber-400" /> Skill Mastery Badges
              </p>

              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1.5 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-indigo-400" /> Algorithms (Advanced)
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-purple-500/20 border border-purple-400/40 text-purple-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-purple-400" /> System Design
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Behavioral Ace
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
