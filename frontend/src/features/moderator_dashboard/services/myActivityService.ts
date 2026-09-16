import { api } from '../api/api';
import type { ActivityLog, ActivityLogDetail } from '../types/moderator.types';

const mapLog = (l: any): ActivityLog => ({
  id: l.id,
  action: l.action,
  entityType: l.entity_type,
  entityId: l.entity_id,
  reason: l.reason,
  description: [l.action, l.entity_type, l.reason]
    .filter(Boolean)
    .join(' · '),
  ipAddress: l.ip_address,
  timestamp: l.created_at,
});

const mapDetail = (l: any): ActivityLogDetail => ({
  ...mapLog(l),
  oldValue: l.old_value ?? null,
  newValue: l.new_value ?? null,
  userAgent: l.user_agent,
});

export interface ActivityFilters {
  action?: string;
  entityType?: string;
}

export const myActivityService = {
  async getAll(filters: ActivityFilters = {}): Promise<ActivityLog[]> {
    const params: Record<string, unknown> = { skip: 0, limit: 200 };
    if (filters.action) params.action = filters.action;
    if (filters.entityType) params.entity_type = filters.entityType;

    const { data } = await api.get('/moderator/audit-logs/me', { params });
    return (data.items ?? []).map(mapLog);
  },

  async getOne(id: string): Promise<ActivityLogDetail> {
    // There is no /moderator/audit-logs/{id} endpoint.
    // The list shape already contains everything the drawer needs,
    // so re-fetch by scanning the list is a viable fallback.
    const { data } = await api.get('/moderator/audit-logs/me', {
      params: { skip: 0, limit: 200 },
    });
    const found = (data.items ?? []).find((x: any) => x.id === id);
    if (!found) throw new Error('Activity log not found');
    return mapDetail(found);
  },
};