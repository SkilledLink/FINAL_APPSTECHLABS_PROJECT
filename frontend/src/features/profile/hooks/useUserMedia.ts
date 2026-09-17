// src/features/profile/hooks/useUserMedia.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { fetchUserMedia } from '../services/feeds';
import type { FeedThumbnail } from '../types/profile.types';

const PAGE_SIZE = 20;

type MediaStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseUserMediaReturn {
  items: FeedThumbnail[];
  status: MediaStatus;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  refetch: () => void;
  loadMore: () => void;
}

export const useUserMedia = (userId: string): UseUserMediaReturn => {
  const [items, setItems] = useState<FeedThumbnail[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<MediaStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const loadMoreControllerRef = useRef<AbortController | null>(null);

  // Initial fetch. Runs whenever userId or reloadKey changes.
  useEffect(() => {
    if (!userId) {
      setStatus('idle');
      return;
    }

    let cancelled = false;
    const controller = new AbortController();

    setStatus('loading');
    setError(null);
    setItems([]);
    setTotal(0);
    setPage(0);

    const load = async () => {
      try {
        const result = await fetchUserMedia(
          userId,
          0,
          PAGE_SIZE,
          controller.signal
        );
        if (cancelled) return;
        setItems(result.items);
        setTotal(result.total);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        if (err instanceof DOMException && err.name === 'AbortError')
          return;
        setError(
          err instanceof Error ? err.message : 'Failed to load media'
        );
        setStatus('error');
      }
    };

    load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [userId, reloadKey]);

  // Abort any in-flight loadMore on unmount.
  useEffect(() => {
    return () => {
      loadMoreControllerRef.current?.abort();
    };
  }, []);

  const loadMore = useCallback(() => {
    if (isLoadingMore) return;
    if (items.length >= total) return;

    const nextPage = page + 1;

    loadMoreControllerRef.current?.abort();
    const controller = new AbortController();
    loadMoreControllerRef.current = controller;

    setIsLoadingMore(true);
    setError(null);

    fetchUserMedia(
      userId,
      nextPage * PAGE_SIZE,
      PAGE_SIZE,
      controller.signal
    )
      .then((result) => {
        setItems((prev) => [...prev, ...result.items]);
        setTotal(result.total);
        setPage(nextPage);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError')
          return;
        setError(
          err instanceof Error ? err.message : 'Failed to load more'
        );
      })
      .finally(() => {
        setIsLoadingMore(false);
      });
  }, [userId, page, items.length, total, isLoadingMore]);

  const refetch = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  return {
    items,
    status,
    error,
    hasMore: items.length < total,
    isLoadingMore,
    refetch,
    loadMore,
  };
};