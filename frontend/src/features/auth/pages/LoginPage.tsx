// src/features/auth/pages/LoginPage.tsx
import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Check } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";

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
    if (success) navigate("/dashboard");
  };

  return (
    <AuthLayout title="Sign in">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Sign in</h1>
        <p className="text-xs text-slate-400 mt-1">
          Don't have an account?{" "}
          <Link to="/register" className="text-slate-900 font-bold hover:underline">
            Create now
          </Link>
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

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="@#**%"
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

        <div className="flex items-center justify-between text-xs pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              onClick={() => setRememberMe(!rememberMe)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                rememberMe
                  ? "bg-[#122E21] border-[#122E21]"
                  : "border-slate-300 group-hover:border-slate-400 bg-white"
              }`}
            >
              {rememberMe && <Check size={10} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-[11px] text-slate-500 select-none">Remember me</span>
          </label>
          <Link to="/forgot-password" className="text-[11px] font-bold text-slate-900 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#122E21] hover:bg-[#1B3A2B] text-white font-bold text-xs py-3 rounded-full transition duration-200 flex items-center justify-center disabled:opacity-50 shadow-sm active:scale-[0.99]"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            "Sign in"
          )}
        </button>
      </form>

      <div className="relative flex items-center gap-3 my-5">
        <div className="flex-1 h-px bg-slate-200" />
        <span className="text-[10px] font-medium text-slate-400">or</span>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      <div className="space-y-2.5">
        <button className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
          <FaGoogle size={14} className="text-[#4285F4]" />
          <span>Continue with Google</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
          <FaFacebook size={14} className="text-[#1877F2]" />
          <span>Continue with Facebook</span>
        </button>
      </div>
    </AuthLayout>
  );
}