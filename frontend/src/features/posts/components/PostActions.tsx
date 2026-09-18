// src/features/posts/components/PostActions.tsx

import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { Post } from '../types/post.types';

interface PostActionsProps {
  post: Post;
  onLike: () => void;
  onCommentToggle: () => void;
  onShare?: () => void;
  disabled?: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({
  post,
  onLike,
  onCommentToggle,
  onShare,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-6 border-t border-slate-100 dark:border-slate-800 pt-3">
      {/* Like */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="flex items-center gap-2 text-sm font-medium transition-colors text-slate-600 dark:text-slate-300 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Heart
          className={`w-5 h-5 ${
            post.is_liked ? 'fill-red-500 text-red-500' : ''
          }`}
        />
        {post.likes_count}
      </button>

      {/* Comment */}
      <button
        onClick={onCommentToggle}
        disabled={disabled}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <MessageCircle className="w-5 h-5" />
        {post.comments_count}
      </button>

      {/* Share */}
      <button
        onClick={onShare}
        disabled={disabled}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Share2 className="w-5 h-5" />
        Share
      </button>
    </div>
  );
};

export default PostActions;