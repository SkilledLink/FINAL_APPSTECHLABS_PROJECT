import { api } from '../api/api';
import type { AdminFeed, AdminFeedDetail, FeedComment } from '../types/admin.types';

const mapComment = (c: any): FeedComment => {
  const u = c.user ?? {};
  return {
    id: c.id,
    userId: c.user_id,
    feedId: c.feed_id,
    content: c.content,
    createdAt: c.created_at,
    updatedAt: c.updated_at,
    replies: (c.replies ?? []).map(mapComment),
    author: {
      id: u.id ?? c.user_id,
      name:
        [u.first_name, u.last_name].filter(Boolean).join(' ') ||
        u.username ||
        'Unknown',
      avatar: u.profile_image_url || '',
      role: u.account_type ?? 'user',
    },
  };
};

const mapFeed = (f: any): AdminFeed => {
  const u = f.user ?? {};
  return {
    id: f.id,
    title: f.title ?? '',
    description: f.description ?? '',
    content: [f.title, f.description].filter(Boolean).join(' — '),
    status: f.status ?? 'unknown',
    isPublic: !!f.is_public,
    isDeleted: !!f.is_deleted,
    userId: f.user_id ?? u.id ?? '',
    author: {
      id: u.id ?? f.user_id ?? '',
      name:
        [u.first_name, u.last_name].filter(Boolean).join(' ') ||
        u.username ||
        'Unknown',
      avatar: u.profile_image_url || '',
      role: u.account_type ?? 'user',
    },
    images: (f.media ?? []).map((m: any) => m.media_url),
    hashtags: (f.hashtags ?? []).map((h: any) => h.name),
    likes: f.likes_count ?? 0,
    comments: f.comments_count ?? 0,
    createdAt: f.created_at ?? '',
    updatedAt: f.updated_at ?? '',
  };
};

const mapFeedDetail = (f: any): AdminFeedDetail => {
  const base = mapFeed(f);
  const m = f.moderation;
  return {
    ...base,
    isLiked: !!f.is_liked,
    commentsList: (f.comments ?? []).map(mapComment),
    moderation: m
      ? {
          decision: m.decision ?? 'review',
          severity: m.severity ?? 0,
          confidence: m.confidence ?? 0,
          description: m.description ?? '',
          reason: m.reason ?? '',
          categories: m.categories ?? [],
          provider: m.provider ?? '',
          model: m.model ?? '',
          error: m.error,
          createdAt: m.created_at ?? new Date().toISOString(),
        }
      : null,
  };
};

export interface FeedsPage {
  items: AdminFeed[];
  total: number;
}

export const feedsService = {
  /** Fetch a single page of feeds. Used by the progressive loader. */
  async getPage(skip: number, limit: number): Promise<FeedsPage> {
    const { data } = await api.get('/admin/feeds', {
      params: { skip, limit, include_deleted: true },
    });
    return {
      items: (data.items ?? []).map(mapFeed),
      total: data.total ?? 0,
    };
  },

  /** Convenience: fetch up to `limit` feeds in one shot. */
  async getAll(limit = 100): Promise<AdminFeed[]> {
    const { items } = await this.getPage(0, limit);
    return items;
  },

  async getOne(id: string): Promise<AdminFeedDetail> {
    const { data } = await api.get(`/admin/feeds/${id}`);
    return mapFeedDetail(data);
  },

  async remove(id: string, reason: string, hard = false): Promise<void> {
    await api.delete(`/admin/feeds/${id}`, { params: { reason, hard } });
  },

  async removeComment(commentId: string, reason: string): Promise<void> {
    await api.delete(`/admin/feeds/comments/${commentId}`, {
      params: { reason },
    });
  },
};