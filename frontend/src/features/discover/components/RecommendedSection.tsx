import React from 'react';
import { Star, MapPin, Heart, ShieldCheck, ShieldAlert } from 'lucide-react';
import VerifiedBadge from '../../subscription/components/VerifiedBadge';
import { readTierBadge } from '../../subscription/tierCache';
import type { TierInfo } from '../../subscription/types/subscription.types';
import type { RecommendedCard } from '../types/discover';

interface RecommendedSectionProps {
  items: RecommendedCard[];
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

export const RecommendedSection: React.FC<RecommendedSectionProps> = ({ items }) => {
  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-blue-500">✦</span> Recommended for You
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Based on your interests, location and activity
          </p>
        </div>
        <button className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((item) => {
          const tier = tierFromCache(item.id);
          return (
            <div
              key={item.id}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-lg transition-all flex flex-col"
            >
              <div className="relative h-32 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                <img
                  src={item.coverImage}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <button className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors">
                  <Heart size={14} />
                </button>
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      {tier && <VerifiedBadge tier={tier} size="sm" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {item.title}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  {item.isVerified !== false ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 text-[10px] font-bold uppercase tracking-wide">
                      <ShieldCheck size={10} />
                      Identity verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/60 text-[10px] font-bold uppercase tracking-wide">
                      <ShieldAlert size={10} />
                      Unverified identity
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2 text-xs">
                  <div className="flex items-center gap-0.5 font-medium text-slate-700 dark:text-slate-300">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-slate-400 font-normal">({item.reviewCount})</span>
                  </div>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-0.5 text-slate-500">
                    <MapPin size={11} />
                    <span>{item.distance}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button className="py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                    {item.primaryActionText}
                  </button>
                  <button className="py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors">
                    {item.secondaryActionText}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};