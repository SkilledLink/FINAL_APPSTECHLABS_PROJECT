import { api } from '../api/api';
import type { AdminUser } from '../types/admin.types';

const mapUser = (u: any): AdminUser => ({
  id: u.id,
  name:
    [u.first_name, u.last_name].filter(Boolean).join(' ') ||
    u.username ||
    u.email,
  email: u.email,
  username: u.username,
  avatar: u.profile_image_url ?? `https://i.pravatar.cc/80?u=${u.id}`,
  location: u.location,
  joinedDate: u.created_at,
  status: u.status,
  verified: !!u.is_email_verified,
  isAdmin: !!u.is_admin,
  isModerator: !!u.is_moderator,
  accountType: u.account_type,
  lastActive: u.last_login_at,
});

export const usersService = {
  async getAll(): Promise<AdminUser[]> {
    const { data } = await api.get('/admin/users', {
      params: { skip: 0, limit: 100 },
    });
    return (data.items ?? []).map(mapUser);
  },

  async suspend(id: string, reason: string): Promise<void> {
    await api.post(`/admin/users/${id}/suspend`, { reason });
  },

  async reactivate(id: string, reason: string): Promise<void> {
    await api.post(`/admin/users/${id}/reactivate`, { reason });
  },

  async remove(id: string, reason: string): Promise<void> {
    await api.delete(`/admin/users/${id}`, { params: { reason } });
  },
};