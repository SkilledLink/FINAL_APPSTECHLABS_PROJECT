import { api } from '../api/api';
import type { AuditLog, AuditLogDetail } from '../types/admin.types';

const mapLog = (l: any): AuditLog => ({
  id: l.id,
  actorUserId: l.actor_user_id,
  actorRole: l.actor_role,
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

const mapLogDetail = (l: any): AuditLogDetail => ({
  ...mapLog(l),
  oldValue: l.old_value ?? null,
  newValue: l.new_value ?? null,
  userAgent: l.user_agent,
});

export interface AuditLogFilters {
  actorUserId?: string;
  entityType?: string;
  action?: string;
}

export interface AuditLogsPage {
  items: AuditLog[];
  total: number;
}

export const auditLogsService = {
  async getPage(
    skip: number,
    limit: number,
    filters: AuditLogFilters = {},
  ): Promise<AuditLogsPage> {
    const params: Record<string, unknown> = { skip, limit };
    if (filters.actorUserId) params.actor_user_id = filters.actorUserId;
    if (filters.entityType) params.entity_type = filters.entityType;
    if (filters.action) params.action = filters.action;

    const { data } = await api.get('/admin/audit-logs', { params });
    return {
      items: (data.items ?? []).map(mapLog),
      total: data.total ?? 0,
    };
  },

  async getAll(
    filters: AuditLogFilters = {},
    limit = 200,
  ): Promise<AuditLog[]> {
    const { items } = await this.getPage(0, limit, filters);
    return items;
  },

  async getOne(id: string): Promise<AuditLogDetail> {
    const { data } = await api.get(`/admin/audit-logs/${id}`);
    return mapLogDetail(data);
  },
};