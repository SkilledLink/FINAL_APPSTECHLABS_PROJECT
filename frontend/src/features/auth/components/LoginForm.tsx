import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { LoginCredentials } from "../types/auth.types";

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [accountType, setAccountType] = useState<
    "client" | "professional"
  >("client");

  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const credentials: LoginCredentials = {
      email,
      password,
    };

    const result = await login(credentials);

    if (result.success) {
      onSuccess?.();
      navigate("/home", { replace: true });
    } else if (result.unverified) {
      onSuccess?.();
      navigate(
        `/verify-email?email=${encodeURIComponent(email)}`,
        { replace: true },
      );
    }
  };

  return (
    <div
      className="max-w-md w-full bg-white dark:bg-slate-900 border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm transition-colors"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      <h1 className="text-[#0F172A] dark:text-slate-100 text-[26px] sm:text-[30px] font-bold tracking-tight">
        Sign in to SkilledLink
      </h1>

      <p className="text-[#64748B] dark:text-slate-400 text-[15px] mt-2">
        Use your account credentials to continue.
      </p>

      {/* Account type toggle */}
      <div className="mt-7 relative flex bg-[#F1F5F9] dark:bg-slate-800 rounded-xl p-1 transition-colors">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#0F172A] dark:bg-slate-700 rounded-lg transition-transform duration-300 ease-out"
          style={{
            transform:
              accountType === "client"
                ? "translateX(0)"
                : "translateX(calc(100% + 8px))",
          }}
        />

        <button
          type="button"
          onClick={() => setAccountType("client")}
          className={`relative z-10 flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors duration-300 ${
            accountType === "client"
              ? "text-white"
              : "text-[#64748B] dark:text-slate-400"
          }`}
        >
          Client
        </button>

        <button
          type="button"
          onClick={() => setAccountType("professional")}
          className={`relative z-10 flex-1 text-sm font-medium py-2.5 rounded-lg transition-colors duration-300 ${
            accountType === "professional"
              ? "text-white"
              : "text-[#64748B] dark:text-slate-400"
          }`}
        >
          Professional
        </button>
      </div>

      {error && (
        <div className="mt-4 text-[13px] text-[#DC2626] dark:text-red-400 bg-[#FEF2F2] dark:bg-red-950/40 border border-[#FECACA] dark:border-red-900/60 rounded-lg px-3.5 py-2.5">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        {/* Email */}
        <label className="block">
          <span
            className="text-[12.5px] font-medium text-[#475569] dark:text-slate-300 mb-1.5 block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Email address
          </span>

          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${
              focused === "email"
                ? "border-[#4F46E5] dark:border-indigo-500 ring-4 ring-[#4F46E5]/10 dark:ring-indigo-500/20"
                : "border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-slate-700"
            }`}
          >
            <Mail
              size={17}
              strokeWidth={1.8}
              className={
                focused === "email"
                  ? "text-[#4F46E5] dark:text-indigo-400"
                  : "text-[#94A3B8] dark:text-slate-500"
              }
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
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-600"
            />
          </div>
        </label>

        {/* Password */}
        <label className="block">
          <span
            className="text-[12.5px] font-medium text-[#475569] dark:text-slate-300 mb-1.5 block"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Password
          </span>

          <div
            className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${
              focused === "password"
                ? "border-[#4F46E5] dark:border-indigo-500 ring-4 ring-[#4F46E5]/10 dark:ring-indigo-500/20"
                : "border-[#E2E8F0] dark:border-slate-800 hover:border-[#CBD5E1] dark:hover:border-slate-700"
            }`}
          >
            <Lock
              size={17}
              strokeWidth={1.8}
              className={
                focused === "password"
                  ? "text-[#4F46E5] dark:text-indigo-400"
                  : "text-[#94A3B8] dark:text-slate-500"
              }
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
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] dark:text-slate-100 placeholder:text-[#94A3B8] dark:placeholder:text-slate-600"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-[#94A3B8] dark:text-slate-500 hover:text-[#64748B] dark:hover:text-slate-300 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff size={17} strokeWidth={1.8} />
              ) : (
                <Eye size={17} strokeWidth={1.8} />
              )}
            </button>
          </div>
        </label>

        {/* Forgot password */}
        <div className="flex justify-end -mt-1">
          <Link
            to="/forgot-password"
            className="text-[13px] text-[#4F46E5] dark:text-indigo-400 font-medium hover:text-[#3730A3] dark:hover:text-indigo-300 transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full bg-[#4F46E5] dark:bg-indigo-600 hover:bg-[#4338CA] dark:hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-[15px] py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign in as {accountType}
              <ArrowRight
                size={16}
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              />
            </>
          )}
        </button>
      </form>

      <p className="mt-7 text-center text-[14px] text-[#64748B] dark:text-slate-400">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[#4F46E5] dark:text-indigo-400 font-medium hover:text-[#3730A3] dark:hover:text-indigo-300"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}