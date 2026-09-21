import { Star, MapPin, BadgeCheck, Clock, DollarSign, Briefcase } from 'lucide-react';
import type { MatchRecommendation } from '../types/ai.types';

export function AIRecommendationCard({ rec }: { rec: MatchRecommendation }) {
  const isJob = rec.type === 'job';
  const profileHref = `/profile/${rec.id}`;

  return (
    <a href={`#${profileHref}`} className="block group text-left">
      <div className="relative overflow-hidden rounded-2xl p-4 transition-all duration-300 bg-white/75 dark:bg-slate-900/65 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)] hover:shadow-[0_12px_40px_-12px_rgba(37,99,235,0.35)] hover:border-blue-400/50 dark:hover:border-blue-500/40 hover:-translate-y-1">

        {/* gradient sheen */}
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/40 to-transparent" />

        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              {isJob ? (
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 shadow-md shadow-blue-500/30">
                  {rec.name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-semibold text-slate-900 dark:text-slate-50 text-sm truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {isJob ? rec.title : rec.name}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {isJob ? `Posted by ${rec.name}` : rec.trade}
                </p>
              </div>
            </div>
          </div>

          {rec.isVerified && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 ring-1 ring-blue-500/20">
              <BadgeCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                Verified
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-600 dark:text-slate-400 mb-3">
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            {rec.location}
          </span>

          {!isJob && (
            <>
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {rec.rating}
                </span>
                <span className="text-slate-400 dark:text-slate-500">({rec.reviewCount})</span>
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span className="font-medium text-slate-700 dark:text-slate-300">{rec.hourlyRate}</span>
                <span className="text-slate-400 dark:text-slate-500">/hr</span>
              </span>
              {rec.isAvailable ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Available
                </span>
              ) : (
                <span className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                  <Clock className="w-3 h-3" />
                  Busy
                </span>
              )}
            </>
          )}

          {isJob && rec.budget && rec.budget > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-slate-400 dark:text-slate-500" />
              Budget: <span className="font-medium text-slate-700 dark:text-slate-300">${rec.budget}</span>
            </span>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
          {rec.bio}
        </p>

        {rec.skills && rec.skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {rec.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 rounded-md text-[11px] font-medium ring-1 ring-slate-200/50 dark:ring-white/5"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100/80 dark:border-white/5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">
            {isJob ? 'View posting' : 'View profile'}
          </span>
          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
            View &amp; Chat
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </a>
  );
}