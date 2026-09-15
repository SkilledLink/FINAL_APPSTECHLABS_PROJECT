import { api } from '../api/api';
import type { AdminFeed } from '../types/admin.types';

type FeedUser = {
  id?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  profile_image_url?: string;
  account_type?: string;
};

type FeedMedia = {
  media_url: string;
};

type FeedHashtag = {
  name: string;
};

type FeedResponse = {
  id: string;
  title?: string;
  description?: string;
  status?: string;
  is_public?: boolean;
  is_deleted?: boolean;
  user_id?: string;
  user?: FeedUser;
  media?: FeedMedia[];
  hashtags?: FeedHashtag[];
  likes_count?: number;
  comments_count?: number;
  created_at?: string;
  updated_at?: string;
};

const mapFeed = (f: FeedResponse): AdminFeed => {
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
      avatar:
        u.profile_image_url ?? `https://i.pravatar.cc/80?u=${u.id ?? f.user_id}`,
      role: u.account_type ?? 'user',
    },
    images: (f.media ?? []).map((m) => m.media_url),
    hashtags: (f.hashtags ?? []).map((h) => h.name),
    likes: f.likes_count ?? 0,
    comments: f.comments_count ?? 0,
    createdAt: f.created_at ?? '',
    updatedAt: f.updated_at ?? '',
  };
};

export const feedsService = {
  async getAll(): Promise<AdminFeed[]> {
    const { data } = await api.get('/admin/feeds', {
      params: { skip: 0, limit: 100, include_deleted: true },
    });
    return (data.items ?? []).map(mapFeed);
  },

  async remove(id: string, reason: string, hard = false): Promise<void> {
    await api.delete(`/admin/feeds/${id}`, { params: { reason, hard } });
  },
};