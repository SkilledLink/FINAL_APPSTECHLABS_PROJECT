import type { AuditLog } from '../types/moderator.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const logs: AuditLog[] = [
  { id: 'l1', moderator: { id: 'm1', name: 'Marie Moderator', avatar: 'https://i.pravatar.cc/80?img=20' }, action: 'REMOVE_FEED', targetType: 'feed', targetId: 'f5', description: 'Removed feed flagged for defamation', ipAddress: '102.244.12.88', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), severity: 'warning' },
  { id: 'l2', moderator: { id: 'm2', name: 'Paul Supervisor', avatar: 'https://i.pravatar.cc/80?img=15' }, action: 'SUSPEND_USER', targetType: 'user', targetId: 'u4', description: 'Suspended user Claudine Etoundi for harassment', ipAddress: '102.244.13.12', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), severity: 'warning' },
  { id: 'l3', moderator: { id: 'm1', name: 'Marie Moderator', avatar: 'https://i.pravatar.cc/80?img=20' }, action: 'RESOLVE_REPORT', targetType: 'report', targetId: 'r4', description: 'Resolved report against comment', ipAddress: '102.244.12.88', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), severity: 'info' },
  { id: 'l4', moderator: { id: 'm2', name: 'Paul Supervisor', avatar: 'https://i.pravatar.cc/80?img=15' }, action: 'WARN_USER', targetType: 'user', targetId: 'u3', description: 'Issued warning to Yannick Fotso', ipAddress: '102.244.13.12', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), severity: 'info' },
  { id: 'l5', moderator: { id: 'm1', name: 'Marie Moderator', avatar: 'https://i.pravatar.cc/80?img=20' }, action: 'ESCALATE_REPORT', targetType: 'report', targetId: 'r2', description: 'Escalated high-priority harassment report to admin', ipAddress: '102.244.12.88', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), severity: 'critical' },
];

export const auditLogsService = {
  async getAll(): Promise<AuditLog[]> {
    await delay();
    return logs;
  },
};