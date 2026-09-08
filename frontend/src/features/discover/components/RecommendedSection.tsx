import React from "react";
import { Star, MapPin, Heart, CheckCircle2 } from "lucide-react";
import type { RecommendedCard } from "../types/discover";

interface RecommendedSectionProps {
  items: RecommendedCard[];
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
        {items.map((item) => (
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
              <span className="absolute top-3 left-3 px-2 py-1 rounded-md text-xs font-bold text-white bg-blue-600/80 backdrop-blur-sm flex items-center gap-1">
                <CheckCircle2 size={12} />
                {item.badge}
              </span>
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
                  <div className="flex items-center gap-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                      {item.name}
                    </h3>
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.title}
                  </p>
                </div>
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
        ))}
      </div>
    </section>
  );
};