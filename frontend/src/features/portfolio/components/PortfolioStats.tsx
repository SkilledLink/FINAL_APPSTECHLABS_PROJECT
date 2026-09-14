import { Briefcase, MapPin, Star, Users, TrendingUp, Sparkles } from 'lucide-react';
import type { Portfolio, Service, Work } from '../types/portfolio.types';

interface PortfolioStatsProps {
  portfolio: Portfolio;
  services: Service[];
  works: Work[];
}

interface StatCard {
  label: string;
  value: string;
  hint?: string;
  icon: React.ComponentType<{ className?: string }>;
  showStar?: boolean;
  hintIcon?: React.ComponentType<{ className?: string }>;
}

/* ───────────────────────── Shared tokens ───────────────────────── */

/* Card shell — matches the panel + section cards */
const CARD =
  'group relative overflow-hidden rounded-md border border-slate-200/70 ' +
  'bg-white/85 backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/60 ' +
  'shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-16px_rgba(15,23,42,0.12)] ' +
  'dark:shadow-[0_1px_2px_rgba(0,0,0,0.3),0_8px_24px_-16px_rgba(0,0,0,0.5)] ' +
  'transition-all duration-200 ' +
  'hover:-translate-y-0.5 hover:border-blue-500/40 ' +
  'hover:shadow-[0_8px_24px_-12px_rgba(59,130,246,0.25)] ' +
  'dark:hover:border-blue-500/30 ' +
  'p-3.5 sm:p-5';

/* Accent rail + bottom hairline */
const RAIL = 'from-blue-500 to-blue-700';

/* Icon tile */
const ICON_TILE =
  'border-blue-500/20 bg-blue-500/10 text-blue-600 ' +
  'dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-400';

/* Gradient for the value */
const VALUE_GRADIENT =
  'from-blue-700 to-blue-500 dark:from-blue-300 dark:to-blue-500';

/* ─────────────────────────────────────────────────────────────── */

export default function PortfolioStats({
  portfolio,
  services,
  works,
}: PortfolioStatsProps) {
  const activeServices = services.filter((s) => s.is_active).length;
  const totalServices = services.length;

  const ratingNum =
    portfolio.average_rating && portfolio.average_rating > 0
      ? Number(portfolio.average_rating)
      : null;
  const totalReviews = portfolio.total_reviews ?? 0;

  const areaLabel =
    portfolio.service_radius_km != null
      ? `${portfolio.service_radius_km} km`
      : portfolio.city || portfolio.region || portfolio.country || '—';

  const cards: StatCard[] = [
    {
      label: 'Active services',
      value: String(activeServices),
      hint:
        totalServices === 0
          ? 'No services yet'
          : activeServices === totalServices
          ? 'All services live'
          : `${totalServices - activeServices} paused`,
      icon: Briefcase,
      hintIcon: activeServices > 0 ? TrendingUp : undefined,
    },
    {
      label: 'Works showcased',
      value: String(works.length),
      hint:
        works.length === 0
          ? 'Add your first project'
          : `${works.length} project${works.length === 1 ? '' : 's'} in your portfolio`,
      icon: Users,
      hintIcon: works.length > 0 ? Sparkles : undefined,
    },
    {
      label: 'Average rating',
      value: ratingNum != null ? ratingNum.toFixed(1) : '—',
      hint:
        ratingNum != null
          ? `Based on ${totalReviews} review${totalReviews === 1 ? '' : 's'}`
          : 'No reviews yet',
      icon: Star,
      showStar: ratingNum != null,
    },
    {
      label: 'Service area',
      value: areaLabel,
      hint:
        portfolio.service_radius_km != null
          ? 'Travel radius'
          : portfolio.city
          ? 'Based in city'
          : 'Set your location',
      icon: MapPin,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const HintIcon = card.hintIcon;

        return (
          <div key={card.label} className={CARD}>
            {/* Accent rail — left edge */}
            <div
              className={`pointer-events-none absolute left-0 top-3.5 bottom-3.5 w-[3px] rounded-r-sm bg-gradient-to-b ${RAIL} opacity-70 transition-all duration-300 group-hover:top-2 group-hover:bottom-2 group-hover:opacity-100`}
            />

            {/* Corner glow (hover) */}
            <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* Icon tile (top-right) */}
            <div className="relative flex items-start justify-between gap-2">
              <span className="text-[10px] font-bold uppercase leading-tight tracking-[0.12em] text-slate-500 dark:text-slate-400">
                {card.label}
              </span>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border shadow-sm backdrop-blur-md sm:h-8 sm:w-8 ${ICON_TILE}`}
              >
                <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </span>
            </div>

            {/* Big value */}
            <div className="relative mt-2.5 flex items-baseline gap-1.5 sm:mt-3">
              <span
                className={`bg-gradient-to-br bg-clip-text text-2xl font-extrabold leading-none tracking-tight text-transparent tabular-nums sm:text-[2rem] ${VALUE_GRADIENT}`}
              >
                {card.value}
              </span>
              {card.showStar && (
                <Star className="h-3.5 w-3.5 fill-blue-500 text-blue-500 sm:h-4 sm:w-4" />
              )}
            </div>

            {/* Hint row */}
            {card.hint && (
              <div className="relative mt-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 sm:mt-2">
                {HintIcon && (
                  <HintIcon className="h-3 w-3 shrink-0 text-blue-500" />
                )}
                <span className="truncate">{card.hint}</span>
              </div>
            )}

            {/* Bottom hairline accent (hover) */}
            <div
              className={`pointer-events-none absolute inset-x-3 bottom-0 h-px bg-gradient-to-r ${RAIL} opacity-0 transition-opacity duration-300 group-hover:opacity-60 sm:inset-x-4`}
            />
          </div>
        );
      })}
    </div>
  );
}