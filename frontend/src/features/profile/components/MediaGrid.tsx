// src/features/profile/components/MediaGrid.tsx

import React from 'react';
import { MediaGridCard } from './MediaGridCard';
import type { FeedThumbnail } from '../types/profile.types';

type MediaStatus = 'idle' | 'loading' | 'ready' | 'error';

interface MediaGridProps {
  items: FeedThumbnail[];
  status: MediaStatus;
  error: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
  onCardClick: (item: FeedThumbnail) => void;
  onRetry: () => void;
  emptyState: React.ReactNode;
}

const GRID_CLASSES =
  'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-1 sm:gap-2';

export const MediaGrid: React.FC<MediaGridProps> = ({
  items,
  status,
  error,
  hasMore,
  isLoadingMore,
  onLoadMore,
  onCardClick,
  onRetry,
  emptyState,
}) => {
  // Initial load, no items yet
  if (status === 'loading' && items.length === 0) {
    return (
      <div className={GRID_CLASSES}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-xl
                       bg-slate-100 dark:bg-slate-800 animate-pulse"
          />
        ))}
      </div>
    );
  }

  // Initial load failed, no items
  if (status === 'error' && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center
                      py-16 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {error ?? 'Something went wrong.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 text-sm font-semibold
                     text-blue-600 dark:text-blue-400
                     hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  // Ready but empty
  if (status === 'ready' && items.length === 0) {
    return <>{emptyState}</>;
  }

  // Grid with items
  return (
    <div className="space-y-4">
      <div className={GRID_CLASSES}>
        {items.map((item) => (
          <MediaGridCard
            key={item.feedId}
            thumbnailUrl={item.thumbnailUrl}
            title={item.title}
            mediaType={item.mediaType}
            mediaCount={item.mediaCount}
            onClick={() => onCardClick(item)}
          />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="rounded-full border
                       border-slate-200 dark:border-slate-800
                       bg-white dark:bg-slate-900
                       px-6 py-2 text-sm font-semibold
                       text-slate-700 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-slate-800
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors"
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}

      {error && items.length > 0 && (
        <p className="text-center text-sm text-rose-500">{error}</p>
      )}
    </div>
  );
};