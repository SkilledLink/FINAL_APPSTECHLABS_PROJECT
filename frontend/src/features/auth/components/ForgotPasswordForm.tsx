<<<<<<< HEAD
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft, Mail, MailCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";

export function ForgotPasswordForm() {
  const { forgotPassword, loading, error, clearError } = useAuth();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const ok = await forgotPassword({ email });
    if (ok) setSent(true);
  };

  if (sent) {
    return (
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <div className="w-11 h-11 rounded-xl bg-[#4F46E5]/[0.08] flex items-center justify-center">
          <MailCheck size={20} className="text-[#4F46E5]" strokeWidth={1.8} />
        </div>
        <h1 className="text-[#0F172A] text-[24px] sm:text-[27px] font-bold tracking-tight mt-4">
          Check your inbox
        </h1>
        <p className="text-[#64748B] text-[14.5px] mt-2">
          If an account exists for <span className="text-[#0F172A] font-medium">{email}</span>,
          we've sent a link to reset your password.
        </p>
        <Link
          to="/login"
          className="mt-7 inline-flex items-center gap-1.5 text-[14px] text-[#4F46E5] font-medium hover:text-[#3730A3]"
        >
          <ArrowLeft size={15} />
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
      <h1 className="text-[#0F172A] text-[24px] sm:text-[27px] font-bold tracking-tight">
        Reset your password
      </h1>
      <p className="text-[#64748B] text-[14.5px] mt-2">
        Enter the email tied to your account and we'll send you a reset link.
      </p>

      {error && (
        <div className="mt-4 text-[13px] text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3.5 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span
            className="text-[12.5px] font-medium text-[#475569] mb-1.5 block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Email address
          </span>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${focused ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10" : "border-[#E2E8F0] hover:border-[#CBD5E1]"
              }`}
          >
            <Mail size={17} strokeWidth={1.8} className={focused ? "text-[#4F46E5]" : "text-[#94A3B8]"} />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => {
                setFocused(true);
                clearError();
              }}
              onBlur={() => setFocused(false)}
              placeholder="you@company.com"
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="group w-full bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.98] text-white font-semibold text-[15px] py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Send reset link
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <Link
        to="/login"
        className="mt-7 flex items-center justify-center gap-1.5 text-[14px] text-[#64748B] hover:text-[#0F172A] transition-colors"
      >
        <ArrowLeft size={15} />
        Back to sign in
      </Link>
    </div>
  );
}
=======
import React, { useState } from 'react';
import type { AuthView } from '../types/auth.types';

interface ForgotPasswordFormProps {
  onNavigate?: (view: AuthView) => void;
  onSubmit?: (email: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onNavigate, onSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) onSubmit(email);
  };

  return (
    <div className="w-full max-w-sm mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
      <p className="text-sm text-gray-600 mb-6">Enter your email to receive password reset instructions.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
        >
          Send Reset Link
        </button>
      </form>

      <button
        type="button"
        onClick={() => onNavigate?.('login')}
        className="w-full mt-4 text-blue-600 hover:underline text-sm"
      >
        Back to Login
      </button>
    </div>
  );
};
>>>>>>> 068172ec0a0ac18df41f431507b0fe7a6030a66c
