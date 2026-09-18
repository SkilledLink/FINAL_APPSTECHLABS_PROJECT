// src/features/reviews/services/reviewService.ts

import type {
  Review,
  ReviewStats,
  ReviewCreatePayload,
} from '../types/review.types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ─── Mappers ──────────────────────────────────────────── */

const mapReviewFromAPI = (raw: any): Review => ({
  id: raw.id,
  reviewerId: raw.reviewer_id,
  professionalId: raw.professional_id,
  rating: raw.rating,
  title: raw.title ?? null,
  comment: raw.comment,
  isVerifiedHire: raw.is_verified_hire ?? false,
  createdAt: raw.created_at,
  updatedAt: raw.updated_at,
  reviewer: {
    id: raw.reviewer?.id,
    firstName: raw.reviewer?.first_name ?? '',
    lastName: raw.reviewer?.last_name ?? '',
    username: raw.reviewer?.username ?? null,
    profileImageUrl: raw.reviewer?.profile_image_url ?? null,
    accountType: raw.reviewer?.account_type ?? null,
  },
});

const mapStatsFromAPI = (raw: any): ReviewStats => ({
  averageRating: Number(raw.average_rating ?? 0),
  totalReviews: Number(raw.total_reviews ?? 0),
  breakdown: raw.breakdown ?? { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
});

/* ─── Endpoints ────────────────────────────────────────── */

export const fetchProfessionalReviews = async (
  professionalId: string,
  skip = 0,
  limit = 20
): Promise<{ items: Review[]; total: number }> => {
  const params = new URLSearchParams({
    skip: String(skip),
    limit: String(limit),
  });
  const res = await fetch(
    `${API_BASE}/professionals/${professionalId}/reviews?${params}`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(`Failed to load reviews (${res.status})`);
  const data = await res.json();
  return {
    items: (data.items ?? []).map(mapReviewFromAPI),
    total: data.total ?? 0,
  };
};

export const fetchProfessionalReviewStats = async (
  professionalId: string
): Promise<ReviewStats> => {
  const res = await fetch(
    `${API_BASE}/professionals/${professionalId}/reviews/stats`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) throw new Error(`Failed to load review stats (${res.status})`);
  const data = await res.json();
  return mapStatsFromAPI(data);
};

export const checkHasReviewed = async (
  professionalId: string
): Promise<boolean> => {
  const res = await fetch(
    `${API_BASE}/professionals/${professionalId}/reviews/me`,
    { headers: getAuthHeaders() }
  );
  if (!res.ok) return false;
  const data = await res.json();
  return Boolean(data.has_reviewed);
};

export const createReview = async (
  payload: ReviewCreatePayload
): Promise<Review> => {
  const res = await fetch(`${API_BASE}/reviews`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      professional_id: payload.professionalId,
      rating: payload.rating,
      title: payload.title,
      comment: payload.comment,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    let detail = `Failed to submit review (${res.status})`;
    try {
      const parsed = JSON.parse(errText);
      if (parsed?.detail) detail = parsed.detail;
    } catch { /* ignore */ }
    throw new Error(detail);
  }
  const data = await res.json();
  return mapReviewFromAPI(data);
};

export const updateReview = async (
  reviewId: string,
  patch: Partial<ReviewCreatePayload>
): Promise<Review> => {
  const body: Record<string, unknown> = {};
  if (patch.rating !== undefined) body.rating = patch.rating;
  if (patch.title !== undefined) body.title = patch.title;
  if (patch.comment !== undefined) body.comment = patch.comment;

  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to update review (${res.status})`);
  const data = await res.json();
  return mapReviewFromAPI(data);
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete review (${res.status})`);
};