// src/features/reviews/hooks/useReviews.ts

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import type {
  Review,
  ReviewStats,
  ReviewCreatePayload,
} from '../types/review.types';
import {
  createReview,
  deleteReview,
  fetchProfessionalReviewStats,
  fetchProfessionalReviews,
  checkHasReviewed,
  updateReview,
} from '../services/reviewService';

const PAGE_SIZE = 10;

interface UseReviewsReturn {
  items: Review[];
  stats: ReviewStats | null;
  total: number;
  hasReviewed: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  submitReview: (payload: Omit<ReviewCreatePayload, 'professionalId'>) => Promise<boolean>;
  editReview: (reviewId: string, patch: Partial<ReviewCreatePayload>) => Promise<boolean>;
  removeReview: (reviewId: string) => Promise<boolean>;
}

export const useReviews = (professionalId?: string | null): UseReviewsReturn => {
  const [items, setItems] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [total, setTotal] = useState(0);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!professionalId) return;
    setLoading(true);
    setError(null);
    try {
      const [listRes, statsRes, reviewedRes] = await Promise.all([
        fetchProfessionalReviews(professionalId, 0, PAGE_SIZE),
        fetchProfessionalReviewStats(professionalId).catch(() => null),
        checkHasReviewed(professionalId).catch(() => false),
      ]);
      setItems(listRes.items);
      setTotal(listRes.total);
      if (statsRes) setStats(statsRes);
      setHasReviewed(reviewedRes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [professionalId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loadMore = useCallback(async () => {
    if (!professionalId || loadingMore) return;
    if (items.length >= total) return;
    setLoadingMore(true);
    try {
      const res = await fetchProfessionalReviews(
        professionalId,
        items.length,
        PAGE_SIZE
      );
      setItems((prev) => [...prev, ...res.items]);
      setTotal(res.total);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load more');
    } finally {
      setLoadingMore(false);
    }
  }, [professionalId, items.length, total, loadingMore]);

  const submitReview = useCallback(
    async (payload: Omit<ReviewCreatePayload, 'professionalId'>) => {
      if (!professionalId) return false;
      try {
        await createReview({ ...payload, professionalId });
        toast.success('Review submitted');
        await refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to submit review');
        return false;
      }
    },
    [professionalId, refresh]
  );

  const editReview = useCallback(
    async (reviewId: string, patch: Partial<ReviewCreatePayload>) => {
      try {
        await updateReview(reviewId, patch);
        toast.success('Review updated');
        await refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to update review');
        return false;
      }
    },
    [refresh]
  );

  const removeReview = useCallback(
    async (reviewId: string) => {
      try {
        await deleteReview(reviewId);
        toast.success('Review deleted');
        await refresh();
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete review');
        return false;
      }
    },
    [refresh]
  );

  return {
    items,
    stats,
    total,
    hasReviewed,
    loading,
    loadingMore,
    error,
    hasMore: items.length < total,
    refresh,
    loadMore,
    submitReview,
    editReview,
    removeReview,
  };
};