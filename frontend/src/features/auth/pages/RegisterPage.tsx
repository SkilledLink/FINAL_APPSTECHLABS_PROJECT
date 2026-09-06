import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Check, X, Loader2 } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState("");

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setValidationError("Password requirements not met.");
      return;
    }

    if (!agreeTerms) {
      setValidationError("You must agree to Terms & Conditions.");
      return;
    }

    setValidationError("");
    const result = await register({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });

    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Create an account
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
        >
          Sign in
        </Link>
      </p>

      {(error || validationError) && (
        <div className="mb-3 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 font-medium">
          {error || validationError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              First name
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  clearError();
                  setValidationError("");
                }}
                placeholder="First name"
                className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Last name
            </label>
            <div className="relative flex items-center">
              <User size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  clearError();
                  setValidationError("");
                }}
                placeholder="Last name"
                className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email address
          </label>
          <div className="relative flex items-center">
            <Mail size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
                setValidationError("");
              }}
              placeholder="Enter email address"
              className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock size={15} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
                setValidationError("");
              }}
              placeholder="Create password"
              className="w-full bg-white/60 dark:bg-slate-950/50 border border-slate-300/80 dark:border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="mt-2 space-y-0.5 p-2 bg-white/40 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 rounded-lg">
            <div className="flex items-center gap-1.5 text-[10px]">
              {hasMinLength ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
              <span className={hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}>At least 8 characters</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              {hasUppercase ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
              <span className={hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}>At least one uppercase letter (A-Z)</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px]">
              {hasNumber ? <Check size={11} className="text-emerald-500" /> : <X size={11} className="text-slate-400" />}
              <span className={hasNumber ? "text-emerald-600 dark:text-emerald-400 font-medium" : "text-slate-400"}>At least one number (0-9)</span>
            </div>
          </div>
        </div>

        <div className="pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-0 cursor-pointer"
            />
            <span className="text-[11px] text-slate-600 dark:text-slate-400">
              I agree to the{" "}
              <a href="#terms" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                Terms & Conditions
              </a>
            </span>
          </label>
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid || !agreeTerms}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-blue-600/20 flex items-center justify-center disabled:opacity-50 cursor-pointer"
        >
          {loading ? <Loader2 size={15} className="animate-spin text-white" /> : "Create account"}
        </button>
      </form>

      <div className="relative flex items-center gap-3 my-3">
        <div className="flex-1 h-px bg-slate-300/60 dark:bg-slate-800" />
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-slate-300/60 dark:bg-slate-800" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 transition-all text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
        >
          <FaGoogle size={13} className="text-[#4285F4]" />
          <span>Google</span>
        </button>

        <button
          type="button"
          className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 transition-all text-xs font-medium text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
        >
          <FaFacebook size={13} className="text-[#1877F2]" />
          <span>Facebook</span>
        </button>
      </div>
    </div>
  );
}