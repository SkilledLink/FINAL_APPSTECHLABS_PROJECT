import { useState, useCallback } from "react";
import type { FeedFiltersState } from "../types/feed.types";

export function useFeedFilters(initialFilters: FeedFiltersState = {}) {
  const [filters, setFilters] = useState<FeedFiltersState>(initialFilters);

  const updateFilter = useCallback(<K extends keyof FeedFiltersState>(key: K, value: FeedFiltersState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const hasActiveFilters = Object.values(filters).some((val) => val !== undefined && val !== "");

  return {
    filters,
    updateFilter,
    clearFilters,
    hasActiveFilters,
  };
}