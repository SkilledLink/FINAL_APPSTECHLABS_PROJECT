// src/features/profile/services/feeds.ts

import type { FeedThumbnail, FeedThumbnailPage } from '../types/profile.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://192.168.68.67:8000';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const mapThumbnailFromAPI = (raw: any): FeedThumbnail => ({
  feedId: raw.feed_id,
  title: raw.title ?? '',
  thumbnailUrl: raw.thumbnail_url,
  mediaUrl: raw.media_url,
  mediaType: raw.media_type === 'video' ? 'video' : 'image',
  mediaCount: raw.media_count ?? 1,
  createdAt: raw.created_at,
});

/**
 * Fetch a page of the current-user-or-other-user media grid.
 *
 * Backend: GET /feeds/thumbnails?user_id=&skip=&limit=
 * Returns only PUBLISHED, non-deleted feeds that have media.
 */
export const fetchUserMedia = async (
  userId: string,
  skip: number,
  limit: number,
  signal?: AbortSignal,
): Promise<FeedThumbnailPage> => {
  const params = new URLSearchParams({
    user_id: userId,
    skip: String(skip),
    limit: String(limit),
  });

  const response = await fetch(`${API_BASE}/feeds/thumbnails?${params.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch media: ${response.status}`);
  }

  const data = await response.json();

  return {
    items: (data.items ?? []).map(mapThumbnailFromAPI),
    total: data.total ?? 0,
  };
};
