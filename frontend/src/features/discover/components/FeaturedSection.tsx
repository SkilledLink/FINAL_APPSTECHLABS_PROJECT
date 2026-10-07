import React from 'react';
import { Star, MapPin, Heart, ShieldCheck, ShieldAlert } from 'lucide-react';
import VerifiedBadge from '../../subscription/components/VerifiedBadge';
import { readTierBadge } from '../../subscription/tierCache';
import type { TierInfo } from '../../subscription/types/subscription.types';

interface FeaturedItem {
  id: string;
  name: string;
  title: string;
  coverImage: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: string;
  tags: string[];
  isVerified: boolean;
}

interface FeaturedSectionProps {
  items: FeaturedItem[];
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

export const FeaturedSection: React.FC<FeaturedSectionProps> = ({ items }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <span className="text-blue-500">✦</span> Featured Professionals
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {items.map((item) => {
          const tier = tierFromCache(item.id);
          return (
            <div
              key={item.id}
              className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 hover:shadow-xl transition-all duration-300"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={item.coverImage}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/40 transition-colors">
                  <Heart size={18} />
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-start gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border-2 border-white dark:border-slate-800 shadow-sm"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {item.name}
                      </h3>
                      {tier && <VerifiedBadge tier={tier} size="sm" />}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {item.title}
                    </p>
                  </div>
                </div>

                <div className="mt-2">
                  {item.isVerified ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-900/60 text-[10.5px] font-bold uppercase tracking-wide">
                      <ShieldCheck size={11} />
                      Identity verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-900/60 text-[10.5px] font-bold uppercase tracking-wide">
                      <ShieldAlert size={11} />
                      Unverified identity
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4 mt-3 text-sm">
                  <div className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star size={16} className="fill-amber-400" />
                    <span>{item.rating}</span>
                    <span className="text-slate-400 font-normal">({item.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <MapPin size={14} />
                    <span>{item.distance}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-3">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
                  <button className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors">
                    View Profile
                  </button>
                  <button className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-semibold transition-colors">
                    Contact
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