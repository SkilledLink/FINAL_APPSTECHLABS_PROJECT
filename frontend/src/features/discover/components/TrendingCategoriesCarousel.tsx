import React from "react";
import { TrendingUp, Zap, Building, Droplets, Palette, Laptop } from "lucide-react";
import type { TrendingCategory } from "../types/discover";

interface TrendingCategoriesCarouselProps {
  categories: TrendingCategory[];
}

const iconMap: Record<string, React.ElementType> = {
  Zap,
  Building,
  Droplets,
  Palette,
  Laptop,
  TrendingUp,
};

export const TrendingCategoriesCarousel: React.FC<TrendingCategoriesCarouselProps> = ({ categories }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <TrendingUp size={22} className="text-rose-500" /> Trending
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-4 scroll-smooth snap-x snap-mandatory no-scrollbar">
        {categories.map((cat) => {
          const Icon = iconMap[cat.iconName] || TrendingUp;
          return (
            <div
              key={cat.id}
              className="min-w-[100px] snap-start bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 text-center hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer flex-shrink-0"
            >
              <div className="flex justify-center mb-2">
                <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Icon size={24} />
                </div>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cat.name}</h3>
              <span className="text-xs text-slate-400">{cat.searchCount}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};