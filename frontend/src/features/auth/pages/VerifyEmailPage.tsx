// src/features/auth/pages/VerifyEmailPage.tsx
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, MailCheck } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";
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
        setTimeout(() => navigate("/login"), 2000);
      }
    }
  };

  const handleSkip = () => {
    navigate("/login");
  };

  if (verified) {
    return (
      <AuthLayout title="Email verified!">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center py-6"
        >
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-4 text-[#122E21]">
            <MailCheck size={26} strokeWidth={2} />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">Verification successful!</h2>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Your email has been verified. Redirecting to sign in...
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Verify your email">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Check your inbox</h1>
        <p className="text-xs text-slate-400 mt-1">
          We've sent a 6-digit code to <span className="font-bold">{email || "your email"}</span>. Enter it below to verify.
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

      <div className="flex justify-center py-2">
        <OTPInput
          length={6}
          value={code}
          onChange={setCode}
          onComplete={handleCodeComplete}
          disabled={loading}
        />
      </div>

      <p className="text-center text-xs text-slate-400 mt-4">
        Didn't receive the code?{" "}
        <button
          type="button"
          onClick={() => {
            // Optional: implement resend
          }}
          className="text-slate-900 font-bold hover:underline transition ml-0.5"
        >
          Resend
        </button>
      </p>

      <div className="mt-6 flex items-center justify-between">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft size={14} />
          Back to sign in
        </Link>
        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-medium text-slate-400 hover:text-slate-600 transition px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300"
        >
          Skip for now
        </button>
      </div>
    </AuthLayout>
  );
}