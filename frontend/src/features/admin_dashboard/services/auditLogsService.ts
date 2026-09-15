import type { AuditLog } from '../types/admin.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const logs: AuditLog[] = [
  { id: 'l1', admin: { id: 'a1', name: 'Jean Kamdem', avatar: 'https://i.pravatar.cc/80?img=12' }, action: 'SUSPEND_USER', targetType: 'user', targetId: 'u4', description: 'Suspended user Claudine Etoundi for policy violation', ipAddress: '102.244.12.88', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), severity: 'warning' },
  { id: 'l2', admin: { id: 'a2', name: 'Ruth Ndifor', avatar: 'https://i.pravatar.cc/80?img=20' }, action: 'VERIFY_PROFESSIONAL', targetType: 'professional', targetId: 'p2', description: 'Verified professional Marie Nkeng', ipAddress: '102.244.13.12', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), severity: 'info' },
  { id: 'l3', admin: { id: 'a1', name: 'Jean Kamdem', avatar: 'https://i.pravatar.cc/80?img=12' }, action: 'DELETE_FEED', targetType: 'feed', targetId: 'f5', description: 'Removed feed flagged for defamation', ipAddress: '102.244.12.88', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), severity: 'warning' },
  { id: 'l4', admin: { id: 'a3', name: 'Marc Tchami', avatar: 'https://i.pravatar.cc/80?img=64' }, action: 'UPDATE_ROLE', targetType: 'administrator', targetId: 'a4', description: 'Promoted support admin to moderator', ipAddress: '102.244.20.5', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), severity: 'critical' },
  { id: 'l5', admin: { id: 'a2', name: 'Ruth Ndifor', avatar: 'https://i.pravatar.cc/80?img=20' }, action: 'LOGIN', targetType: 'session', targetId: 'sess_9911', description: 'Signed in from a new device', ipAddress: '102.244.13.12', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), severity: 'info' },
];

export const auditLogsService = {
  async getAll(): Promise<AuditLog[]> {
    await delay();
    return logs;
  },
};