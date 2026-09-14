import { Briefcase, MapPin, Star, Users } from 'lucide-react';
import type { Portfolio, Service, Work } from '../types/portfolio.types';

interface PortfolioStatsProps {
  portfolio: Portfolio;
  services: Service[];
  works: Work[];
}

export default function PortfolioStats({ portfolio, services, works }: PortfolioStatsProps) {
  const stats = [
    {
      label: 'Active Services',
      value: services.filter((s) => s.is_active).length,
      icon: <Briefcase className="h-4 w-4" />,
      iconClass: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'border-cyan-500/20 bg-cyan-500/10',
      glow: 'bg-cyan-500/5 group-hover:bg-cyan-500/15',
    },
    {
      label: 'Works Showcased',
      value: works.length,
      icon: <Users className="h-4 w-4" />,
      iconClass: 'text-blue-600 dark:text-blue-400',
      iconBg: 'border-blue-500/20 bg-blue-500/10',
      glow: 'bg-blue-500/5 group-hover:bg-blue-500/15',
    },
    {
      label: 'Rating',
      value:
        portfolio.average_rating && portfolio.average_rating > 0
          ? Number(portfolio.average_rating).toFixed(1)
          : '—',
      icon: <Star className="h-4 w-4" />,
      iconClass: 'text-amber-600 dark:text-amber-400',
      iconBg: 'border-amber-500/20 bg-amber-500/10',
      glow: 'bg-amber-500/5 group-hover:bg-amber-500/15',
    },
    {
      label: 'Service Area',
      value:
        portfolio.service_radius_km != null
          ? `${portfolio.service_radius_km} km`
          : portfolio.city || '—',
      icon: <MapPin className="h-4 w-4" />,
      iconClass: 'text-emerald-600 dark:text-emerald-400',
      iconBg: 'border-emerald-500/20 bg-emerald-500/10',
      glow: 'bg-emerald-500/5 group-hover:bg-emerald-500/15',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 px-4 py-4 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800/80 dark:bg-slate-900/80 dark:hover:border-slate-700"
        >
          {/* Background Glow */}
          <div
            className={`pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full blur-2xl transition-all duration-500 ${s.glow}`}
          />

          <div className="relative flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {s.label}
            </span>
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${s.iconBg} ${s.iconClass}`}
            >
              {s.icon}
            </span>
          </div>

          <div className="relative mt-2 truncate text-lg font-extrabold text-slate-900 tabular-nums dark:text-slate-100 sm:text-xl">
            {s.value}
          </div>
        </div>
      ))}
    </div>
  );
}