import React from 'react';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import type { Feed } from '../types/feed.types';

interface PostActionsProps {
  feed: Feed;
  onLike: () => void;
  onCommentToggle: () => void;
  onShare?: () => void;
}

const PostActions: React.FC<PostActionsProps> = ({
  feed,
  onLike,
  onCommentToggle,
  onShare,
}) => {
  return (
    <div className="flex items-center gap-6 border-t border-gray-100 dark:border-slate-700 pt-3">
      <button
        onClick={onLike}
        className="flex items-center gap-2 text-sm font-medium transition-colors text-gray-600 dark:text-slate-300 hover:text-red-500"
      >
        <Heart
          className={`w-5 h-5 ${
            feed.is_liked ? 'fill-red-500 text-red-500' : ''
          }`}
        />
        {feed.likes_count}
      </button>

      <button
        onClick={onCommentToggle}
        className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        {feed.comments_count}
      </button>

      {onShare && (
        <button
          onClick={onShare}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-500 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          Share
        </button>
      )}
    </div>
  );
};

export default PostActions;