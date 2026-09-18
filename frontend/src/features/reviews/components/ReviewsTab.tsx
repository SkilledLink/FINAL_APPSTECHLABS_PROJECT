// src/features/reviews/components/ReviewsTab.tsx

import React, { useState } from 'react';
import {
  Star,
  MessageSquarePlus,
  Loader2,
  Trash2,
  Pencil,
  BadgeCheck,
  AlertCircle,
} from 'lucide-react';
import { useReviews } from '../hooks/useReviews';
import { ReviewForm } from './ReviewForm';
import type { Review } from '../types/review.types';

interface ReviewsTabProps {
  professionalId: string;
  isOwnProfile: boolean;
  currentUserId?: string;
}

/* ─── Single review card ─────────────────────────────── */
const ReviewCard: React.FC<{
  review: Review;
  canEdit: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ review, canEdit, canDelete, onEdit, onDelete }) => {
  const fullName =
    `${review.reviewer.firstName} ${review.reviewer.lastName}`.trim() ||
    review.reviewer.username ||
    'User';

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
      <div className="flex items-start gap-3">
        <img
          src={
            review.reviewer.profileImageUrl ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`
          }
          alt={fullName}
          className="w-10 h-10 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {fullName}
            </p>
            {review.reviewer.accountType === 'professional' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 rounded-full border border-indigo-200 dark:border-indigo-800">
                <BadgeCheck className="w-2.5 h-2.5" />
                Pro
              </span>
            )}
            {review.isVerifiedHire && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                Verified hire
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  className={`w-3.5 h-3.5 ${
                    n <= review.rating
                      ? 'fill-amber-400 text-amber-400'
                      : 'fill-transparent text-slate-300 dark:text-slate-600'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {new Date(review.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>

          {review.title && (
            <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">
              {review.title}
            </p>
          )}
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {review.comment}
          </p>

          {(canEdit || canDelete) && (
            <div className="flex items-center gap-2 mt-3">
              {canEdit && (
                <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─── Rating summary ─────────────────────────────────── */
const RatingSummary: React.FC<{
  avg: number;
  total: number;
  breakdown: Record<string, number>;
}> = ({ avg, total, breakdown }) => (
  <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
    <div className="flex items-center gap-4">
      <div className="text-center shrink-0">
        <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 leading-none">
          {avg.toFixed(1)}
        </div>
        <div className="flex items-center justify-center gap-0.5 mt-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              className={`w-3.5 h-3.5 ${
                n <= Math.round(avg)
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-transparent text-slate-300 dark:text-slate-600'
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {total} {total === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      <div className="flex-1 space-y-1">
        {[5, 4, 3, 2, 1].map((n) => {
          const count = breakdown[String(n)] ?? 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          return (
            <div key={n} className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 w-3">
                {n}
              </span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 w-6 text-right">
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

/* ─── Main tab ───────────────────────────────────────── */
export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  professionalId,
  isOwnProfile,
  currentUserId,
}) => {
  const {
    items,
    stats,
    total,
    hasReviewed,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    submitReview,
    editReview,
    removeReview,
  } = useReviews(professionalId);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Review | null>(null);

  const canWrite = !isOwnProfile && !hasReviewed;

  const handleDelete = async (review: Review) => {
    if (!window.confirm('Delete this review?')) return;
    await removeReview(review.id);
  };

  return (
    <div className="space-y-4">
      {/* ── Top bar: summary + Write button ─────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          {stats && stats.totalReviews > 0 ? (
            <RatingSummary
              avg={stats.averageRating}
              total={stats.totalReviews}
              breakdown={stats.breakdown}
            />
          ) : (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No reviews yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isOwnProfile
                  ? 'Your clients will see their reviews here.'
                  : 'Be the first to share your experience.'}
              </p>
            </div>
          )}
        </div>

        {canWrite && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="self-start sm:self-center inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition shrink-0 active:scale-[0.98]"
          >
            <MessageSquarePlus className="w-4 h-4" />
            Write a review
          </button>
        )}

        {isOwnProfile && (
          <p className="self-start sm:self-center text-[11px] text-slate-400 italic">
            You can't review yourself.
          </p>
        )}

        {!isOwnProfile && hasReviewed && (
          <p className="self-start sm:self-center text-[11px] text-slate-400 italic">
            You've already reviewed this professional.
          </p>
        )}
      </div>

      {/* ── Loading ──────────────────────────────────────── */}
      {loading && items.length === 0 && (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      )}

      {/* ── Error ────────────────────────────────────────── */}
      {error && !loading && items.length === 0 && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 text-center">
          <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-2" />
          <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* ── List ─────────────────────────────────────────── */}
      {items.map((review) => (
        <ReviewCard
          key={review.id}
          review={review}
          canEdit={review.reviewerId === currentUserId}
          canDelete={review.reviewerId === currentUserId}
          onEdit={() => setEditing(review)}
          onDelete={() => handleDelete(review)}
        />
      ))}

      {/* ── Load more ────────────────────────────────────── */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 transition"
          >
            {loadingMore ? 'Loading…' : 'Load more reviews'}
          </button>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {showForm && (
        <ReviewForm
          mode="create"
          onCancel={() => setShowForm(false)}
          onSubmit={(p) => submitReview(p)}
        />
      )}

      {editing && (
        <ReviewForm
          mode="edit"
          initialRating={editing.rating}
          initialTitle={editing.title ?? ''}
          initialComment={editing.comment}
          onCancel={() => setEditing(null)}
          onSubmit={(p) => editReview(editing.id, p)}
        />
      )}
    </div>
  );
};

export default ReviewsTab;