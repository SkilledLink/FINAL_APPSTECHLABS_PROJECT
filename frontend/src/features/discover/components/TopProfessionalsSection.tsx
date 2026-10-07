import React from 'react';
import { Star, MapPin, ShieldCheck, ShieldAlert } from 'lucide-react';
import VerifiedBadge from '../../subscription/components/VerifiedBadge';
import { readTierBadge } from '../../subscription/tierCache';
import type { TierInfo } from '../../subscription/types/subscription.types';
import type { TopProfessional } from '../types/discover';

interface TopProfessionalsSectionProps {
  professionals: TopProfessional[];
}

function tierFromCache(id: string | undefined): TierInfo | null {
  if (!id) return null;
  const cached = readTierBadge(id);
  if (!cached) return null;
  return {
    id: cached.tier_id,
    name: cached.name,
    level: cached.level,
    badge_name: cached.badge_name ?? null,
    badge_code: cached.badge_code ?? null,
    badge_icon: cached.badge_icon ?? null,
    badge_color: cached.badge_color ?? null,
    badge_secondary_color: cached.badge_secondary_color ?? null,
    badge_shape: cached.badge_shape ?? null,
  } as TierInfo;
}

export const TopProfessionalsSection: React.FC<TopProfessionalsSectionProps> = ({ professionals }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <MapPin size={22} className="text-blue-500" /> Top Near You
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
        {professionals.slice(0, 8).map((pro) => {
          const tier = tierFromCache(pro.id);
          return (
            <div
              key={pro.id}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-5 text-center flex flex-col items-center hover:border-blue-500/50 hover:shadow-lg transition-all cursor-pointer"
            >
              {/* Avatar — no checkmark overlay. */}
              <img
                src={pro.avatar}
                alt={pro.name}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm mb-3"
              />

              <div className="flex items-center gap-1 flex-wrap justify-center w-full">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {pro.name}
                </h3>
                {tier && <VerifiedBadge tier={tier} size="sm" />}
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 truncate w-full">
                {pro.title}
              </p>

              {/* Identity chip. */}
              <div className="mt-1.5">
                {pro.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 text-[9px] font-bold uppercase tracking-wide">
                    <ShieldCheck size={9} />
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/60 text-[9px] font-bold uppercase tracking-wide">
                    <ShieldAlert size={9} />
                    Unverified
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 text-xs text-amber-500 font-bold mt-1.5">
                <Star size={12} className="fill-amber-400" />
                <span>{pro.rating}</span>
                <span className="text-slate-400 font-normal">({pro.reviewCount})</span>
              </div>

              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 mt-1">
                {pro.distance}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};