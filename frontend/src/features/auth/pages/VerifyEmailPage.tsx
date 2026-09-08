import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { OTPInput } from "../components/OTPInput";

export default function VerifyEmailPage() {
  const { verifyEmail, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [verified, setVerified] = useState(false);

  const handleCodeComplete = async (value: string) => {
    setCode(value);
    if (value.length === 6) {
      const success = await verifyEmail(email, value);
      if (success) {
        setVerified(true);
        setTimeout(() => navigate("/onboarding"), 2000);
      }
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  if (verified) {
    return (
      <div className="py-6 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 text-emerald-600 dark:text-emerald-400">
          <MailCheck size={28} strokeWidth={2} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
          Verification successful!
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs">
          Your email has been verified. Redirecting to sign in...
        </p>
      </div>
    );
  }

  return (
    <div className="py-2">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
        Check your inbox
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6">
        We've sent a 6-character code to{" "}
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {email || "your email"}
        </span>
        . Enter it below to verify.
      </p>

      {error && (
        <div className="mb-4 text-xs text-red-600 dark:text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3 font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-center py-2">
        <OTPInput
          length={6}
          value={code}
          onChange={(val) => {
            setCode(val);
            clearError();
          }}
          onComplete={handleCodeComplete}
          disabled={loading}
        />
      </div>

      <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-4">
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={() => {
            // Optional: resend logic
          }}
          className="text-blue-600 dark:text-blue-400 font-semibold hover:underline transition-all ml-0.5 cursor-pointer"
        >
          Resend
        </button>
      </p>

      <div className="mt-6 flex items-center justify-between">
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to sign in</span>
        </Link>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all px-3.5 py-1.5 rounded-xl border border-slate-300/80 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 cursor-pointer shadow-sm"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}