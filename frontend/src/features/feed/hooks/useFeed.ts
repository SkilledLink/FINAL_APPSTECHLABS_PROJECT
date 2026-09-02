import { useState, useEffect, useCallback } from "react";
import type { FeedItemData, FeedType, FeedFiltersState } from "../types/feed.types";
import { feedService } from "../services/feedService";

interface UseFeedProps {
  type: FeedType;
  filters?: FeedFiltersState;
}

export function useFeed({ type, filters }: UseFeedProps) {
  const [data, setData] = useState<FeedItemData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await feedService.getFeed(type, filters);
      setData(response.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [type, filters]);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchFeed();
    });
  }, [fetchFeed]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchFeed,
  };
}