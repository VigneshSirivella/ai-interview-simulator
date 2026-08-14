import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldAlert,
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
            callback: (
              response: GoogleCredentialResponse
            ) => void;
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

export const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const googleButtonRef =
    useRef<HTMLDivElement | null>(null);

  const googleLoginRef = useRef(googleLogin);

  useEffect(() => {
    googleLoginRef.current = googleLogin;
  }, [googleLogin]);

  const isAuthenticationRequired =
    location.search.includes("unregistered=true") ||
    location.search.includes("authRequired=true");

  const passwordResetSuccessful =
    location.search.includes("reset=success");

  const emailVerified =
    location.search.includes("verified=true");

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  const [rememberMe, setRememberMe] =
    useState(true);

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID;

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
      if (cancelled) {
        return;
      }

      if (
        !window.google ||
        !googleButtonRef.current
      ) {
        attempts += 1;

        if (attempts < 20) {
          timeoutId = window.setTimeout(
            renderGoogleButton,
            250
          );
        } else {
          console.error(
            "Unable to load Google Sign-In."
          );
        }

        return;
      }

      googleButtonRef.current.innerHTML = "";

      window.google.accounts.id.initialize({
        client_id: clientId,

        callback: async (
          response: GoogleCredentialResponse
        ) => {
          if (!response.credential) {
            setErrorMessage(
              "Google did not return a valid credential."
            );

            return;
          }

          setErrorMessage("");
          setLoading(true);

          try {
            const success =
              await googleLoginRef.current(
                response.credential
              );

            if (success) {
              navigate("/dashboard");
              return;
            }

            setErrorMessage(
              "Google login failed. Please try again."
            );
          } catch (error) {
            console.error(
              "Google login error:",
              error
            );

            setErrorMessage(
              "Unable to sign in with Google."
            );
          } finally {
            setLoading(false);
          }
        },
      });

      window.google.accounts.id.renderButton(
        googleButtonRef.current,
        {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 350,
        }
      );
    };

    renderGoogleButton();

    return () => {
      cancelled = true;

      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    try {
      const success = await login(
        email.trim().toLowerCase(),
        password
      );

      if (success) {
        if (!rememberMe) {
          // Later, sessionStorage can be used here.
        }

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
    <div className="min-h-[80vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10 lg:py-12">
      <div className="max-w-md w-full bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Candidate Login
          </h2>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Sign in to access interviews, reports and
            analytics
          </p>
        </div>

        {isAuthenticationRequired && (
          <div className="mb-5 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-xs">
              <ShieldAlert className="w-5 h-5 shrink-0" />

              Authentication required
            </div>

            <p className="mt-2 text-xs text-rose-700 dark:text-rose-300">
              Please sign in or create an account before
              accessing this page.
            </p>

            <Link
              to="/register"
              className="mt-3 py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Create an account
            </Link>
          </div>
        )}

        {passwordResetSuccessful && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            Password changed successfully. You can now log
            in using your new password.
          </div>
        )}

        {emailVerified && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
            Email verified successfully. Please log in.
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />

            <span>{errorMessage}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              htmlFor="login-email"
              className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Email Address
            </label>

            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="candidate@example.com"
                autoComplete="email"
                disabled={loading}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                Password
              </label>

              <Link
                to="/forgot-password"
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

              <input
                id="login-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                required
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-60"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) => !current
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600 dark:text-slate-400">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) =>
                setRememberMe(
                  event.target.checked
                )
              }
              disabled={loading}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />

            Remember me
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                Sign In to Dashboard
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />

          <span className="text-[11px] font-semibold uppercase text-slate-400 whitespace-nowrap">
            Or continue with
          </span>

          <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        </div>

        <div
          className={
            loading
              ? "flex justify-center opacity-50 pointer-events-none"
              : "flex justify-center"
          }
        >
          <div ref={googleButtonRef} />
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}

          <Link
            to="/register"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Register Candidate Account
          </Link>
        </div>
      </div>
    </div>
  );
};