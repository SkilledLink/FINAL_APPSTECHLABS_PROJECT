import type { AdminFeed } from '../types/moderator.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const feeds: AdminFeed[] = [
  { id: 'f1', author: { id: 'p1', name: 'Jean-Pierre Mbock', avatar: 'https://i.pravatar.cc/80?img=12', role: 'professional' }, type: 'service', content: 'Just finished a full rewiring job in Bonapriso. Available for new electrical contracts this week.', images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400'], likes: 42, comments: 6, shares: 3, reports: 0, createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), status: 'published' },
  { id: 'f2', author: { id: 'u2', name: 'Sarah Mbah', avatar: 'https://i.pravatar.cc/80?img=45', role: 'client' }, type: 'post', content: 'Looking for a reliable plumber in Douala for an emergency leak repair tonight. Please DM.', images: [], likes: 8, comments: 14, shares: 1, reports: 0, createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), status: 'published' },
  { id: 'f3', author: { id: 'p3', name: 'Alain Tchoumi', avatar: 'https://i.pravatar.cc/80?img=59', role: 'professional' }, type: 'post', content: 'CHEAPEST CARPENTRY IN TOWN!!! CALL NOW!!! 100% GUARANTEED!!!', images: [], likes: 2, comments: 0, shares: 0, reports: 9, createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), status: 'flagged' },
  { id: 'f4', author: { id: 'u5', name: 'Bertrand Njoya', avatar: 'https://i.pravatar.cc/80?img=51', role: 'client' }, type: 'job', content: 'Need someone to install a new water heater in Buea this weekend. Budget negotiable.', images: [], likes: 5, comments: 3, shares: 0, reports: 0, createdAt: new Date(Date.now() - 1000 * 60 * 480).toISOString(), status: 'published' },
  { id: 'f5', author: { id: 'u4', name: 'Claudine Etoundi', avatar: 'https://i.pravatar.cc/80?img=27', role: 'client' }, type: 'post', content: 'Scam alert! Do not trust this provider... (removed)', images: [], likes: 1, comments: 22, shares: 4, reports: 15, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), status: 'removed' },
];

export const feedsService = {
  async getAll(): Promise<AdminFeed[]> {
    await delay();
    return feeds;
  },
  async updateStatus(id: string, status: AdminFeed['status']): Promise<void> {
    await delay(200);
    const f = feeds.find((x) => x.id === id);
    if (f) f.status = status;
  },
};