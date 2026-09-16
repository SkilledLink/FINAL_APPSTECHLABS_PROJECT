import { api } from '../api/api';
import type { AdminProfessional, AdminProfessionalDetail } from '../types/moderator.types';

const mapPro = (p: any): AdminProfessional => {
  const u = p.user ?? {};
  return {
    id: p.id,
    userId: p.user_id,
    name:
      [u.first_name, u.last_name].filter(Boolean).join(' ') ||
      u.username ||
      'Unknown',
    avatar: u.profile_image_url || '',
    profession: p.profession ?? '',
    headline: p.headline,
    location:
      [p.city, p.region, p.country].filter(Boolean).join(', ') || '—',
    status: p.status ?? (p.is_verified ? 'active' : 'pending'),
    isVerified: !!p.is_verified,
    rating: p.rating ?? 0,
    totalReviews: p.total_reviews ?? 0,
    totalJobs: p.completed_jobs ?? 0,
    joinedDate: p.created_at ?? '',
    available: !!p.available,
  };
};

const mapProDetail = (p: any): AdminProfessionalDetail => ({
  ...mapPro(p),
  bio: p.bio,
  experienceLevel: p.experience_level,
  yearsOfExperience: p.years_of_experience,
  hourlyRate: p.hourly_rate,
  currency: p.currency ?? 'XAF',
  country: p.country,
  region: p.region,
  city: p.city,
  skills: p.skills ?? [],
  services: p.services ?? [],
  languages: p.languages ?? [],
  updatedAt: p.updated_at,
});

export const professionalsService = {
  async getAll(): Promise<AdminProfessional[]> {
    const { data } = await api.get('/moderator/professionals', {
      params: { skip: 0, limit: 100 },
    });
    return (data.items ?? []).map(mapPro);
  },

  async getOne(id: string): Promise<AdminProfessionalDetail> {
    const { data } = await api.get(`/moderator/professionals/${id}`);
    return mapProDetail(data);
  },

  async suspend(id: string, reason: string): Promise<void> {
    await api.post(`/moderator/professionals/${id}/suspend`, { reason });
  },

  async reactivate(id: string, reason: string): Promise<void> {
    await api.post(`/moderator/professionals/${id}/reactivate`, { reason });
  },
};