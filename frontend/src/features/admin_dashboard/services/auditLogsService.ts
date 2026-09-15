import { api } from '../api/api';
import type { AuditLog } from '../types/admin.types';

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

export const auditLogsService = {
  async getAll(): Promise<AuditLog[]> {
    const { data } = await api.get('/admin/audit-logs', {
      params: { skip: 0, limit: 200 },
    });
    return (data.items ?? []).map(mapLog);
  },
};