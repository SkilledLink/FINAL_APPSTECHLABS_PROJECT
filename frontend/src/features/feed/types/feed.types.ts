export type FeedType = 'recommended' | 'following' | 'local' | 'trending';

export interface FeedUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  badge?: string;
  isVerified?: boolean;
}

export interface FeedImage {
  url: string;
  alt: string;
  width?: number;
  height?: number;
}

export interface FeedMetadata {
  likesCount: number;
  commentsCount: number;
  sharesCount: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  location?: string;
  category?: string;
  skills?: string[];
}

export interface FeedItemData {
  id: string;
  user: FeedUser;
  title?: string;
  content: string;
  createdAt: string;
  images?: FeedImage[];
  metadata: FeedMetadata;
}

export interface FeedFiltersState {
  location?: string;
  category?: string;
  skill?: string;
  searchQuery?: string;
  sortBy?: 'recent' | 'popular' | 'distance';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  hasMore: boolean;
  totalItems?: number;
}

export interface FeedResponse {
  data: FeedItemData[];
  pagination: PaginationMeta;
}

export interface UseFeedOptions {
  type: FeedType;
  filters?: FeedFiltersState;
  enabled?: boolean;
}

export interface UseInfiniteFeedOptions {
  type: FeedType;
  filters?: FeedFiltersState;
  limit?: number;
}