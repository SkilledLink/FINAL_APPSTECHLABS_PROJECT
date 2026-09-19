import { api } from '../api/api';
import type { AdminUser, AdminUserDetail } from '../types/moderator.types';

const mapUser = (u: any): AdminUser => ({
  id: u.id,
  name:
    [u.first_name, u.last_name].filter(Boolean).join(' ') ||
    u.username ||
    u.email,
  email: u.email,
  username: u.username,
  avatar: u.profile_image_url || '',
  location: u.location,
  joinedDate: u.created_at,
  status: u.status,
  verified: !!u.is_email_verified,
  accountType: u.account_type,
  lastActive: u.last_login_at,
});

const mapUserDetail = (u: any): AdminUserDetail => ({
  ...mapUser(u),
  bio: u.bio,
  followersCount: u.followers_count ?? 0,
  followingCount: u.following_count ?? 0,
  updatedAt: u.updated_at,
});

export interface UsersPage {
  items: AdminUser[];
  total: number;
}

export const usersService = {
  async getPage(skip: number, limit: number): Promise<UsersPage> {
    const { data } = await api.get('/moderator/users', {
      params: { skip, limit },
    });
    return {
      items: (data.items ?? []).map(mapUser),
      total: data.total ?? 0,
    };
  },

  async getAll(limit = 100): Promise<AdminUser[]> {
    const { items } = await this.getPage(0, limit);
    return items;
  },

  async getOne(id: string): Promise<AdminUserDetail> {
    const { data } = await api.get(`/moderator/users/${id}`);
    return mapUserDetail(data);
  },

  async suspend(id: string, reason: string): Promise<void> {
    await api.post(`/moderator/users/${id}/suspend`, { reason });
  },

  async reactivate(id: string, reason: string): Promise<void> {
    await api.post(`/moderator/users/${id}/reactivate`, { reason });
  },
};