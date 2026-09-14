// ─────────────────────────────────────────────────────────────
// USER
// ─────────────────────────────────────────────────────────────
export interface PostUser {
  id: string;
  email?: string;
  username?: string | null;
  first_name: string;
  last_name: string;
  bio?: string | null;
  location?: string | null;
  account_type?: string;
  profile_image_url?: string | null;
  banner_image_url?: string | null;
  is_following?: boolean;
  followers_count?: number;
  following_count?: number;
}

// ─────────────────────────────────────────────────────────────
// MEDIA
// ─────────────────────────────────────────────────────────────
export type PostMediaType = 'image' | 'video';

export interface PostMedia {
  id: string;
  media_url: string;
  media_type: PostMediaType;
  thumbnail_url?: string | null;
  width?: number | null;
  height?: number | null;
  duration_seconds?: number | null;
  file_size?: number | null;
}

// ─────────────────────────────────────────────────────────────
// HASHTAG
// ─────────────────────────────────────────────────────────────
export interface Hashtag {
  id: string;
  name: string;
  usage_count: number;
}

// ─────────────────────────────────────────────────────────────
// COMMENT
// ─────────────────────────────────────────────────────────────
export interface PostComment {
  id: string;
  feed_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  replies: PostComment[];
  user?: PostUser | null;
}

// ─────────────────────────────────────────────────────────────
// MODERATION
// ─────────────────────────────────────────────────────────────
export type ModerationDecision = 'safe' | 'review' | 'unsafe';

export interface ModerationSummary {
  record_id: string;
  decision: ModerationDecision;
  severity: number;
  confidence: number;
  description: string;
  reason: string;
  categories: string[];
  provider: string;
  model: string;
  error?: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────
// POST
// ─────────────────────────────────────────────────────────────
export type PostStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'pending_moderation'
  | 'pending_review'
  | 'rejected';

export type PostClientStatus = 'uploading' | 'failed';

export interface Post {
  id: string;
  title: string;
  description: string;
  status: PostStatus;
  is_public: boolean;
  user_id: string;
  is_deleted: boolean;

  created_at: string;
  updated_at: string;

  likes_count: number;
  comments_count: number;
  is_liked: boolean;

  user?: PostUser | null;
  media: PostMedia[];
  hashtags: Hashtag[];
  comments: PostComment[];

  moderation?: ModerationSummary | null;

  // Client-only — never sent by the backend
  _clientStatus?: PostClientStatus;
  _tempId?: string;
}

// ─────────────────────────────────────────────────────────────
// LIST RESPONSE
// ─────────────────────────────────────────────────────────────
export interface PostListResponse {
  items: Post[];
  total: number;
  page: number;
  size: number;
}

// ─────────────────────────────────────────────────────────────
// REQUESTS
// ─────────────────────────────────────────────────────────────
export interface PostCreatePayload {
  title: string;
  description: string;
  status?: PostStatus;
  is_public?: boolean;
  hashtags?: string[];
  media?: File | null;
}

export interface PostUpdatePayload {
  title?: string;
  description?: string;
  status?: PostStatus;
  is_public?: boolean;
  hashtags?: string[];
}

export interface PostLikeResponse {
  feed_id: string;
  liked: boolean;
}

export interface PostCommentCreatePayload {
  content: string;
  parent_id?: string | null;
}

// ─────────────────────────────────────────────────────────────
// FILTERS
// ─────────────────────────────────────────────────────────────
export interface PostFilters {
  search?: string;
  hashtag?: string;
  user_id?: string;
  status?: PostStatus;
}

export interface PostListParams extends PostFilters {
  skip?: number;
  limit?: number;
}