import type { Administrator } from '../types/admin.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const admins: Administrator[] = [
  { id: 'a1', name: 'Jean Kamdem', email: 'jean.kamdem@servio.cm', avatar: 'https://i.pravatar.cc/80?img=12', role: 'super_admin', permissions: ['all'], status: 'active', lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(), joinedDate: '2023-01-10' },
  { id: 'a2', name: 'Ruth Ndifor', email: 'ruth.ndifor@servio.cm', avatar: 'https://i.pravatar.cc/80?img=20', role: 'admin', permissions: ['users', 'professionals', 'jobs', 'feeds'], status: 'active', lastActive: new Date(Date.now() - 1000 * 60 * 60).toISOString(), joinedDate: '2023-06-22' },
  { id: 'a3', name: 'Marc Tchami', email: 'marc.tchami@servio.cm', avatar: 'https://i.pravatar.cc/80?img=64', role: 'moderator', permissions: ['moderation', 'feeds'], status: 'active', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), joinedDate: '2024-02-15' },
  { id: 'a4', name: 'Linda Etame', email: 'linda.etame@servio.cm', avatar: 'https://i.pravatar.cc/80?img=41', role: 'support', permissions: ['users', 'jobs'], status: 'inactive', lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(), joinedDate: '2024-08-01' },
];

export const administratorsService = {
  async getAll(): Promise<Administrator[]> {
    await delay();
    return admins;
  },
};