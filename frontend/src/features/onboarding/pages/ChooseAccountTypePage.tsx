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
  ShieldCheck,
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
    <OnboardingLayout maxWidth="max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 mb-4">
            <Sparkles size={12} />
            One last step
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            How will you use SkilledLink?
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Pick the role that fits you today. You can always switch to a
            professional account later from your profile settings.
          </p>
        </div>

        {/* CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* ── CLIENT ─────────────────────────────────────── */}
          <motion.button
            type="button"
            onClick={() => navigate("/home", { replace: true })}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="group relative text-left rounded-3xl border-2 border-slate-200/70 dark:border-slate-800/70 bg-white/60 dark:bg-slate-900/50 backdrop-blur-2xl p-6 sm:p-8 hover:border-blue-500/60 hover:shadow-[0_24px_60px_rgba(37,99,235,0.18)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Category label */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-5">
              <User size={11} />
              I'm a client
            </div>

            {/* Icon + arrow */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                <Search size={24} />
              </div>
              <ArrowRight
                size={20}
                className="text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              I want to hire someone
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Find vetted professionals for any project. Compare rates, chat
              directly, and pay securely through escrow.
            </p>

            {/* Example */}
            <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Perfect if you need
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A plumber, electrician, designer, developer, photographer — anyone
                to get the job done.
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-5 space-y-2.5 pt-5 border-t border-slate-200/70 dark:border-slate-800/70">
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

            {/* CTA */}
            <div className="mt-6 pt-1">
              <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:border-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all duration-200">
                Continue as a client
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </motion.button>

          {/* ── PROFESSIONAL ───────────────────────────────── */}
          <motion.button
            type="button"
            onClick={() => navigate("/onboarding/professional")}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="group relative text-left rounded-3xl border-2 border-blue-500/40 dark:border-blue-500/40 bg-gradient-to-br from-blue-500/[0.06] to-indigo-500/[0.06] dark:from-blue-500/10 dark:to-indigo-500/10 backdrop-blur-2xl p-6 sm:p-8 hover:border-blue-500 hover:shadow-[0_24px_60px_rgba(37,99,235,0.28)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
          >
            {/* Recommended badge */}
            <div className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-600/30">
              <Sparkles size={10} />
              Most popular
            </div>

            {/* Category label */}
            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-blue-600/15 dark:bg-blue-500/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-5">
              <Briefcase size={11} />
              I'm a professional
            </div>

            {/* Icon + arrow */}
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <Briefcase size={24} />
              </div>
              <ArrowRight
                size={20}
                className="text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              I want to offer services
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Create a professional profile, showcase your work, and get hired
              by clients searching for your skills.
            </p>

            {/* Example */}
            <div className="mt-5 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-blue-500/20 px-3.5 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-1">
                Perfect if you are
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                A tradesperson, freelancer, designer, developer, consultant —
                anyone offering a service for hire.
              </p>
            </div>

            {/* Benefits */}
            <div className="mt-5 space-y-2.5 pt-5 border-t border-blue-500/20">
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

            {/* CTA */}
            <div className="mt-6 pt-1">
              <span className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-bold text-white shadow-md shadow-blue-600/25 group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-600/40 transition-all duration-200">
                Set up my professional profile
                <ArrowRight
                  size={13}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </div>
          </motion.button>
        </div>

        {/* FOOTER HINT */}
        <div className="mt-10 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
            <ShieldCheck size={12} className="text-emerald-500" />
            <span>Free forever · No credit card required</span>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
            <Check size={12} className="text-blue-500" />
            <span>You can switch roles anytime from your settings</span>
          </div>
        </div>
      </motion.div>
    </OnboardingLayout>
  );
}