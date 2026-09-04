// src/features/auth/pages/ResetPasswordPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { OTPInput } from "../components/OTPInput";

export default function ResetPasswordPage() {
  const { resetPassword, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [step, setStep] = useState<"code" | "password">("code");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mismatch, setMismatch] = useState(false);
  const [done, setDone] = useState(false);

  const handleCodeComplete = async (value: string) => {
    setCode(value);
    if (value.length === 6) {
      // Auto-advance to password step
      setTimeout(() => setStep("password"), 400);
    }
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMismatch(true);
      return;
    }
    setMismatch(false);
    const success = await resetPassword({
      email,
      code,
      new_password: password,
    });
    if (success) {
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  if (done) {
    return (
      <div className="py-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 size={28} strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          Password updated
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
          Your password has been changed successfully. Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        {step === "code" ? "Verification code" : "Set new password"}
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
        {step === "code"
          ? `We sent a 6-digit code to ${email || "your email"}`
          : "Make it something you haven't used before."}
      </p>

      {error && (
        <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 font-medium">
          {error}
        </div>
      )}

      {step === "code" ? (
        <>
          <div className="flex justify-center py-2">
            <OTPInput
              length={6}
              value={code}
              onChange={setCode}
              onComplete={handleCodeComplete}
              disabled={loading}
            />
          </div>
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
            Didn't receive the code?{" "}
            <button
              type="button"
              onClick={() => {
                // Optional: implement resend logic
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all ml-0.5 cursor-pointer"
            >
              Resend
            </button>
          </p>
          <div className="mt-6 text-center">
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Start over</span>
            </Link>
          </div>
        </>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              New password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => clearError()}
                placeholder="At least 8 characters"
                className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Confirm password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMismatch(false);
                }}
                onFocus={() => clearError()}
                placeholder="Re-enter password"
                className={`w-full bg-white/60 dark:bg-slate-950/50 border ${
                  mismatch ? "border-red-500" : "border-slate-300/80 dark:border-slate-800"
                } rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all`}
              />
            </div>
            {mismatch && (
              <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1">
                Passwords don't match.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              "Update password"
            )}
          </button>

          <div className="mt-4 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to sign in</span>
            </Link>
          </div>
        </form>
      )}
    </div>
  );
}