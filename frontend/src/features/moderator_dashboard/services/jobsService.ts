import { api } from '../api/api';
import type { AdminJob, AdminJobDetail, JobComment } from '../types/moderator.types';

const mapComment = (c: any): JobComment => ({
  id: c.id,
  userId: c.user_id,
  jobId: c.job_id,
  content: c.content,
  createdAt: c.created_at,
  updatedAt: c.updated_at,
  replies: (c.replies ?? []).map(mapComment),
});

const mapJob = (j: any): AdminJob => {
  const u = j.user ?? {};
  return {
    id: j.id,
    title: j.title ?? '',
    description: j.description ?? '',
    status: j.status ?? 'unknown',
    userId: j.user_id,
    client: {
      id: u.id ?? j.user_id,
      name:
        [u.first_name, u.last_name].filter(Boolean).join(' ') ||
        u.username ||
        'Unknown',
      avatar: u.profile_image_url || '',
    },
    images: (j.images ?? []).map((i: any) => i.image_url),
    likes: j.likes_count ?? 0,
    comments: j.comments_count ?? 0,
    postedDate: j.created_at,
    updatedAt: j.updated_at,
  };
};

const mapJobDetail = (j: any): AdminJobDetail => ({
  ...mapJob(j),
  commentsList: (j.comments ?? []).map(mapComment),
});

export interface JobsPage {
  items: AdminJob[];
  total: number;
}

export const jobsService = {
  async getPage(skip: number, limit: number): Promise<JobsPage> {
    const { data } = await api.get('/moderator/jobs', {
      params: { skip, limit },
    });
    return {
      items: (data.items ?? []).map(mapJob),
      total: data.total ?? 0,
    };
  },

  async getAll(limit = 100): Promise<AdminJob[]> {
    const { items } = await this.getPage(0, limit);
    return items;
  },

  async getOne(id: string): Promise<AdminJobDetail> {
    const { data } = await api.get(`/moderator/jobs/${id}`);
    return mapJobDetail(data);
  },

  async remove(id: string, reason: string): Promise<void> {
    await api.delete(`/moderator/jobs/${id}`, { params: { reason } });
  },

  async removeComment(commentId: string, reason: string): Promise<void> {
    await api.delete(`/moderator/jobs/comments/${commentId}`, {
      params: { reason },
    });
  },
};