// src/features/jobs/services/jobService.ts
import { apiClient } from '../../../api/client'; // ← adjust path
import type {
  Job,
  JobListParams,
  JobListResponse,
  JobCreateInput,
  JobUpdateInput,
  JobImageResponse,
  JobLikeResponse,
  JobCommentCreateInput,
  JobCommentResponse,
} from '../types/job.types';

function toMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(', ');
  }
  return JSON.stringify(detail);
}

export const jobService = {
  async list(params: JobListParams = {}): Promise<JobListResponse> {
    try {
      const { data } = await apiClient.get<JobListResponse>('/jobs', {
        params: {
          page: params.page ?? 1,
          size: params.size ?? 20,
          user_id: params.user_id || undefined,
          search: params.search || undefined,
        },
      });
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load jobs'));
    }
  },

  async get(jobId: string): Promise<Job> {
    try {
      const { data } = await apiClient.get<Job>(`/jobs/${jobId}`);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load job'));
    }
  },

  async create(input: JobCreateInput): Promise<Job> {
    try {
      const form = new FormData();
      form.append('title', input.title);
      form.append('description', input.description);
      form.append('status', input.status ?? 'published');
      (input.files ?? []).slice(0, 5).forEach((file) =>
        form.append('files', file)
      );
      const { data } = await apiClient.post<Job>('/jobs', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to create job'));
    }
  },

  async update(jobId: string, input: JobUpdateInput): Promise<Job> {
    try {
      const { data } = await apiClient.put<Job>(`/jobs/${jobId}`, input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to update job'));
    }
  },

  async remove(jobId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/${jobId}`);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete job'));
    }
  },

  async uploadImages(jobId: string, files: File[]): Promise<JobImageResponse[]> {
    try {
      const form = new FormData();
      files.slice(0, 5).forEach((file) => form.append('files', file));
      const { data } = await apiClient.post<JobImageResponse[]>(
        `/jobs/${jobId}/images`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to upload images'));
    }
  },

  async deleteImage(imageId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/images/${imageId}`);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete image'));
    }
  },

  async toggleLike(jobId: string): Promise<JobLikeResponse> {
    try {
      const { data } = await apiClient.post<JobLikeResponse>(
        `/jobs/${jobId}/like`
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to toggle like'));
    }
  },

  async createComment(
    jobId: string,
    input: JobCommentCreateInput
  ): Promise<JobCommentResponse> {
    try {
      const { data } = await apiClient.post<JobCommentResponse>(
        `/jobs/${jobId}/comments`,
        input
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to post comment'));
    }
  },

  async deleteComment(commentId: string): Promise<void> {
    try {
      await apiClient.delete(`/jobs/comments/${commentId}`);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete comment'));
    }
  },
};