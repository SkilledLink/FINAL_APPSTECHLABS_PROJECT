import { api } from '../api/api';
import type { AdminProfessional, AdminProfessionalDetail } from '../types/admin.types';

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

const mapProDetail = (p: any): AdminProfessionalDetail => {
  const u = p.user ?? {};
  return {
    ...mapPro(p),
    bio: p.bio,
    experienceLevel: p.experience_level,
    yearsOfExperience: p.years_of_experience,
    companyName: p.company_name,
    jobTitle: p.job_title,
    employmentType: p.employment_type,
    hourlyRate: p.hourly_rate,
    currency: p.currency ?? 'XAF',
    country: p.country,
    region: p.region,
    city: p.city,
    websiteUrl: p.website_url,
    linkedinUrl: p.linkedin_url,
    portfolioUrl: p.portfolio_url,
    skills: p.skills ?? [],
    services: p.services ?? [],
    languages: p.languages ?? [],
    availabilityNotes: p.availability_notes,
    responseTimeHours: p.response_time_hours,
    verifiedAt: p.verified_at,

    verificationData: p.verification_data ?? null,
    verificationAttempts: p.verification_attempts ?? 0,
    verificationLastAttemptAt: p.verification_last_attempt_at,
    adminOverrideStatus: p.admin_override_status,
    adminOverrideBy: p.admin_override_by,
    adminOverrideAt: p.admin_override_at,
    adminOverrideReason: p.admin_override_reason,
    fraudNotes: p.fraud_notes,

    deletedAt: p.deleted_at,
    deletedByUserId: p.deleted_by_user_id,
    deletionType: p.deletion_type,
    deletionReason: p.deletion_reason,
    retentionUntil: p.retention_until,

    snapshotEmail: p.snapshot_email,
    snapshotUsername: p.snapshot_username,
    snapshotIp: p.snapshot_ip,
    snapshotUserAgent: p.snapshot_user_agent,

    updatedAt: p.updated_at,
  };
};

export const professionalsService = {
  async getAll(): Promise<AdminProfessional[]> {
    const { data } = await api.get('/admin/professionals', {
      params: { skip: 0, limit: 100, include_deleted: true },
    });
    return (data.items ?? []).map(mapPro);
  },

  async getOne(id: string): Promise<AdminProfessionalDetail> {
    const { data } = await api.get(`/admin/professionals/${id}`);
    return mapProDetail(data);
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

  async updateTrustScore(
    id: string,
    newScore: number,
    reason: string,
  ): Promise<void> {
    await api.post(`/admin/professionals/${id}/trust-score`, {
      new_score: newScore,
      reason,
    });
  },

  async remove(
    id: string,
    reason: string,
    deletionType: 'self' | 'admin' | 'gdpr' | 'ban' = 'admin',
  ): Promise<void> {
    await api.delete(`/admin/professionals/${id}`, {
      params: { reason, deletion_type: deletionType },
    });
  },
};