// ─────────────────────────────────────────────────────────────
// USER (lightweight — matches backend UserResponse subset)
// ─────────────────────────────────────────────────────────────
export interface FeedUser {
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
// MEDIA (image or video)
// ─────────────────────────────────────────────────────────────
export type FeedMediaType = 'image' | 'video';

export interface FeedMedia {
  id: string;
  media_url: string;
  media_type: FeedMediaType;
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
export interface FeedComment {
  id: string;
  feed_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  replies: FeedComment[];
  user?: FeedUser | null;
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
// FEED
// ─────────────────────────────────────────────────────────────
export type FeedStatus =
  | 'draft'
  | 'published'
  | 'archived'
  | 'pending_moderation'
  | 'pending_review'
  | 'rejected';

/** Client-only flag set on optimistic (still uploading) or failed posts. */
export type FeedClientStatus = 'uploading' | 'failed';

export interface Feed {
  id: string;
  title: string;
  description: string;
  status: FeedStatus;
  is_public: boolean;
  user_id: string;
  is_deleted: boolean;

  created_at: string;
  updated_at: string;

  // Aggregates
  likes_count: number;
  comments_count: number;
  is_liked: boolean;

  // Relations
  user?: FeedUser | null;
  media: FeedMedia[];
  hashtags: Hashtag[];
  comments: FeedComment[];

  // Moderation summary — populated for owner / admin / moderator.
  moderation?: ModerationSummary | null;

  // ─── Client-only fields (never sent by the backend) ──────
  /** Set only while an optimistic post is uploading or has failed. */
  _clientStatus?: FeedClientStatus;
  /** Temporary ID used to reconcile the optimistic post with the real one. */
  _tempId?: string;
}

// ─────────────────────────────────────────────────────────────
// LIST RESPONSE
// ─────────────────────────────────────────────────────────────
export interface FeedListResponse {
  items: Feed[];
  total: number;
  page: number;
  size: number;
}

// ─────────────────────────────────────────────────────────────
// REQUESTS
// ─────────────────────────────────────────────────────────────
export interface FeedCreatePayload {
  title: string;
  description: string;
  status?: FeedStatus;
  is_public?: boolean;
  hashtags?: string[];
  media?: File | null;
}

export interface FeedUpdatePayload {
  title?: string;
  description?: string;
  status?: FeedStatus;
  is_public?: boolean;
  hashtags?: string[];
}

export interface FeedLikeResponse {
  feed_id: string;
  liked: boolean;
}

export interface FeedCommentCreatePayload {
  content: string;
  parent_id?: string | null;
}

// ─────────────────────────────────────────────────────────────
// FILTERS (for hooks)
// ─────────────────────────────────────────────────────────────
export interface FeedFilters {
  search?: string;
  hashtag?: string;
  user_id?: string;
  status?: FeedStatus;
}

export interface FeedListParams extends FeedFilters {
  skip?: number;
  limit?: number;
}