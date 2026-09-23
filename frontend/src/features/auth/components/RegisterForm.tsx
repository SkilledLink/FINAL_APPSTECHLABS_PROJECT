import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  Briefcase,
  Building2,
  Check,
  Circle,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import type { AccountType, RegisterData } from "../types/auth.types";

interface RegisterFormProps {
  onSuccess?: () => void;
}

const ACCOUNT_TYPES: { id: AccountType; label: string; desc: string; icon: typeof User }[] = [
  { id: "client", label: "Client", icon: Briefcase, desc: "Hire verified professionals for projects, with secure payments." },
  { id: "professional", label: "Professional", icon: User, desc: "Find work, build your reputation, and get paid fast." },
  { id: "business", label: "Business", icon: Building2, desc: "Manage teams, bid on larger projects, grow your company." },
];

const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { id: "number", label: "One number", test: (v: string) => /[0-9]/.test(v) },
  { id: "symbol", label: "One symbol (e.g. !@#$%)", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function PasswordRequirements({ password }: { password: string }) {
  return (
    <div className="mt-2.5 space-y-1.5">
      {PASSWORD_REQUIREMENTS.map((req) => {
        const met = req.test(password);
        return (
          <div key={req.id} className="flex items-center gap-2">
            {met ? (
              <Check size={13} strokeWidth={3} className="text-[#16A34A] shrink-0" />
            ) : (
              <Circle size={13} strokeWidth={2} className="text-[#CBD5E1] shrink-0" />
            )}
            <span
              className={`text-[12.5px] transition-colors duration-200 ${
                met ? "text-[#16A34A]" : "text-[#94A3B8]"
              }`}
            >
              {req.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<0 | 1>(0);
  const [accountType, setAccountType] = useState<AccountType>("professional");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mismatch, setMismatch] = useState(false);

  const passwordValid = PASSWORD_REQUIREMENTS.every((req) => req.test(password));
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!passwordValid) return;
    if (!passwordsMatch) {
      setMismatch(true);
      return;
    }
    setMismatch(false);

    const data: RegisterData = {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
    };

    const ok = await register(data);

    if (ok) {
      onSuccess?.();
      navigate("/home", { replace: true });
    }
  };

  return (
    <div
      className="max-w-md w-full bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm"
      style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}
    >
      {step === 0 && (
        <>
          <h1 className="text-[#0F172A] text-[24px] sm:text-[27px] font-bold tracking-tight">
            Create your SkilledLink account
          </h1>
          <p className="text-[#64748B] text-[14.5px] mt-2">
            Choose the account type that fits what you're here to do.
          </p>

          <div className="mt-6 space-y-3">
            {ACCOUNT_TYPES.map((t) => {
              const Icon = t.icon;
              const active = accountType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setAccountType(t.id)}
                  className={`w-full text-left flex items-start gap-3.5 rounded-xl border px-4 py-3.5 transition-all duration-200 ${
                    active
                      ? "border-[#4F46E5] bg-[#4F46E5]/[0.04] ring-4 ring-[#4F46E5]/10"
                      : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                  }`}
                >
                  <div
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors ${
                      active ? "bg-[#4F46E5] text-white" : "bg-[#F1F5F9] text-[#64748B]"
                    }`}
                  >
                    <Icon size={17} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[14.5px] font-semibold text-[#0F172A]">{t.label}</span>
                      <div
                        className={`rounded-full border flex items-center justify-center transition-colors ${
                          active ? "border-[#4F46E5] bg-[#4F46E5]" : "border-[#CBD5E1]"
                        }`}
                        style={{ width: 18, height: 18 }}
                      >
                        {active && <Check size={11} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                    <p className="text-[13px] text-[#64748B] mt-0.5 leading-snug">{t.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="group w-full mt-7 bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.98] text-white font-semibold text-[15px] py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue
            <ArrowRight size={16} className="transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </>
      )}

      {step === 1 && (
        <>
          <h1 className="text-[#0F172A] text-[24px] sm:text-[27px] font-bold tracking-tight">
            Your profile details
          </h1>
          <p className="text-[#64748B] text-[14.5px] mt-2">
            Signing up as a{" "}
            <span className="text-[#4F46E5] font-medium">
              {ACCOUNT_TYPES.find((t) => t.id === accountType)?.label.toLowerCase()}
            </span>
            .
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
                First name
              </span>
              <div
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${
                  focused === "firstName"
                    ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <User
                  size={17}
                  strokeWidth={1.8}
                  className={focused === "firstName" ? "text-[#4F46E5]" : "text-[#94A3B8]"}
                />
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  onFocus={() => {
                    setFocused("firstName");
                    clearError();
                  }}
                  onBlur={() => setFocused(null)}
                  placeholder="John"
                  className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            </label>

            <label className="block">
              <span
                className="text-[12.5px] font-medium text-[#475569] mb-1.5 block"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Last name
              </span>
              <div
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${
                  focused === "lastName"
                    ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <User
                  size={17}
                  strokeWidth={1.8}
                  className={focused === "lastName" ? "text-[#4F46E5]" : "text-[#94A3B8]"}
                />
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  onFocus={() => {
                    setFocused("lastName");
                    clearError();
                  }}
                  onBlur={() => setFocused(null)}
                  placeholder="Doe"
                  className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
            </label>

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
                  placeholder="john@example.com"
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
              <PasswordRequirements password={password} />
            </label>

            <label className="block">
              <span
                className="text-[12.5px] font-medium text-[#475569] mb-1.5 block"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                Confirm password
              </span>
              <div
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 transition-all duration-200 ${
                  focused === "confirmPassword"
                    ? "border-[#4F46E5] ring-4 ring-[#4F46E5]/10"
                    : mismatch
                    ? "border-[#FCA5A5]"
                    : "border-[#E2E8F0] hover:border-[#CBD5E1]"
                }`}
              >
                <Lock
                  size={17}
                  strokeWidth={1.8}
                  className={focused === "confirmPassword" ? "text-[#4F46E5]" : "text-[#94A3B8]"}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setMismatch(false);
                  }}
                  onFocus={() => {
                    setFocused("confirmPassword");
                    clearError();
                  }}
                  onBlur={() => setFocused(null)}
                  placeholder="Re-enter password"
                  className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
                />
              </div>
              {mismatch && (
                <p className="text-[12.5px] text-[#DC2626] mt-1.5">Passwords don't match.</p>
              )}
            </label>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl border border-[#E2E8F0] text-[#475569] font-medium text-[14.5px] hover:bg-[#F8FAFC] transition-colors"
              >
                <ArrowLeft size={15} />
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !passwordValid || !passwordsMatch}
                className="flex-1 bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.98] text-white font-semibold text-[15px] py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  "Create account"
                )}
              </button>
            </div>
          </form>
        </>
      )}

      <p className="mt-7 text-center text-[14px] text-[#64748B]">
        Already have an account?{" "}
        <Link to="/login" className="text-[#4F46E5] font-medium hover:text-[#3730A3]">
          Sign in
        </Link>
      </p>
    </div>
  );
}