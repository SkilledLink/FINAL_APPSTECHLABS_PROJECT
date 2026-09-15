import { api } from '../api/api';
import type { Administrator } from '../types/admin.types';

const mapAdmin = (u: any): Administrator => ({
  id: u.id,
  name:
    [u.first_name, u.last_name].filter(Boolean).join(' ') ||
    u.username ||
    u.email,
  email: u.email,
  avatar: u.profile_image_url ?? `https://i.pravatar.cc/80?u=${u.id}`,
  isAdmin: !!u.is_admin,
  isModerator: !!u.is_moderator,
  role: u.is_admin ? 'admin' : 'moderator',
  status: u.status === 'active' ? 'active' : 'inactive',
  lastActive: u.last_login_at,
  joinedDate: u.created_at,
});

export const administratorsService = {
  async getAll(): Promise<Administrator[]> {
    const { data } = await api.get('/admin/administrators', {
      params: { skip: 0, limit: 100 },
    });
    return (data.items ?? []).map(mapAdmin);
  },

  async updateRole(id: string, isAdmin: boolean, reason: string): Promise<void> {
    await api.patch(`/admin/administrators/${id}`, {
      is_admin: isAdmin,
      reason,
    });
  },
};