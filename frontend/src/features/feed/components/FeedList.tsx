import React from 'react';
import { MessageSquare } from 'lucide-react';
import type { Feed } from '../types/feed.types';
import PostCard from './PostCard';
import { FeedSkeleton } from './FeedSkeleton';

interface FeedListProps {
  feeds: Feed[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onLike?: (id: string) => void;
  onDelete?: (id: string) => void;
  onComment?: (feedId: string, content: string) => void;
  onDeleteComment?: (feedId: string, commentId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
  emptyMessage?: string;
}

export const FeedList: React.FC<FeedListProps> = ({
  feeds,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
  onLike,
  onDelete,
  onComment,
  onDeleteComment,
  onHashtagClick,
  emptyMessage = 'No content available at the moment.',
}) => {
  if (isLoading && feeds.length === 0) {
    return (
      <div>
        <FeedSkeleton />
        <FeedSkeleton />
        <FeedSkeleton />
      </div>
    );
  }

  if (!feeds || feeds.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-gray-200 dark:border-slate-700">
        <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-slate-600" />
        <p className="text-gray-500 dark:text-slate-400 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {feeds.map((feed) => (
        <PostCard
          key={feed.id}
          feed={feed}
          onLike={onLike || (() => {})}
          onDelete={onDelete}
          onComment={onComment}
          onDeleteComment={onDeleteComment}
          onHashtagClick={onHashtagClick}
        />
      ))}

      {isLoadingMore && <FeedSkeleton />}

      {hasMore && onLoadMore && !isLoadingMore && (
        <button
          onClick={onLoadMore}
          className="w-full py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition"
        >
          Load more
        </button>
      )}
    </div>
  );
};

export default FeedList;