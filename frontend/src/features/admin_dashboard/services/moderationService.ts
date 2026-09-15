import { api } from '../api/api';
import type { ModerationQueueItem } from '../types/admin.types';

const mapItem = (i: any): ModerationQueueItem => ({
  recordId: i.record_id,
  feedId: i.feed_id,
  feedTitle: i.feed_title ?? '',
  feedDescription: i.feed_description ?? '',
  feedAuthorId: i.feed_author_id,
  feedMedia: (i.feed_media ?? []).map((m: any) => ({
    id: m.id,
    media_url: m.media_url,
    media_type: m.media_type,
  })),
  summary: {
    decision: i.summary?.decision ?? 'review',
    severity: i.summary?.severity ?? 0,
    confidence: i.summary?.confidence ?? 0,
    description: i.summary?.description ?? '',
    reason: i.summary?.reason ?? '',
    categories: i.summary?.categories ?? [],
    provider: i.summary?.provider ?? '',
    model: i.summary?.model ?? '',
    error: i.summary?.error,
    createdAt: i.summary?.created_at ?? new Date().toISOString(),
  },
});

export const moderationService = {
  async getQueue(): Promise<ModerationQueueItem[]> {
    const { data } = await api.get('/admin/moderation/queue', {
      params: { skip: 0, limit: 100 },
    });
    return (data.items ?? []).map(mapItem);
  },

  async approve(recordId: string, reason: string): Promise<void> {
    await api.post(`/admin/moderation/queue/${recordId}/approve`, { reason });
  },

  async reject(recordId: string, reason: string): Promise<void> {
    await api.post(`/admin/moderation/queue/${recordId}/reject`, { reason });
  },
};