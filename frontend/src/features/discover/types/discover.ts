export type DiscoverTabType = 'all' | 'professionals' | 'businesses' | 'services' | 'jobs' | 'projects';

export interface RecommendedCard {
  id: string;
  badge: 'Verified' | 'Popular' | 'Top Rated';
  badgeType: 'verified' | 'popular' | 'top';
  coverImage: string;
  avatar: string;
  name: string;
  title: string;
  rating: number;
  reviewCount: number;
  location: string;
  distance: string;
  tags: string[];
  primaryActionText: string;
  secondaryActionText: string;
}

export interface TopProfessional {
  id: string;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  distance: string;
  isVerified: boolean;
}

export interface TrendingCategory {
  id: string;
  name: string;
  searchCount: string;
  iconName: string;
  bgImage: string;
}

export interface OpportunityItem {
  id: string;
  title: string;
  location: string;
  rateOrBudget: string;
  postedTime: string;
  image: string;
  type: 'job' | 'project' | 'service';
}

export interface DiscoverFilterState {
  locationOption: 'near_me' | 'within_10' | 'remote';
  locationInput: string;
  categories: string[];
  minRating: number;
  verifiedOnly: boolean;
  backgroundChecked: boolean;
  identityVerified: boolean;
  priceRange: number;
  experienceLevels: string[];
}