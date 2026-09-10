import { useState, useCallback, useMemo } from 'react';
import type { PostFilters, PostStatus } from '../types/post.types';

export function useFeedFilters(initial?: PostFilters) {
  const [filters, setFilters] = useState<PostFilters>(initial || {});

  const setSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  const setHashtag = useCallback((hashtag: string) => {
    setFilters((prev) => ({
      ...prev,
      hashtag: hashtag.replace(/^#/, '') || undefined,
    }));
  }, []);

  const setUserId = useCallback((user_id?: string) => {
    setFilters((prev) => ({ ...prev, user_id }));
  }, []);

  const setStatus = useCallback((status?: PostStatus) => {
    setFilters((prev) => ({ ...prev, status }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const isActive = useMemo(() => {
    return Boolean(
      filters.search || filters.hashtag || filters.user_id || filters.status
    );
  }, [filters]);

  return {
    filters,
    setFilters,
    setSearch,
    setHashtag,
    setUserId,
    setStatus,
    clearFilters,
    isActive,
  };
}