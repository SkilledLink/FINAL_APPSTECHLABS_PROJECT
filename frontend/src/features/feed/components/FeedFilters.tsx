import React from "react";
import type { FeedFiltersState } from "../types/feed.types";

interface FeedFiltersProps {
  filters: FeedFiltersState;
  onFilterChange: <K extends keyof FeedFiltersState>(key: K, value: FeedFiltersState[K]) => void;
  onClear: () => void;
  hasActive: boolean;
}

export const FeedFilters: React.FC<FeedFiltersProps> = ({
  filters,
  onFilterChange,
  onClear,
  hasActive,
}) => {
  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4 flex flex-wrap items-center gap-3">
      <div className="flex-1 min-w-[140px]">
        <input
          type="text"
          placeholder="Filter by location..."
          value={filters.location || ""}
          onChange={(e) => onFilterChange("location", e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex-1 min-w-[140px]">
        <input
          type="text"
          placeholder="Filter by skill/tag..."
          value={filters.skill || ""}
          onChange={(e) => onFilterChange("skill", e.target.value)}
          className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {hasActive && (
        <button
          onClick={onClear}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium px-3 py-2"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
};