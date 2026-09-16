// src/features/onboarding/pages/ChooseAccountTypePage.tsx

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Briefcase,
  Check,
  Eye,
  MessageSquare,
  Search,
  Sparkles,
  Star,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react";
import { useAuth } from "../../auth/hooks/useAuth";
import { OnboardingLayout } from "../components/OnboardingLayout";

const CLIENT_BENEFITS = [
  { icon: Search, text: "Browse verified professionals near you" },
  { icon: MessageSquare, text: "Message artisans directly, no middlemen" },
  { icon: Wallet, text: "Compare rates and hire with confidence" },
];

const PRO_BENEFITS = [
  { icon: Eye, text: "Get discovered by clients searching your trade" },
  { icon: Star, text: "Build a portfolio and grow your reputation" },
  { icon: TrendingUp, text: "Win more jobs with a verified badge" },
];

export default function ChooseAccountTypePage() {
  const navigate = useNavigate();
  const { user, authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user?.account_type === "professional") {
      navigate("/home", { replace: true });
    }
  }, [authLoading, user, navigate]);

  return (
    <OnboardingLayout maxWidth="max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* ── HEADER ───────────────────────────────────── */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-4">
            <Sparkles size={12} />
            Welcome to SkilledLink
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How will you use the platform?
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Pick the option that fits you best. You can always upgrade to a
            professional account later from your settings.
          </p>
        </div>

        {/* ── CARDS ────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* CLIENT / USER */}
          <motion.button
            type="button"
            onClick={() => navigate("/home", { replace: true })}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="group relative text-left rounded-3xl border-2 border-slate-200/70 dark:border-slate-800/70 bg-white/55 dark:bg-slate-900/45 backdrop-blur-2xl p-6 sm:p-8 hover:border-blue-500/60 hover:shadow-[0_20px_50px_rgba(37,99,235,0.15)] transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <User size={24} />
              </div>
              <ArrowRight
                size={20}
                className="text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              I need a professional
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Find and hire trusted artisans, technicians, and service
              providers for your projects.
            </p>

            <div className="mt-6 space-y-2.5 pt-6 border-t border-slate-200/70 dark:border-slate-800/70">
              {CLIENT_BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <div className="shrink-0 w-5 h-5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mt-0.5">
                    <Icon size={11} />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Continue as client
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </motion.button>

          {/* PROFESSIONAL */}
          <motion.button
            type="button"
            onClick={() => navigate("/onboarding/professional")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="group relative text-left rounded-3xl border-2 border-blue-500/40 dark:border-blue-500/40 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 backdrop-blur-2xl p-6 sm:p-8 hover:border-blue-500 hover:shadow-[0_20px_60px_rgba(37,99,235,0.25)] transition-all duration-300 cursor-pointer"
          >
            {/* Recommended badge */}
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30">
              <Sparkles size={10} />
              Grow with SkilledLink
            </div>

            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Briefcase size={24} />
              </div>
              <ArrowRight
                size={20}
                className="text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              I offer services
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Create a professional profile, showcase your skills, and get
              hired by clients around you.
            </p>

            <div className="mt-6 space-y-2.5 pt-6 border-t border-blue-500/20">
              {PRO_BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-2.5">
                  <div className="shrink-0 w-5 h-5 rounded-md bg-blue-600/15 text-blue-700 dark:text-blue-300 flex items-center justify-center mt-0.5">
                    <Icon size={11} />
                  </div>
                  <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
              Become a professional
              <ArrowRight
                size={13}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </div>
          </motion.button>
        </div>

        {/* ── FOOTER HINT ──────────────────────────────── */}
        <div className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <Check size={12} className="text-emerald-500" />
            <span>Free forever · No credit card required</span>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}