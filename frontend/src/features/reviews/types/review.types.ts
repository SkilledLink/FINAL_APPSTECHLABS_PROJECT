// src/features/reviews/types/review.types.ts

export interface ReviewerPublic {
  id: string;
  firstName: string;
  lastName: string;
  username?: string | null;
  profileImageUrl?: string | null;
  accountType?: string | null;
}

export interface Review {
  id: string;
  reviewerId: string;
  professionalId: string;
  rating: number;
  title?: string | null;
  comment: string;
  isVerifiedHire: boolean;
  createdAt: string;
  updatedAt: string;
  reviewer: ReviewerPublic;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  breakdown: Record<string, number>;
}

export interface ReviewCreatePayload {
  professionalId: string;
  rating: number;
  title?: string;
  comment: string;
}