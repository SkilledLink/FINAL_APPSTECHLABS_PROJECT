import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProfessionalRequiredProps {
  title?: string;
  description?: string;
}

export default function ProfessionalRequired({
  title = 'Professional account required',
  description = 'Only professional accounts can build a portfolio. Upgrade your account to showcase your services, past work, and availability.',
}: ProfessionalRequiredProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 p-10 text-center shadow-sm backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl dark:bg-cyan-500/15" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-500/15" />

        <div className="relative">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-600 shadow-lg shadow-cyan-500/10 dark:text-cyan-400">
            <Lock className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {title}
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>

          <Link
            to="/home/verification"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl active:scale-95 dark:bg-cyan-600 dark:shadow-cyan-900/30 dark:hover:bg-cyan-500"
          >
            <Sparkles className="h-4 w-4" />
            Become a professional
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}