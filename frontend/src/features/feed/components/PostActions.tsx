// src/components/feed/PostActions.tsx
import React from 'react';
import type { Post } from '../posts/types/post.types';

interface PostActionsProps {
  post: Post;
  onLike: (id: string) => void;
  onAppreciate: (id: string) => void;
  onRequestService: (id: string) => void;
  onShare: (id: string) => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  onLike,
  onAppreciate,
  onRequestService,
  onShare,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-t border-gray-100 dark:border-slate-700 pt-3 mt-3 w-full">
      <div className="flex items-center gap-4 sm:gap-6 min-w-0">
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap text-gray-700 dark:text-slate-300"
        >
          {/* like icon with dark variant */}
          {post.isLiked ? (
            <svg ... className="w-5 h-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
          ) : (
            <svg ... className="w-5 h-5 flex-shrink-0" />
          )}
          {post.initialLikes + (post.isLiked ? 1 : 0)}
        </button>

        <button className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap text-gray-700 dark:text-slate-300">
          <svg ... className="w-5 h-5 flex-shrink-0" />
          {post.initialComments}
        </button>

        <button
          onClick={() => onShare(post.id)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap text-gray-700 dark:text-slate-300"
        >
          <svg ... className="w-5 h-5 flex-shrink-0" />
          Share
        </button>
      </div>

      <div className="flex w-full sm:w-auto gap-2">
        <button
          onClick={() => onAppreciate(post.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            post.isAppreciated
              ? 'bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400'
              : 'border border-gray-300 dark:border-slate-600 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700'
          }`}
        >
          Appreciate
        </button>
        <button
          onClick={() => onRequestService(post.id)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors whitespace-nowrap ${
            post.isRequested
              ? 'bg-blue-700 text-white'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {post.isRequested ? 'Requested' : 'Request Service'}
        </button>
      </div>
    </div>
  );
};

export default PostActions;