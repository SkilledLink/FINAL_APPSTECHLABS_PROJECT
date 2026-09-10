import { useCallback, useState } from 'react';
import { feedApi } from '../api/feedApi';
import type {
  Feed,
  FeedCreatePayload,
  FeedUpdatePayload,
  FeedComment,
  FeedCommentCreatePayload,
  FeedMedia,
} from '../types/feed.types';

export function useFeedMutations() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ─── Create ────────────────────────────────────────────
  const createFeed = useCallback(
    async (payload: FeedCreatePayload): Promise<Feed> => {
      setLoading(true);
      setError(null);
      try {
        return await feedApi.create(payload);
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Failed to create feed';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Update ────────────────────────────────────────────
  const updateFeed = useCallback(
    async (feedId: string, payload: FeedUpdatePayload): Promise<Feed> => {
      setLoading(true);
      setError(null);
      try {
        return await feedApi.update(feedId, payload);
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Failed to update feed';
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // ─── Delete ────────────────────────────────────────────
  const deleteFeed = useCallback(async (feedId: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      await feedApi.delete(feedId);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete feed';
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Like toggle ───────────────────────────────────────
  const toggleLike = useCallback(async (feedId: string) => {
    try {
      return await feedApi.toggleLike(feedId);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to toggle like';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ─── Media upload ──────────────────────────────────────
  const uploadMedia = useCallback(
    async (feedId: string, file: File): Promise<FeedMedia> => {
      try {
        return await feedApi.uploadMedia(feedId, file);
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Failed to upload media';
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const deleteMedia = useCallback(async (mediaId: string): Promise<void> => {
    try {
      await feedApi.deleteMedia(mediaId);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete media';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  // ─── Comments ──────────────────────────────────────────
  const createComment = useCallback(
    async (
      feedId: string,
      payload: FeedCommentCreatePayload
    ): Promise<FeedComment> => {
      try {
        return await feedApi.createComment(feedId, payload);
      } catch (err: any) {
        const msg = err.response?.data?.detail || 'Failed to create comment';
        setError(msg);
        throw new Error(msg);
      }
    },
    []
  );

  const deleteComment = useCallback(async (commentId: string): Promise<void> => {
    try {
      await feedApi.deleteComment(commentId);
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Failed to delete comment';
      setError(msg);
      throw new Error(msg);
    }
  }, []);

  return {
    loading,
    error,
    createFeed,
    updateFeed,
    deleteFeed,
    toggleLike,
    uploadMedia,
    deleteMedia,
    createComment,
    deleteComment,
  };
}