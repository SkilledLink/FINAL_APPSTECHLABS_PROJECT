<<<<<<< HEAD
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Lock, Mail } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { LoginCredentials } from "../types/auth.types";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth();
  const [accountType, setAccountType] = useState<"client" | "professional">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const credentials: LoginCredentials = { email, password, accountType };
    const ok = await login(credentials);
    if (ok) onSuccess?.();
  };

  return (
    <div 
      className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      <h1 className="text-[#0F172A] text-[26px] sm:text-[30px] font-bold tracking-tight">
        Sign in to Vantage
      </h1>
      <p className="text-[#64748B] text-[15px] mt-2">
        Use your account credentials to continue.
      </p>

      {/* account type toggle */}
      <div className="mt-7 relative flex bg-[#F1F5F9] rounded-xl p-1">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#0F172A] rounded-lg transition-transform duration-300 ease-out"
          style={{
            transform:
              accountType === "client" ? "translateX(0)" : "translateX(calc(100% + 8px))",
          }}
        />
        <button
          type="button"
          onClick={() => setAccountType("client")}
          className={`relative z-10 flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors duration-300 ${
            accountType === "client" ? "text-white" : "text-[#64748B]"
          }`}
        >
          Client
        </button>
        <button
          type="button"
          onClick={() => setAccountType("professional")}
          className={`relative z-10 flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors duration-300 ${
            accountType === "professional" ? "text-white" : "text-[#64748B]"
          }`}
        >
          Professional
        </button>
      </div>

      {error && (
        <div className="mt-4 text-[13px] text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3.5 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <label className="block">
          <span
            className="text-[12.5px] font-medium text-[#475569] mb-1.5 block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Email address
          </span>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${
              focused === "email"
                ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                : "border-[#E2E8F0] hover:border-[#CBD5E1]"
            }`}
          >
            <Mail
              size={17}
              strokeWidth={1.8}
              className={focused === "email" ? "text-[#4F46E5]" : "text-[#94A3B8]"}
            />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => {
                setFocused("email");
                clearError();
              }}
              onBlur={() => setFocused(null)}
              placeholder="you@company.com"
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </label>

        <label className="block">
          <span
            className="text-[12.5px] font-medium text-[#475569] mb-1.5 block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Password
          </span>
          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${
              focused === "password"
                ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                : "border-[#E2E8F0] hover:border-[#CBD5E1]"
            }`}
          >
            <Lock
              size={17}
              strokeWidth={1.8}
              className={focused === "password" ? "text-[#4F46E5]" : "text-[#94A3B8]"}
            />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => {
                setFocused("password");
                clearError();
              }}
              onBlur={() => setFocused(null)}
              placeholder="••••••••"
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
            </button>
          </div>
        </label>

        <div className="flex justify-end -mt-1">
          <Link
            to="/forgot-password"
            className="text-[13px] text-[#4F46E5] font-medium hover:text-[#3730A3] transition-colors"
          >
            Forgot password?
          </Link>
=======
import React, { useState } from "react";

export const LoginForm: React.FC = () => {
  const [role, setRole] = useState<"CLIENT" | "PROFESSIONAL">("CLIENT");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Login submitted:", { role, email, password });
  };

  return (
    <div className="w-full max-w-[360px] mx-auto flex flex-col items-center">
      {/* Brand Header */}
      <h1 className="text-2xl font-extrabold text-[#0d1b2a] tracking-tight mb-8">
        Fieldwork
      </h1>

      <h2 className="text-2xl font-bold text-[#0d1b2a] mb-6">
        Secure Sign In
      </h2>

      {/* Role Pill Switcher */}
      <div className="w-full border border-[#0d1b2a] rounded-full p-1 flex bg-[#eef2f6] mb-6">
        <button
          type="button"
          onClick={() => setRole("CLIENT")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
            role === "CLIENT"
              ? "bg-[#0d1b2a] text-white shadow-sm"
              : "text-[#0d1b2a] hover:bg-black/5"
          }`}
        >
          Sign in as Client
        </button>
        <button
          type="button"
          onClick={() => setRole("PROFESSIONAL")}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all ${
            role === "PROFESSIONAL"
              ? "bg-[#0d1b2a] text-white shadow-sm"
              : "text-[#0d1b2a] hover:bg-black/5"
          }`}
        >
          Sign in as Professional
        </button>
      </div>

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="w-full space-y-3.5">
        <div>
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-gray-400 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0d1b2a]"
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 bg-white border border-gray-400 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#0d1b2a]"
          />
>>>>>>> 068172ec0a0ac18df41f431507b0fe7a6030a66c
        </div>

        <button
          type="submit"
<<<<<<< HEAD
          disabled={loading}
          className="group w-full bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.98] text-white font-semibold text-[15px] py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign in as {accountType}
              <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[14px] text-[#64748B]">
        Don't have an account?{" "}
        <Link to="/register" className="text-[#4F46E5] font-medium hover:text-[#3730A3]">
          Create one
        </Link>
      </p>
    </div>
  );
}
=======
          className="w-full py-2.5 bg-[#0d1b2a] text-white font-semibold text-sm rounded-md hover:bg-[#1b2a3a] transition-colors mt-2"
        >
          Sign In
        </button>
      </form>

      {/* Links */}
      <div className="mt-6 text-center text-xs space-y-3 text-gray-700">
        <div>
          <a href="/forgot-password" className="underline font-medium hover:text-black">
            Forgot Password?
          </a>
        </div>
        <div>
          <span>Don't have an account? </span>
          <a href="/register" className="underline font-semibold text-[#0d1b2a]">
            Create an Account
          </a>
        </div>
      </div>
    </div>
  );
};
>>>>>>> 068172ec0a0ac18df41f431507b0fe7a6030a66c
