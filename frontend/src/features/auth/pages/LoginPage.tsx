import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login({ email, password });
    if (success) navigate("/");
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Sign in
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Create an account
        </Link>
      </p>

      {error && (
        <div className="mb-5 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              placeholder="Enter your email"
              className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="Enter your password"
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

        <div className="flex items-center pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-3 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin text-white" />
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="relative flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-300/60 dark:bg-slate-800" />
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-slate-300/60 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 transition-all text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
        >
          <FaGoogle size={14} className="text-[#4285F4]" />
          <span>Google</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 transition-all text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
        >
          <FaFacebook size={14} className="text-[#1877F2]" />
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
}