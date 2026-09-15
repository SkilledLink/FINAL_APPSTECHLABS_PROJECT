import type { AdminUser } from '../types/admin.types';

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const users: AdminUser[] = [
  { id: 'u1', name: 'Paul Biya', email: 'paul.biya@example.cm', phone: '+237 6 77 12 34 56', avatar: 'https://i.pravatar.cc/80?img=33', location: 'Yaoundé, Cameroon', joinedDate: '2024-08-12', status: 'active', verified: true, totalRequests: 14, totalSpent: 245_000 },
  { id: 'u2', name: 'Sarah Mbah', email: 'sarah.mbah@example.cm', phone: '+237 6 55 88 22 11', avatar: 'https://i.pravatar.cc/80?img=45', location: 'Douala, Cameroon', joinedDate: '2024-09-04', status: 'active', verified: false, totalRequests: 6, totalSpent: 82_500 },
  { id: 'u3', name: 'Yannick Fotso', email: 'yannick.fotso@example.cm', phone: '+237 6 90 44 55 66', avatar: 'https://i.pravatar.cc/80?img=15', location: 'Bafoussam, Cameroon', joinedDate: '2025-01-02', status: 'pending', verified: false, totalRequests: 0, totalSpent: 0 },
  { id: 'u4', name: 'Claudine Etoundi', email: 'claudine.e@example.cm', phone: '+237 6 71 33 22 99', avatar: 'https://i.pravatar.cc/80?img=27', location: 'Yaoundé, Cameroon', joinedDate: '2024-05-20', status: 'suspended', verified: true, totalRequests: 22, totalSpent: 410_000 },
  { id: 'u5', name: 'Bertrand Njoya', email: 'b.njoya@example.cm', phone: '+237 6 99 77 88 44', avatar: 'https://i.pravatar.cc/80?img=51', location: 'Buea, Cameroon', joinedDate: '2024-11-18', status: 'active', verified: true, totalRequests: 9, totalSpent: 132_000 },
];

export const usersService = {
  async getAll(): Promise<AdminUser[]> {
    await delay();
    return users;
  },
  async updateStatus(id: string, status: AdminUser['status']): Promise<void> {
    await delay(200);
    const u = users.find((x) => x.id === id);
    if (u) u.status = status;
  },
};