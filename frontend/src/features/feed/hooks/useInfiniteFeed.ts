import { useState, useCallback, useEffect } from "react";
import type { FeedItemData, FeedType, FeedFiltersState } from "../types/feed.types";
import { feedService } from "../services/feedService";

interface UseInfiniteFeedProps {
  type: FeedType;
  filters?: FeedFiltersState;
}

export function useInfiniteFeed({ type, filters }: UseInfiniteFeedProps) {
  const [items, setItems] = useState<FeedItemData[]>([]);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await feedService.getFeed(type, filters);
      setItems(res.items);
      setCursor(res.pagination.cursor);
      setHasMore(res.pagination.hasMore);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load feed");
    } finally {
      setIsLoading(false);
    }
  }, [type, filters]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      void loadInitial();
    });

    return () => cancelAnimationFrame(frame);
  }, [loadInitial]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore || !cursor) return;
    try {
      setIsLoadingMore(true);
      const res = await feedService.getFeed(type, filters, cursor);
      setItems((prev) => [...prev, ...res.items]);
      setCursor(res.pagination.cursor);
      setHasMore(res.pagination.hasMore);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load more items");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, cursor, type, filters]);

  return {
    items,
    loadMore,
    hasMore,
    isLoading,
    isLoadingMore,
    error,
    refetch: loadInitial,
  };
}