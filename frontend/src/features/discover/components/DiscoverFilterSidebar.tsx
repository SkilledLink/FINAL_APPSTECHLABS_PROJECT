import React from "react";
import { SlidersHorizontal, MapPin, Star, ShieldCheck } from "lucide-react";
import type { DiscoverFilterState } from "../types/discover";

interface DiscoverFilterSidebarProps {
  filters: DiscoverFilterState;
  onFilterChange: (updated: Partial<DiscoverFilterState>) => void;
  onClearAll: () => void;
}

const categoriesList = [
  "Electrician",
  "Plumbing",
  "Construction",
  "Design",
  "Interior Design",
  "Home Decor",
  "Remodeling",
];

export const DiscoverFilterSidebar: React.FC<DiscoverFilterSidebarProps> = ({
  filters,
  onFilterChange,
  onClearAll,
}) => {
  const toggleCategory = (cat: string) => {
    const updated = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onFilterChange({ categories: updated });
  };

  return (
    <aside className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 space-y-6 text-slate-800 dark:text-slate-200 shadow-sm">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-700/60">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <SlidersHorizontal size={16} className="text-blue-600 dark:text-blue-400" />
          <span>Filters</span>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs font-medium text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-1.5 text-xs font-semibold">
          <MapPin size={14} className="text-slate-400" />
          <span>Location</span>
        </label>
        <input
          type="text"
          value={filters.locationInput}
          onChange={(e) => onFilterChange({ locationInput: e.target.value })}
          placeholder="Enter location..."
          className="w-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div className="space-y-2 pt-1">
          {[
            { id: "near_me", label: "Near me" },
            { id: "within_10", label: "Within 10 miles" },
            { id: "remote", label: "Remote" },
          ].map((loc) => (
            <label key={loc.id} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="location_opt"
                checked={filters.locationOption === loc.id}
                onChange={() => onFilterChange({ locationOption: loc.id as any })}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-600 dark:text-slate-400">{loc.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <label className="block text-xs font-semibold">Category</label>
        <div className="space-y-2">
          {categoriesList.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={filters.categories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-slate-600 dark:text-slate-400">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <label className="flex items-center gap-1 text-xs font-semibold">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span>Rating</span>
        </label>
        <div className="flex gap-2">
          {[4, 3, 2].map((num) => (
            <button
              key={num}
              onClick={() => onFilterChange({ minRating: filters.minRating === num ? 0 : num })}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium border ${
                filters.minRating === num
                  ? "bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-600"
                  : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300"
              }`}
            >
              {num}+
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <label className="flex items-center gap-1.5 text-xs font-semibold">
          <ShieldCheck size={14} className="text-blue-500" />
          <span>Verification</span>
        </label>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => onFilterChange({ verifiedOnly: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600 dark:text-slate-400">Verified only</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={filters.backgroundChecked}
              onChange={(e) => onFilterChange({ backgroundChecked: e.target.checked })}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-slate-600 dark:text-slate-400">Background checked</span>
          </label>
        </div>
      </div>

      <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-700/60">
        <div className="flex justify-between items-center text-sm">
          <span className="font-semibold">Price Range</span>
          <span className="text-slate-400">${filters.priceRange}+</span>
        </div>
        <input
          type="range"
          min="10"
          max="500"
          step="10"
          value={filters.priceRange}
          onChange={(e) => onFilterChange({ priceRange: Number(e.target.value) })}
          className="w-full accent-blue-600 cursor-pointer"
        />
      </div>

      <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-all shadow-md shadow-blue-600/20">
        Apply Filters
      </button>
    </aside>
  );
};