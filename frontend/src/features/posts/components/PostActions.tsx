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
  const baseBtn =
    'group flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold ' +
    'transition-all duration-200 active:scale-[0.97] ' +
    'border border-transparent ' +
    'disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className="flex items-center gap-2 pt-3 border-t border-white/40 dark:border-white/10">
      {/* Like */}
      <button
        onClick={onLike}
        disabled={disabled}
        className={`${baseBtn} ${
          post.is_liked
            ? 'text-rose-500 bg-rose-500/10 border-rose-400/30 dark:bg-rose-500/15 dark:border-rose-500/20'
            : 'text-slate-600 dark:text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 hover:border-rose-400/20 dark:hover:bg-rose-500/10'
        }`}
      >
        <Heart
          className={`w-5 h-5 transition-transform duration-200 group-hover:scale-110 ${
            post.is_liked ? 'fill-rose-500 text-rose-500' : ''
          }`}
        />
        <span>{post.likes_count}</span>
      </button>

      {/* Comment */}
      <button
        onClick={onCommentToggle}
        disabled={disabled}
        className={`${baseBtn} text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:bg-blue-500/10 hover:border-blue-400/20 dark:hover:bg-blue-500/10`}
      >
        <MessageCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
        <span>{post.comments_count}</span>
      </button>

      {/* Share */}
      <button
        onClick={onShare}
        disabled={disabled}
        className={`${baseBtn} text-slate-600 dark:text-slate-300 hover:text-emerald-500 hover:bg-emerald-500/10 hover:border-emerald-400/20 dark:hover:bg-emerald-500/10`}
      >
        <Share2 className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
        <span>Share</span>
      </button>
    </div>
  );
};

export default PostActions;