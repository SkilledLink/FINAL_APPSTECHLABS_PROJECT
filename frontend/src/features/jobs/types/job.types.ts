// src/features/jobs/types/job.types.ts

export type JobStatus = 'draft' | 'published' | 'closed' | 'archived';

export const JOB_STATUSES: JobStatus[] = ['draft', 'published', 'closed', 'archived'];

/** Matches backend UserResponse — used as the job author block */
export interface JobAuthor {
  id: string;
  email?: string;
  username: string;
  first_name: string;
  last_name: string;
  bio?: string | null;
  location?: string | null;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  account_type?: string;
  status?: string;
  is_admin?: boolean;
  is_moderator?: boolean;
  created_at?: string;
}

export interface JobImage {
  id: string;
  image_url: string;
  order: number;
}

export interface JobComment {
  id: string;
  user_id: string;
  job_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  replies: JobComment[];
  user?: JobAuthor;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  user_id: string;
  created_at: string;
  updated_at: string;

  likes_count: number;
  comments_count: number;
  is_liked: boolean;

  user?: JobAuthor;
  images: JobImage[];
  comments: JobComment[];
}

/* -------- Requests / lists -------- */

export interface JobListParams {
  page?: number;
  size?: number;
  user_id?: string;
  search?: string;
}

export interface JobListResponse {
  items: Job[];
  total: number;
  page: number;
  size: number;
}

export interface JobCreateInput {
  title: string;
  description: string;
  status?: JobStatus;
  files?: File[];
}

export interface JobUpdateInput {
  title?: string;
  description?: string;
  status?: JobStatus;
}

export interface JobImageResponse {
  id: string;
  image_url: string;
  order: number;
}

export interface JobLikeResponse {
  job_id: string;
  liked: boolean;
}

export interface JobCommentCreateInput {
  content: string;
  parent_id?: string | null;
}

export interface JobCommentResponse {
  id: string;
  user_id: string;
  job_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  replies: JobComment[];
  user?: JobAuthor;
}