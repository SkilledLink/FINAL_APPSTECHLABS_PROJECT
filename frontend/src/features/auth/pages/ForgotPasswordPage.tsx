// src/features/auth/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";

export default function ForgotPasswordPage() {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await forgotPassword({ email });
    if (success) setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title="Check your inbox">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-4"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-[#122E21]">
            <MailCheck size={26} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Check your inbox</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            If an account exists for <span className="text-slate-900 font-bold">{email}</span>, we've sent a link to reset your password.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-6 flex items-center gap-2 text-xs font-bold text-slate-900 hover:underline transition"
          >
            <ArrowLeft size={14} />
            Back to sign in
          </button>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Reset password</h1>
        <p className="text-xs text-slate-400 mt-1">Enter your email and we'll send you a reset link.</p>
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearError();
            }}
            placeholder="example@gmail.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#122E21] hover:bg-[#1B3A2B] text-white font-bold text-xs py-3 rounded-full transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm active:scale-[0.99]"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Send reset link"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}