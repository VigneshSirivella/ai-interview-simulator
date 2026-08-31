import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: GoogleCredentialResponse) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: {
              type?: string;
              theme?: string;
              size?: string;
              text?: string;
              shape?: string;
              logo_alignment?: string;
              width?: number;
            }
          ) => void;
        };
      };
    };
  }
}

// Ultra-Clear High-Definition SVG Animated Monkey Mascot Component
interface MonkeyMascotProps {
  state: "open" | "closed" | "peek";
}

const MonkeyMascot: React.FC<MonkeyMascotProps> = ({ state }) => {
  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center filter drop-shadow-xl transition-all duration-300 transform hover:scale-105">
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-pink-500/20 blur-md -z-10" />

      <svg
        viewBox="0 0 120 120"
        className="w-full h-full overflow-visible select-none"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="monkeyFurGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B35B29" />
            <stop offset="50%" stopColor="#8C4118" />
            <stop offset="100%" stopColor="#5E270A" />
          </linearGradient>

          <linearGradient id="monkeySnoutGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF0E5" />
            <stop offset="100%" stopColor="#F8D3B8" />
          </linearGradient>

          <linearGradient id="monkeyEarInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8B195" />
            <stop offset="100%" stopColor="#F67280" />
          </linearGradient>

          <filter id="monkeyShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Outer Ears with Crisp Gradient Inner */}
        <g filter="url(#monkeyShadow)">
          {/* Left Ear */}
          <circle cx="20" cy="46" r="15" fill="url(#monkeyFurGrad)" />
          <circle cx="20" cy="46" r="9" fill="url(#monkeyEarInnerGrad)" opacity="0.9" />

          {/* Right Ear */}
          <circle cx="100" cy="46" r="15" fill="url(#monkeyFurGrad)" />
          <circle cx="100" cy="46" r="9" fill="url(#monkeyEarInnerGrad)" opacity="0.9" />
        </g>

        {/* Main Head */}
        <circle cx="60" cy="56" r="38" fill="url(#monkeyFurGrad)" filter="url(#monkeyShadow)" />

        {/* Snout Area */}
        <path
          d="M 36 48 C 36 34, 50 34, 60 41 C 70 34, 84 34, 84 48 C 84 68, 76 77, 60 77 C 44 77, 36 68, 36 48 Z"
          fill="url(#monkeySnoutGrad)"
          filter="url(#monkeyShadow)"
        />

        {/* Eyes & Expressions */}
        <g className="transition-all duration-300">
          {state === "closed" ? (
            <>
              {/* Closed Eyes Curved Arcs */}
              <path
                d="M 42 47 Q 49 54 56 47"
                stroke="#4A1D07"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M 64 47 Q 71 54 78 47"
                stroke="#4A1D07"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </>
          ) : state === "peek" ? (
            <>
              {/* Left Eye Closed, Right Eye Open & Curious */}
              <path
                d="M 42 47 Q 49 54 56 47"
                stroke="#4A1D07"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              {/* Right Eye */}
              <circle cx="71" cy="46" r="8.5" fill="#FFFFFF" stroke="#4A1D07" strokeWidth="1.8" />
              <circle cx="71" cy="46" r="4.2" fill="#0F172A" />
              <circle cx="73.5" cy="43.5" r="1.8" fill="#FFFFFF" />
              <circle cx="69" cy="48" r="0.9" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* Both Eyes Wide Open, Clear & Sparkling */}
              <circle cx="49" cy="46" r="8.5" fill="#FFFFFF" stroke="#4A1D07" strokeWidth="1.8" />
              <circle cx="49" cy="46" r="4.2" fill="#0F172A" />
              <circle cx="51.5" cy="43.5" r="1.8" fill="#FFFFFF" />
              <circle cx="47" cy="48" r="0.9" fill="#FFFFFF" />

              <circle cx="71" cy="46" r="8.5" fill="#FFFFFF" stroke="#4A1D07" strokeWidth="1.8" />
              <circle cx="71" cy="46" r="4.2" fill="#0F172A" />
              <circle cx="73.5" cy="43.5" r="1.8" fill="#FFFFFF" />
              <circle cx="69" cy="48" r="0.9" fill="#FFFFFF" />
            </>
          )}
        </g>

        {/* Crisp Nose */}
        <ellipse cx="60" cy="58" rx="5" ry="3.8" fill="#4A1D07" />

        {/* Cute Smile */}
        {state === "closed" ? (
          <path
            d="M 53 67 Q 60 71 67 67"
            stroke="#4A1D07"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ) : state === "peek" ? (
          <path
            d="M 52 66 Q 60 74 68 66"
            stroke="#4A1D07"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          <path
            d="M 51 65 Q 60 75 69 65"
            stroke="#4A1D07"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* Rosy Blush Cheeks */}
        <circle cx="38" cy="58" r="5" fill="#FF6B6B" opacity="0.5" />
        <circle cx="82" cy="58" r="5" fill="#FF6B6B" opacity="0.5" />

        {/* Paws with Dynamic Transform Animations */}
        <g
          className="transition-all duration-300 ease-out origin-bottom-left"
          style={{
            transform:
              state === "closed"
                ? "translate(17px, -38px) rotate(10deg)"
                : state === "peek"
                ? "translate(16px, -38px) rotate(12deg)"
                : "translate(0px, 0px)",
          }}
        >
          <ellipse cx="30" cy="90" rx="12" ry="15" fill="url(#monkeyFurGrad)" filter="url(#monkeyShadow)" />
          <ellipse cx="30" cy="90" rx="7.5" ry="10" fill="url(#monkeySnoutGrad)" opacity="0.9" />
        </g>

        <g
          className="transition-all duration-300 ease-out origin-bottom-right"
          style={{
            transform:
              state === "closed"
                ? "translate(-17px, -38px) rotate(-10deg)"
                : state === "peek"
                ? "translate(-10px, -22px) rotate(-20deg)"
                : "translate(0px, 0px)",
          }}
        >
          <ellipse cx="90" cy="90" rx="12" ry="15" fill="url(#monkeyFurGrad)" filter="url(#monkeyShadow)" />
          <ellipse cx="90" cy="90" rx="7.5" ry="10" fill="url(#monkeySnoutGrad)" opacity="0.9" />
        </g>
      </svg>
    </div>
  );
};

export const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const googleLoginRef = useRef(googleLogin);

  useEffect(() => {
    googleLoginRef.current = googleLogin;
  }, [googleLogin]);

  const isAuthenticationRequired =
    location.search.includes("unregistered=true") ||
    location.search.includes("authRequired=true");

  const passwordResetSuccessful = location.search.includes("reset=success");
  const emailVerified = location.search.includes("verified=true");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const monkeyState: "open" | "closed" | "peek" = isPasswordFocused
    ? showPassword
      ? "peek"
      : "closed"
    : "open";

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    if (!clientId) {
      console.error(
        "VITE_GOOGLE_CLIENT_ID is missing in the frontend .env file."
      );
      return;
    }

    let attempts = 0;
    let timeoutId: number | undefined;
    let cancelled = false;

    const renderGoogleButton = () => {
      if (cancelled) return;

      if (!window.google || !googleButtonRef.current) {
        attempts += 1;
        if (attempts < 20) {
          timeoutId = window.setTimeout(renderGoogleButton, 250);
        } else {
          console.error("Unable to load Google Sign-In script.");
        }
        return;
      }

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: GoogleCredentialResponse) => {
          if (!response.credential) {
            setErrorMessage("Google did not return a valid credential.");
            return;
          }

          setErrorMessage("");
          setLoading(true);

          try {
            const success = await googleLoginRef.current(response.credential);
            if (success) {
              navigate("/dashboard");
              return;
            }
            setErrorMessage("Google login failed. Please try again.");
          } catch (error) {
            console.error("Google login error:", error);
            setErrorMessage("Unable to sign in with Google.");
          } finally {
            setLoading(false);
          }
        },
      });

      const containerWidth = googleButtonRef.current?.parentElement?.clientWidth || 280;
      const targetWidth = Math.max(240, Math.min(containerWidth - 10, 300));

      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: targetWidth,
      });
    };

    renderGoogleButton();

    return () => {
      cancelled = true;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const success = await login(email.trim().toLowerCase(), password);

      if (success) {
        navigate("/dashboard");
        return;
      }

      setErrorMessage(
        "Login failed. Check your email, password, and verify your email."
      );
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage(
        "Unable to login. Please make sure the backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[78vh] flex items-center justify-center px-3 py-4 sm:py-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/3 w-[350px] h-[350px] bg-gradient-to-tr from-pink-500/20 via-purple-600/20 to-indigo-500/20 rounded-full blur-[110px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-[350px] h-[350px] bg-gradient-to-br from-cyan-400/15 via-indigo-600/20 to-fuchsia-600/20 rounded-full blur-[110px] pointer-events-none animate-pulse" />

      {/* Main Single Centered Login Card - Compact Padding & Height */}
      <div className="w-full max-w-[420px] p-[2px] rounded-3xl bg-gradient-to-r from-pink-500 via-purple-500 via-indigo-500 to-cyan-400 shadow-2xl shadow-purple-500/20 relative z-10">
        
        {/* Inner Glass Container */}
        <div className="w-full bg-white/90 dark:bg-[#12131F]/90 backdrop-blur-2xl rounded-[22px] p-5 sm:p-6 shadow-inner overflow-hidden relative">
          
          {/* Top Tag Header */}
          <div className="flex items-center justify-center mb-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>AI Candidate Portal</span>
            </div>
          </div>

          {/* HD Crisp Interactive Monkey Mascot Header */}
          <div className="mb-3 text-center">
            <MonkeyMascot state={monkeyState} />
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Candidate Login
            </h2>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {monkeyState === "closed"
                ? "🙈 Password encrypted & protected"
                : monkeyState === "peek"
                ? "🐵 Checking your password details"
                : "Sign in to access your interviews & AI reports"}
            </p>
          </div>

          {/* Alert Banners */}
          {isAuthenticationRequired && (
            <div className="mb-3 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold text-xs">
                <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                <span>Authentication required</span>
              </div>
              <p className="mt-0.5 text-[11px] text-rose-700 dark:text-rose-300">
                Please sign in or create an account before accessing this page.
              </p>
              <Link
                to="/register"
                className="mt-2 py-1.5 px-3 rounded-lg bg-gradient-to-r from-rose-600 to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Create account
              </Link>
            </div>
          )}

          {passwordResetSuccessful && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>Password changed successfully. Please log in.</span>
            </div>
          )}

          {emailVerified && (
            <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
              <span>Email verified successfully! Please log in.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-3 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Field */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1"
              >
                Email Address
              </label>
              <div className="relative group">
                <Mail className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-purple-500 absolute left-3 top-3 transition-colors" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={() => setIsPasswordFocused(false)}
                  placeholder="candidate@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all disabled:opacity-60 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="login-password"
                  className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:text-pink-500 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="w-3.5 h-3.5 text-slate-400 group-focus-within:text-purple-500 absolute left-3 top-3 transition-colors" />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-900/80 text-slate-900 dark:text-white text-xs sm:text-sm focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all disabled:opacity-60 placeholder:text-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  disabled={loading}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-3 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors disabled:opacity-50"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  disabled={loading}
                  className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 transition cursor-pointer"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Primary Gradient CTA Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="my-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Google OAuth Button */}
          <div
            className={
              loading
                ? "flex justify-center opacity-50 pointer-events-none"
                : "flex justify-center"
            }
          >
            <div ref={googleButtonRef} className="w-full flex justify-center min-h-[40px]" />
          </div>

          {/* Footer Register Link */}
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Don&apos;t have an account?</span>
            <Link
              to="/register"
              className="font-extrabold text-purple-600 dark:text-purple-400 hover:text-pink-500 transition-colors flex items-center gap-1"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="mt-3 flex items-center justify-center gap-2.5 text-[9px] text-slate-400 dark:text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Lock className="w-2.5 h-2.5 text-purple-500" />
              256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
              SOC-2 Certified
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};