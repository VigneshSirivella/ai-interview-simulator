import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
  Sparkles,
  User,
} from "lucide-react";

import {
  apiService,
  getApiError,
} from "../services/api";

interface RegistrationForm {
  full_name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState<RegistrationForm>({
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const isStrongPassword = (password: string) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  };

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    const cleanName = formData.full_name.trim();
    const cleanEmail = formData.email
      .trim()
      .toLowerCase();

    if (cleanName.length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (!cleanEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError(
        "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number and one special character."
      );
      return;
    }

    if (
      formData.password !== formData.confirmPassword
    ) {
      setError(
        "Password and confirm password do not match."
      );
      return;
    }

    setLoading(true);

    try {
      await apiService.register({
        full_name: cleanName,
        email: cleanEmail,
        password: formData.password,
      });

      setOtpSent(true);

      setSuccessMessage(
        `A 6-digit OTP was sent to ${cleanEmail}.`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Registration failed. Please check your details."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setSuccessMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    setVerifying(true);

    try {
      await apiService.verifyOtp(
        formData.email.trim().toLowerCase(),
        otp
      );

      setSuccessMessage(
        "Email verified successfully. Redirecting to login..."
      );

      window.setTimeout(() => {
        navigate("/login?verified=true");
      }, 1200);
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "OTP verification failed. Please check the OTP."
        )
      );
    } finally {
      setVerifying(false);
    }
  };

  const changeRegistrationDetails = () => {
    setOtpSent(false);
    setOtp("");
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-10 lg:py-12">
      <div className="max-w-md w-full bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-14 -right-14 w-44 h-44 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mb-7 relative">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Create Candidate Account
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Create your account quickly and start practising
            AI interviews.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />

            <span>{successMessage}</span>
          </div>
        )}

        {!otpSent ? (
          <form
            onSubmit={handleRegister}
            className="flex flex-col gap-4"
          >
            <div>
              <label
                htmlFor="register-full-name"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Full Name
              </label>

              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  id="register-full-name"
                  type="text"
                  name="full_name"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-email"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="candidate@example.com"
                  autoComplete="email"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="register-password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  id="register-password"
                  type={
                    showPassword ? "text" : "password"
                  }
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
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

            <div>
              <label
                htmlFor="register-confirm-password"
                className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5"
              >
                Confirm Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Enter the password again"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) => !current
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 disabled:opacity-50"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700">
              <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                Password must contain at least 8 characters,
                one uppercase letter, one lowercase letter,
                one number and one special character.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Register and Send OTP
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="p-5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-3">
              <KeyRound className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />

              <h3 className="font-bold text-slate-900 dark:text-white">
                Verify Email OTP
              </h3>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 leading-5">
              Enter the six-digit OTP sent to{" "}
              <strong className="text-slate-900 dark:text-white">
                {formData.email.trim().toLowerCase()}
              </strong>
              .
            </p>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(event) =>
                setOtp(
                  event.target.value.replace(/\D/g, "")
                )
              }
              placeholder="000000"
              disabled={verifying}
              className="w-full px-3 sm:px-4 py-3 rounded-xl border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-center tracking-[0.25em] sm:tracking-[0.5em] font-bold outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={verifying || otp.length !== 6}
              className="mt-4 w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {verifying ? (
                <>
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying OTP...
                </>
              ) : (
                <>
                  Verify OTP
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={changeRegistrationDetails}
              disabled={verifying}
              className="mt-4 w-full text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline disabled:opacity-50"
            >
              Change email or registration details
            </button>

            <p className="mt-4 text-[11px] text-center text-slate-500 dark:text-slate-400">
              Use the latest OTP received in your email.
            </p>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500">
          Already registered?{" "}

          <Link
            to="/login"
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};