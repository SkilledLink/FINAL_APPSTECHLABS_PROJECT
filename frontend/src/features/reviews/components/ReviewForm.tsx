// src/features/reviews/components/ReviewForm.tsx

import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';

interface ReviewFormProps {
  mode: 'create' | 'edit';
  initialRating?: number;
  initialTitle?: string;
  initialComment?: string;
  onCancel: () => void;
  onSubmit: (payload: { rating: number; title: string; comment: string }) => Promise<boolean>;
}

const GLASS_PANEL =
  'bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl border border-white/50 dark:border-white/10 shadow-2xl';

const GLASS_INPUT =
  'w-full px-3.5 py-2 rounded-xl bg-white/60 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-white/10 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition';

export const ReviewForm: React.FC<ReviewFormProps> = ({
  mode,
  initialRating = 5,
  initialTitle = '',
  initialComment = '',
  onCancel,
  onSubmit,
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hovered, setHovered] = useState<number | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [comment, setComment] = useState(initialComment);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (comment.trim().length < 3) return;
    setSubmitting(true);
    const ok = await onSubmit({
      rating,
      title: title.trim(),
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (ok) onCancel();
  };

  const displayValue = hovered ?? rating;

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xl p-0 sm:p-4">
      <div
        className={`${GLASS_PANEL} rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/40 dark:border-white/10">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {mode === 'edit' ? 'Edit review' : 'Write a review'}
          </h3>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-xl hover:bg-white/60 dark:hover:bg-slate-800/60 text-slate-500 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Your rating
            </label>
            <div
              className="flex items-center gap-1"
              onMouseLeave={() => setHovered(null)}
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onMouseEnter={() => setHovered(n)}
                  onClick={() => setRating(n)}
                  className="p-1 transition-transform hover:scale-110"
                  aria-label={`${n} star${n > 1 ? 's' : ''}`}
                >
                  <Star
                    className={`w-7 h-7 ${
                      n <= displayValue
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-transparent text-slate-300 dark:text-slate-600'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                {displayValue}/5
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Title (optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={150}
              className={GLASS_INPUT}
              placeholder="e.g. Excellent work, very professional"
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Your review
            </label>
            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={2000}
              required
              className={`${GLASS_INPUT} resize-none`}
              placeholder="Tell others about your experience…"
            />
            <p className="mt-1 text-[11px] text-slate-400">
              {comment.length}/2000
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 pt-4 pb-28 sm:pb-4 border-t border-white/40 dark:border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 rounded-xl bg-white/50 dark:bg-slate-800/40 backdrop-blur-md border border-white/60 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white/70 text-xs font-bold transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || comment.trim().length < 3}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Submitting…' : mode === 'edit' ? 'Save changes' : 'Submit review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewForm;