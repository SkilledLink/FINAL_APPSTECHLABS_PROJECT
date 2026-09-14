import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { Feed } from '../types/feed.types';

interface PostActionsProps {
  feed: Feed;
  onLike: () => void;
  onCommentToggle: () => void;
  onShare?: () => void;
  disabled?: boolean;
}

const PostActions: React.FC<PostActionsProps> = ({
  feed,
  onLike,
  onCommentToggle,
  onShare,
  disabled = false,
}) => {
  const base = 'flex items-center gap-2 text-sm font-medium transition-colors';
  const enabled = 'text-gray-600 dark:text-slate-300 hover:text-red-500';
  const enabledBlue =
    'text-gray-600 dark:text-slate-300 hover:text-blue-500';
  const disabledCls =
    'text-gray-400 dark:text-slate-500 cursor-not-allowed opacity-60';

  return (
    <div className="flex items-center gap-6 border-t border-gray-100 dark:border-slate-700 pt-3">
      <button
        onClick={disabled ? undefined : onLike}
        disabled={disabled}
        className={`${base} ${disabled ? disabledCls : enabled}`}
      >
        <Heart
          className={`w-5 h-5 ${
            feed.is_liked && !disabled ? 'fill-red-500 text-red-500' : ''
          }`}
        />
        {feed.likes_count}
      </button>

      <button
        onClick={disabled ? undefined : onCommentToggle}
        disabled={disabled}
        className={`${base} ${disabled ? disabledCls : enabledBlue}`}
      >
        <MessageCircle className="w-5 h-5" />
        {feed.comments_count}
      </button>

      {onShare && (
        <button
          onClick={disabled ? undefined : onShare}
          disabled={disabled}
          className={`${base} ${disabled ? disabledCls : enabledBlue}`}
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      )}
    </div>
  );
};

export default PostActions;