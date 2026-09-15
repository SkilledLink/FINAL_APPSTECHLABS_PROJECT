import type { ModerationReport } from '../types/admin.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const reports: ModerationReport[] = [
  { id: 'r1', targetType: 'feed', targetId: 'f3', targetPreview: 'CHEAPEST CARPENTRY IN TOWN!!! CALL NOW!!!', reporter: { id: 'u2', name: 'Sarah Mbah', avatar: 'https://i.pravatar.cc/80?img=45' }, reason: 'spam', description: 'Repeated promotional spam posted multiple times per day.', status: 'pending', priority: 'medium', createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
  { id: 'r2', targetType: 'user', targetId: 'u4', targetPreview: 'Claudine Etoundi', reporter: { id: 'p5', name: 'Kevin Essomba', avatar: 'https://i.pravatar.cc/80?img=68' }, reason: 'harassment', description: 'Sent abusive messages after job dispute.', status: 'pending', priority: 'high', createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString() },
  { id: 'r3', targetType: 'professional', targetId: 'p3', targetPreview: 'Alain Tchoumi', reporter: { id: 'u5', name: 'Bertrand Njoya', avatar: 'https://i.pravatar.cc/80?img=51' }, reason: 'fake', description: 'Suspicious profile — credentials cannot be verified.', status: 'reviewing', priority: 'high', createdAt: new Date(Date.now() - 1000 * 60 * 300).toISOString() },
  { id: 'r4', targetType: 'comment', targetId: 'c991', targetPreview: 'You are a total scam artist...', reporter: { id: 'p1', name: 'Jean-Pierre Mbock', avatar: 'https://i.pravatar.cc/80?img=12' }, reason: 'inappropriate', description: 'Offensive language in public comment.', status: 'resolved', priority: 'low', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
];

export const moderationService = {
  async getAll(): Promise<ModerationReport[]> {
    await delay();
    return reports;
  },
  async updateStatus(id: string, status: ModerationReport['status']): Promise<void> {
    await delay(200);
    const r = reports.find((x) => x.id === id);
    if (r) r.status = status;
  },
};