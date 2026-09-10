import { apiClient } from '../../../api/client';
import type {
  Feed,
  FeedListResponse,
  FeedListParams,
  FeedCreatePayload,
  FeedUpdatePayload,
  FeedLikeResponse,
  FeedComment,
  FeedCommentCreatePayload,
  FeedMedia,
  Hashtag,
} from '../types/feed.types';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/**
 * Converts the filter/pagination params into a clean query string object.
 */
const buildListParams = (params?: FeedListParams) => {
  const query: Record<string, string | number> = {};
  if (!params) return query;

  if (params.skip !== undefined) query.skip = params.skip;
  if (params.limit !== undefined) query.limit = params.limit;
  if (params.search) query.search = params.search;
  if (params.hashtag) query.hashtag = params.hashtag;
  if (params.user_id) query.user_id = params.user_id;
  if (params.status) query.status_filter = params.status;

  return query;
};

// ─────────────────────────────────────────────────────────────
// API
// ─────────────────────────────────────────────────────────────

export const feedApi = {
  // ─── List feeds ─────────────────────────────────────────
  list: async (params?: FeedListParams): Promise<FeedListResponse> => {
    const res = await apiClient.get('/feeds', { params: buildListParams(params) });
    return res.data;
  },

  // ─── Admin: list all feeds (incl. deleted) ─────────────
  adminList: async (
    params?: FeedListParams & { include_deleted?: boolean }
  ): Promise<FeedListResponse> => {
    const query = buildListParams(params);
    if (params?.include_deleted !== undefined) {
      query.include_deleted = String(params.include_deleted);
    }
    const res = await apiClient.get('/feeds/admin/all', { params: query });
    return res.data;
  },

  // ─── Get single feed ───────────────────────────────────
  getById: async (feedId: string): Promise<Feed> => {
    const res = await apiClient.get(`/feeds/${feedId}`);
    return res.data;
  },

  // ─── Create feed (multipart/form-data) ─────────────────
  create: async (payload: FeedCreatePayload): Promise<Feed> => {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('description', payload.description);
    if (payload.status) formData.append('status', payload.status);
    if (payload.is_public !== undefined) {
      formData.append('is_public', String(payload.is_public));
    }
    if (payload.hashtags && payload.hashtags.length > 0) {
      formData.append('hashtags', payload.hashtags.join(','));
    }
    if (payload.media) {
      formData.append('media', payload.media);
    }

    const res = await apiClient.post('/feeds', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // ─── Update feed (JSON) ────────────────────────────────
  update: async (feedId: string, payload: FeedUpdatePayload): Promise<Feed> => {
    const res = await apiClient.put(`/feeds/${feedId}`, payload);
    return res.data;
  },

  // ─── Delete feed (soft by default) ─────────────────────
  delete: async (feedId: string): Promise<void> => {
    await apiClient.delete(`/feeds/${feedId}`);
  },

  // ─── Admin: force delete ───────────────────────────────
  adminDelete: async (feedId: string, hard = false): Promise<void> => {
    await apiClient.delete(`/feeds/admin/${feedId}`, {
      params: { hard },
    });
  },

  // ─── Media ─────────────────────────────────────────────
  uploadMedia: async (feedId: string, file: File): Promise<FeedMedia> => {
    const formData = new FormData();
    formData.append('media', file);
    const res = await apiClient.post(`/feeds/${feedId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteMedia: async (mediaId: string): Promise<void> => {
    await apiClient.delete(`/feeds/media/${mediaId}`);
  },

  // ─── Likes ─────────────────────────────────────────────
  toggleLike: async (feedId: string): Promise<FeedLikeResponse> => {
    const res = await apiClient.post(`/feeds/${feedId}/like`);
    return res.data;
  },

  // ─── Comments ──────────────────────────────────────────
  createComment: async (
    feedId: string,
    payload: FeedCommentCreatePayload
  ): Promise<FeedComment> => {
    const res = await apiClient.post(`/feeds/${feedId}/comments`, payload);
    return res.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/feeds/comments/${commentId}`);
  },

  // ─── Hashtags ──────────────────────────────────────────
  getTrendingHashtags: async (limit = 20): Promise<Hashtag[]> => {
    const res = await apiClient.get('/feeds/trending-hashtags', {
      params: { limit },
    });
    return res.data;
  },
};