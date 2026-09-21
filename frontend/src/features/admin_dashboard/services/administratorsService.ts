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
  // Kept for backwards compatibility with anything that still reads `role`.
  // Prefer `isAdmin` / `isModerator` going forward.
  role: u.is_admin ? 'admin' : 'moderator',
  status: u.status === 'active' ? 'active' : 'inactive',
  lastActive: u.last_login_at,
  joinedDate: u.created_at,
});

export interface AdministratorsPage {
  items: Administrator[];
  total: number;
}

export const administratorsService = {
  async getPage(skip: number, limit: number): Promise<AdministratorsPage> {
    const { data } = await api.get('/admin/administrators', {
      params: { skip, limit },
    });
    return {
      items: (data.items ?? []).map(mapAdmin),
      total: data.total ?? 0,
    };
  },

  async getAll(limit = 100): Promise<Administrator[]> {
    const { items } = await this.getPage(0, limit);
    return items;
  },

  /** Toggle the admin flag. */
  async updateRole(id: string, isAdmin: boolean, reason: string): Promise<void> {
    await api.patch(`/admin/administrators/${id}`, {
      is_admin: isAdmin,
      reason,
    });
  },

  /** Toggle the moderator flag. */
  async updateModeratorRole(
    id: string,
    isModerator: boolean,
    reason: string,
  ): Promise<void> {
    await api.patch(`/admin/administrators/${id}`, {
      is_moderator: isModerator,
      reason,
    });
  },
};