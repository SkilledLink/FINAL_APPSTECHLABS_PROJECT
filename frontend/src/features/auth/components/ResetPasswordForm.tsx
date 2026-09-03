  import { useState } from "react";
  import type { FormEvent } from "react";
  import { Link, useNavigate, useSearchParams } from "react-router-dom";
  import { Eye, EyeOff, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
  import { useAuth } from "../hooks/useAuth";

  export function ResetPasswordForm() {
    const { resetPassword, loading, error, clearError } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token") ?? "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [focused, setFocused] = useState<string | null>(null);
    const [mismatch, setMismatch] = useState(false);
    const [done, setDone] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (password !== confirmPassword) {
        setMismatch(true);
        return;
      }
      setMismatch(false);
      const ok = await resetPassword({ token, password });
      if (ok) {
        setDone(true);
        setTimeout(() => navigate("/login"), 1800);
      }
    };

    if (done) {
      return (
        <div style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
          <div className="w-11 h-11 rounded-xl bg-[#4F46E5]/[0.08] flex items-center justify-center">
            <CheckCircle2 size={20} className="text-[#4F46E5]" strokeWidth={1.8} />
          </div>
          <h1 className="text-[#0F172A] text-[24px] sm:text-[27px] font-bold tracking-tight mt-4">
            Password updated
          </h1>
          <p className="text-[#64748B] text-[14.5px] mt-2">
            Taking you back to sign in...
          </p>
        </div>
      );
    }

    return (
      <div style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>
        <h1 className="text-[#0F172A] text-[24px] sm:text-[27px] font-bold tracking-tight">
          Set a new password
        </h1>
        <p className="text-[#64748B] text-[14.5px] mt-2">
          Make it something you haven't used before.
        </p>

        {(error || mismatch) && (
          <div className="mt-4 text-[13px] text-[#DC2626] bg-[#FEF2F2] border border-[#FECACA] rounded-lg px-3.5 py-2.5">
            {mismatch ? "Passwords don't match." : error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span
              className="text-[12.5px] font-medium text-[#475569] mb-1.5 block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              New password
            </span>
            <div
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${focused === "password"
                  ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                  : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
            >
              <Lock size={17} strokeWidth={1.8} className={focused === "password" ? "text-[#4F46E5]" : "text-[#94A3B8]"} />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => {
                  setFocused("password");
                  clearError();
                }}
                onBlur={() => setFocused(null)}
                placeholder="At least 8 characters"
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

          <label className="block">
            <span
              className="text-[12.5px] font-medium text-[#475569] mb-1.5 block"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Confirm password
            </span>
            <div
              className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${focused === "confirm"
                  ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                  : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
            >
              <Lock size={17} strokeWidth={1.8} className={focused === "confirm" ? "text-[#4F46E5]" : "text-[#94A3B8]"} />
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocused("confirm")}
                onBlur={() => setFocused(null)}
                placeholder="Re-enter password"
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
                Update password
                <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>

        <p className="mt-7 text-center text-[14px] text-[#64748B]">
          Remembered it after all?{" "}
          <Link to="/login" className="text-[#4F46E5] font-medium hover:text-[#3730A3]">
            Sign in
          </Link>
        </p>
      </div>
    );
  }
