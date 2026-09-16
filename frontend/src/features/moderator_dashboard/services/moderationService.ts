import { api } from '../api/api';
import type { ModerationQueueItem, ModerationDetail } from '../types/moderator.types';

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

const mapDetail = (d: any): ModerationDetail => ({
  recordId: d.record_id,
  decision: d.decision,
  severity: d.severity ?? 0,
  confidence: d.confidence ?? 0,
  description: d.description ?? '',
  reason: d.reason ?? '',
  categories: d.categories ?? [],
  provider: d.provider ?? '',
  model: d.model ?? '',
  error: d.error,
  createdAt: d.created_at,
  textResult: d.text_result ?? null,
  imageResults: d.image_results ?? null,
});

export const moderationService = {
  async getQueue(): Promise<ModerationQueueItem[]> {
    const { data } = await api.get('/moderator/moderation/queue', {
      params: { skip: 0, limit: 100 },
    });
    return (data.items ?? []).map(mapItem);
  },

  async getOne(recordId: string): Promise<ModerationDetail> {
    const { data } = await api.get(`/moderator/moderation/queue/${recordId}`);
    // The moderator endpoint returns ModerationSummary, not ModerationFull.
    // There is no text_result/image_results field on this route.
    return {
      ...mapDetail(data),
      textResult: null,
      imageResults: null,
    };
  },

  async approve(recordId: string, reason: string): Promise<void> {
    await api.post(`/moderator/moderation/queue/${recordId}/approve`, { reason });
  },

  async reject(recordId: string, reason: string): Promise<void> {
    await api.post(`/moderator/moderation/queue/${recordId}/reject`, { reason });
  },
};