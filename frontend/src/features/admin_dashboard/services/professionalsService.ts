import { api } from '../api/api';
import type { AdminProfessional } from '../types/admin.types';

const mapPro = (p: any): AdminProfessional => {
  const u = p.user ?? {};
  return {
    id: p.id,
    userId: p.user_id,
    name:
      [u.first_name, u.last_name].filter(Boolean).join(' ') ||
      u.username ||
      'Unknown',
    avatar:
      u.profile_image_url ?? `https://i.pravatar.cc/80?u=${u.id ?? p.user_id}`,
    profession: p.profession ?? '',
    headline: p.headline,
    location:
      [u.city, p.city, p.region, p.country].filter(Boolean)[0] ?? '—',
    status: p.status,
    verificationStatus: p.verification_status,
    isVerified: !!p.is_verified,
    isFlagged: !!p.is_flagged,
    trustScore: p.trust_score ?? 0,
    rating: p.rating ?? 0,
    totalReviews: p.total_reviews ?? 0,
    totalJobs: p.completed_jobs ?? 0,
    joinedDate: p.created_at,
    available: !!p.available,
  };
};

export const professionalsService = {
  async getAll(): Promise<AdminProfessional[]> {
    const { data } = await api.get('/admin/professionals', {
      params: { skip: 0, limit: 100, include_deleted: true },
    });
    return (data.items ?? []).map(mapPro);
  },

  async verify(
    id: string,
    newStatus: 'manual_approved' | 'manual_rejected',
    reason: string,
  ): Promise<void> {
    await api.post(`/admin/professionals/${id}/verify`, {
      new_status: newStatus,
      reason,
    });
  },

  async suspend(id: string, reason: string): Promise<void> {
    await api.post(`/admin/professionals/${id}/suspend`, { reason });
  },

  async reactivate(id: string, reason: string): Promise<void> {
    await api.post(`/admin/professionals/${id}/reactivate`, { reason });
  },

  async flag(id: string, reason: string, notes?: string): Promise<void> {
    await api.post(`/admin/professionals/${id}/flag`, { reason, notes });
  },

  async unflag(id: string, reason: string): Promise<void> {
    await api.post(`/admin/professionals/${id}/unflag`, { reason });
  },
};