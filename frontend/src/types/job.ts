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
  replies?: JobComment[];
}

export interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  likes_count: number;
  comments_count: number;
  is_liked: boolean;
  user?: any;
  images?: JobImage[];
  comments?: JobComment[];
}

export interface JobCreate {
  title: string;
  description: string;
  status?: string;
}

export interface JobUpdate {
  title?: string;
  description?: string;
  status?: string;
}

export interface JobCommentCreate {
  content: string;
  parent_id?: string | null;
}