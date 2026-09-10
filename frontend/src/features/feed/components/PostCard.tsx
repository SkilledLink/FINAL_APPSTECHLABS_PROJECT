import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, MoreHorizontal, Trash2 } from 'lucide-react';
import PostActions from './PostActions';
import type { Feed } from '../types/feed.types';

interface PostCardProps {
  feed: Feed;
  onLike: (id: string) => void;
  onDelete?: (id: string) => void;
  onComment?: (feedId: string, content: string) => void;
  onDeleteComment?: (feedId: string, commentId: string) => void;
  onHashtagClick?: (hashtag: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  feed,
  onLike,
  onDelete,
  onComment,
  onDeleteComment,
  onHashtagClick,
}) => {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const user = feed.user;
  const displayName = user
    ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User'
    : 'Unknown';
  const avatarUrl = user?.profile_image_url || '/default-avatar.png';

  const primaryMedia = feed.media?.[0];

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Now';
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return new Date(dateStr).toLocaleDateString();
  };

  const handleCommentSubmit = () => {
    if (!commentText.trim()) return;
    onComment?.(feed.id, commentText.trim());
    setCommentText('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 mb-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                {displayName}
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {user?.account_type || 'User'}
              <span className="text-gray-400 dark:text-slate-500"> • {timeAgo(feed.created_at)}</span>
            </p>
          </div>
        </div>

        {onDelete && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 p-1"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-8 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg z-10 min-w-[140px]">
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(feed.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3">
        {feed.title && feed.title !== feed.description && (
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            {feed.title}
          </h2>
        )}
        <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
          {feed.description}
        </p>

        {/* Hashtags */}
        {feed.hashtags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {feed.hashtags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => onHashtagClick?.(tag.name)}
                className="text-blue-600 dark:text-blue-400 text-xs font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                #{tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Media */}
      {primaryMedia && (
        <div className="w-full mb-3">
          {primaryMedia.media_type === 'video' ? (
            <video
              src={primaryMedia.media_url}
              controls
              className="w-full max-h-96 rounded-lg object-cover"
            />
          ) : (
            <div
              className="cursor-pointer"
              onClick={() => setIsMediaOpen(true)}
            >
              <img
                src={primaryMedia.media_url}
                alt={feed.title}
                className="w-full max-h-96 rounded-lg object-cover hover:opacity-95 transition"
              />
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <PostActions
        feed={feed}
        onLike={() => onLike(feed.id)}
        onCommentToggle={() => setShowComments(!showComments)}
      />

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          {/* Comment Input */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit()}
              className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-slate-700 rounded-full outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            <button
              onClick={handleCommentSubmit}
              disabled={!commentText.trim()}
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-full disabled:opacity-40"
            >
              Send
            </button>
          </div>

          {/* Comments List */}
          {feed.comments?.map((comment) => (
            <div key={comment.id} className="flex gap-2 mb-2">
              <img
                src={comment.user?.profile_image_url || '/default-avatar.png'}
                alt=""
                className="w-7 h-7 rounded-full"
              />
              <div className="flex-1 bg-gray-50 dark:bg-slate-700/50 rounded-2xl px-3 py-2">
                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                  {comment.user?.first_name} {comment.user?.last_name}
                </p>
                <p className="text-sm text-gray-700 dark:text-slate-300">
                  {comment.content}
                </p>
              </div>
              {onDeleteComment && (
                <button
                  onClick={() => onDeleteComment(feed.id, comment.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Image Lightbox */}
      {isMediaOpen && primaryMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsMediaOpen(false)}
        >
          <img
            src={primaryMedia.media_url}
            alt=""
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </motion.div>
  );
};

export default PostCard;