import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Send,
  Sparkles,
} from "lucide-react";
import {
  apiService,
  getApiError,
} from "../services/api";

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const sendResetOtp = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");
    setLoading(true);

    try {
      await apiService.forgotPassword(
        email.trim().toLowerCase()
      );

      setStep(2);
      setMessage(
        `Password reset OTP sent to ${email}.`
      );
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Unable to send password reset OTP."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await apiService.resetPassword(
        email.trim().toLowerCase(),
        otp,
        newPassword
      );

      navigate("/login?reset=success");
    } catch (requestError) {
      setError(
        getApiError(
          requestError,
          "Password reset failed."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white dark:bg-[#15151A] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-7">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-3">
            <Sparkles className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-extrabold">
            Reset Password
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            {step === 1
              ? "Enter your registered email address"
              : "Enter the OTP and create a new password"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        {step === 1 ? (
          <form
            onSubmit={sendResetOtp}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold mb-1.5">
                Registered Email Address
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="candidate@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send Password Reset OTP
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          <form
            onSubmit={resetPassword}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-bold mb-1.5">
                OTP Code
              </label>

              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value.replace(/\D/g, "")
                    )
                  }
                  placeholder="Enter 6-digit OTP"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5">
                New Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  required
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(event.target.value)
                  }
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current
                    )
                  }
                  className="absolute right-3.5 top-3.5 text-slate-400"
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
              <label className="block text-xs font-bold mb-1.5">
                Confirm New Password
              </label>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />

                <input
                  type={
                    showPassword ? "text" : "password"
                  }
                  required
                  value={confirmPassword}
                  onChange={(event) =>
                    setConfirmPassword(event.target.value)
                  }
                  placeholder="Repeat new password"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Reset Password"
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setNewPassword("");
                setConfirmPassword("");
                setError("");
                setMessage("");
              }}
              className="w-full text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
            >
              Change email address
            </button>
          </form>
        )}

        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
};