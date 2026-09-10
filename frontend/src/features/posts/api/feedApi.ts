import { apiClient } from '../../../api/client';
import type {
  Post,
  PostListResponse,
  PostListParams,
  PostCreatePayload,
  PostUpdatePayload,
  PostLikeResponse,
  PostComment,
  PostCommentCreatePayload,
  PostMedia,
  Hashtag,
} from '../types/post.types';

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const buildListParams = (params?: PostListParams) => {
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
// API — talks to backend `/feeds` endpoints
// ─────────────────────────────────────────────────────────────
export const postApi = {
  // ─── List ───────────────────────────────────────────────
  list: async (params?: PostListParams): Promise<PostListResponse> => {
    const res = await apiClient.get('/feeds', { params: buildListParams(params) });
    return res.data;
  },

  // ─── Admin list (incl. deleted) ─────────────────────────
  adminList: async (
    params?: PostListParams & { include_deleted?: boolean }
  ): Promise<PostListResponse> => {
    const query = buildListParams(params);
    if (params?.include_deleted !== undefined) {
      query.include_deleted = String(params.include_deleted);
    }
    const res = await apiClient.get('/feeds/admin/all', { params: query });
    return res.data;
  },

  // ─── Get single ─────────────────────────────────────────
  getById: async (postId: string): Promise<Post> => {
    const res = await apiClient.get(`/feeds/${postId}`);
    return res.data;
  },

  // ─── Create (multipart/form-data) ───────────────────────
  create: async (payload: PostCreatePayload): Promise<Post> => {
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

  // ─── Update (JSON) ──────────────────────────────────────
  update: async (postId: string, payload: PostUpdatePayload): Promise<Post> => {
    const res = await apiClient.put(`/feeds/${postId}`, payload);
    return res.data;
  },

  // ─── Delete (soft) ──────────────────────────────────────
  delete: async (postId: string): Promise<void> => {
    await apiClient.delete(`/feeds/${postId}`);
  },

  // ─── Admin force delete ─────────────────────────────────
  adminDelete: async (postId: string, hard = false): Promise<void> => {
    await apiClient.delete(`/feeds/admin/${postId}`, {
      params: { hard },
    });
  },

  // ─── Media ──────────────────────────────────────────────
  uploadMedia: async (postId: string, file: File): Promise<PostMedia> => {
    const formData = new FormData();
    formData.append('media', file);
    const res = await apiClient.post(`/feeds/${postId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  deleteMedia: async (mediaId: string): Promise<void> => {
    await apiClient.delete(`/feeds/media/${mediaId}`);
  },

  // ─── Likes ──────────────────────────────────────────────
  toggleLike: async (postId: string): Promise<PostLikeResponse> => {
    const res = await apiClient.post(`/feeds/${postId}/like`);
    return res.data;
  },

  // ─── Comments ───────────────────────────────────────────
  createComment: async (
    postId: string,
    payload: PostCommentCreatePayload
  ): Promise<PostComment> => {
    const res = await apiClient.post(`/feeds/${postId}/comments`, payload);
    return res.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/feeds/comments/${commentId}`);
  },

  // ─── Hashtags ───────────────────────────────────────────
  getTrendingHashtags: async (limit = 20): Promise<Hashtag[]> => {
    const res = await apiClient.get('/feeds/trending-hashtags', {
      params: { limit },
    });
    return res.data;
  },
};