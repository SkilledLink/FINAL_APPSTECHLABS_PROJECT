// src/features/auth/pages/RegisterPage.tsx
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { FaGoogle, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { AuthLayout } from '../components/AuthLayout';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasNumber;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      setValidationError('Please ensure your password meets all security requirements.');
      return;
    }

    if (!agreeTerms) {
      setValidationError('You must agree to the Terms & Conditions to proceed.');
      return;
    }

    setValidationError('');
    const result = await register({
      first_name: firstName,
      last_name: lastName,
      email,
      password,
    });

    // Inside handleSubmit, after successful registration:
    if (result.success) {
      navigate(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <AuthLayout title="Create account">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create account</h1>
        <p className="text-xs text-slate-400 mt-1">
          Already have an account?{' '}
          <Link to="/login" className="text-slate-900 font-bold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      {(error || validationError) && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3"
        >
          {error || validationError}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First Name */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">First name</label>
          <input
            type="text"
            required
            value={firstName}
            onChange={e => {
              setFirstName(e.target.value);
              clearError();
              setValidationError('');
            }}
            placeholder="John"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Last name</label>
          <input
            type="text"
            required
            value={lastName}
            onChange={e => {
              setLastName(e.target.value);
              clearError();
              setValidationError('');
            }}
            placeholder="Doe"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">E-mail</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              clearError();
              setValidationError('');
            }}
            placeholder="example@gmail.com"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={e => {
                setPassword(e.target.value);
                clearError();
                setValidationError('');
              }}
              placeholder="@#**%"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:bg-white transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(s => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          <div className="mt-2.5 space-y-1.5 p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Password Requirements
            </p>
            <div className="flex items-center gap-1.5 text-[11px]">
              {hasMinLength ? (
                <Check size={12} className="text-emerald-600 font-bold" />
              ) : (
                <X size={12} className="text-slate-300" />
              )}
              <span className={hasMinLength ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                At least 8 characters long
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              {hasUppercase ? (
                <Check size={12} className="text-emerald-600 font-bold" />
              ) : (
                <X size={12} className="text-slate-300" />
              )}
              <span className={hasUppercase ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                At least one uppercase letter (A-Z)
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              {hasNumber ? (
                <Check size={12} className="text-emerald-600 font-bold" />
              ) : (
                <X size={12} className="text-slate-300" />
              )}
              <span className={hasNumber ? 'text-emerald-700 font-medium' : 'text-slate-400'}>
                At least one number (0-9)
              </span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <div className="pt-1">
          <label className="flex items-center gap-2 cursor-pointer group">
            <div
              onClick={() => setAgreeTerms(!agreeTerms)}
              className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                agreeTerms
                  ? 'bg-[#122E21] border-[#122E21]'
                  : 'border-slate-300 group-hover:border-slate-400 bg-white'
              }`}
            >
              {agreeTerms && <Check size={10} className="text-white" strokeWidth={3} />}
            </div>
            <span className="text-[11px] text-slate-500 select-none">
              I agree to the{' '}
              <a href="#terms" className="text-slate-900 font-bold hover:underline">
                Terms & Conditions
              </a>
            </span>
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !isPasswordValid || !agreeTerms}
          className="w-full mt-2 bg-[#122E21] hover:bg-[#1B3A2B] text-white font-bold text-xs py-3 rounded-full transition duration-200 flex items-center justify-center disabled:opacity-50 shadow-sm active:scale-[0.99]"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Create account'
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
          <span>Sign up with Google</span>
        </button>
        <button className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-full border border-slate-200 hover:bg-slate-50 transition text-xs font-semibold text-slate-700">
          <FaFacebook size={14} className="text-[#1877F2]" />
          <span>Sign up with Facebook</span>
        </button>
      </div>
    </AuthLayout>
  );
}
