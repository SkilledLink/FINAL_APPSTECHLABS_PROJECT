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
      accountType,
    };

    const ok = await login(credentials);

    if (ok) {
      onSuccess?.();
      navigate("/home");
    }
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

      {/* Account type toggle */}
      <div className="mt-7 relative flex bg-[#F1F5F9] rounded-xl p-1">
        <div
          className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#0F172A] rounded-lg transition-transform duration-300 ease-out"
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
              : "text-[#64748B]"
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
              : "text-[#64748B]"
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
        {/* Email */}
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
              className={
                focused === "email"
                  ? "text-[#4F46E5]"
                  : "text-[#94A3B8]"
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
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />
          </div>
        </label>

        {/* Password */}
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
              className={
                focused === "password"
                  ? "text-[#4F46E5]"
                  : "text-[#94A3B8]"
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
              className="flex-1 bg-transparent outline-none text-[14.5px] text-[#0F172A] placeholder:text-[#94A3B8]"
            />

            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
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
            className="text-[13px] text-[#4F46E5] font-medium hover:text-[#3730A3] transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="group w-full bg-[#4F46E5] hover:bg-[#4338CA] active:scale-[0.98] text-white font-semibold text-[15px] py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
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

      <p className="mt-7 text-center text-[14px] text-[#64748B]">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-[#4F46E5] font-medium hover:text-[#3730A3]"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
// ```

// The important change is just:

// ```tsx
// import { Link, useNavigate } from "react-router-dom";
// ```

// then:

// ```tsx
// const navigate = useNavigate();
// ```

// and after successful login:

// ```tsx
// if (ok) {
//   onSuccess?.();
//   navigate("/home");
// }
// ```

// So the flow becomes:

// **Login succeeds → `ok === true` → `/home`**

// Make sure your router actually has:

// ```tsx
// <Route path="/home" element={<Home />} />
// ```

// and not just `/`.
