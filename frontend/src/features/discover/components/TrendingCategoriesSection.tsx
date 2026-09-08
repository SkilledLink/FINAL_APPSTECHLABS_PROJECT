import React from "react";
import { TrendingUp, Zap, Building, Droplets, Palette, Laptop } from "lucide-react";
import type { TrendingCategory } from "../types/discover";

interface TrendingCategoriesSectionProps {
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

export const TrendingCategoriesSection: React.FC<TrendingCategoriesSectionProps> = ({ categories }) => {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <TrendingUp size={22} className="text-rose-500" /> Trending
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {categories.map((cat) => {
          const Icon = iconMap[cat.iconName] || TrendingUp;
          return (
            <div
              key={cat.id}
              className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-4 text-center hover:border-blue-500/50 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex justify-center mb-2">
                <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                  <Icon size={22} />
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