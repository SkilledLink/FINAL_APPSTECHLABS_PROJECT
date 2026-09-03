// src/features/auth/pages/ResetPasswordPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";
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

  const handleCodeComplete = (value: string) => {
    setCode(value);
    if (value.length === 6) {
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
      <AuthLayout title="Password updated">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-6"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-[#122E21]">
            <CheckCircle2 size={26} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Password updated</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Your password has been changed successfully. Redirecting to sign in...
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={step === "code" ? "Enter verification code" : "Set a new password"}>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          {step === "code" ? "Verification code" : "Set new password"}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          {step === "code"
            ? `We sent a 6-digit code to ${email || "your email"}`
            : "Make it something you haven't used before."}
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3"
        >
          {error}
        </motion.div>
      )}

      {step === "code" ? (
        <>
          <div className="flex justify-center py-2">
            <OTPInput length={6} value={code} onChange={setCode} onComplete={handleCodeComplete} />
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            Didn't receive the code?{" "}
            <button
              type="button"
              className="text-slate-900 font-bold hover:underline transition ml-0.5"
            >
              Resend
            </button>
          </p>
          <div className="mt-6 text-center">
            <Link to="/forgot-password" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
              <ArrowLeft size={14} />
              Start over
            </Link>
          </div>
        </>
      ) : (
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">New password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => clearError()}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Confirm password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setMismatch(false);
                }}
                onFocus={() => clearError()}
                placeholder="Re-enter password"
                className={`w-full bg-slate-50 border ${mismatch ? "border-red-300" : "border-slate-200"} rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition`}
              />
            </div>
            {mismatch && <p className="text-[11px] text-red-500 mt-1">Passwords don't match.</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#122E21] hover:bg-[#1B3A2B] text-white font-bold text-xs py-3 rounded-full transition duration-200 flex items-center justify-center disabled:opacity-50 shadow-sm active:scale-[0.99]"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Update password"
            )}
          </button>

          <div className="mt-4 text-center">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
              <ArrowLeft size={14} />
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}