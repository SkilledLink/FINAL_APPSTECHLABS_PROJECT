// src/components/feed/PostCard.tsx
import React, { useEffect, useRef, useState } from 'react';
import type { Post } from '../posts/types/post.types';
import PostActions from './PostActions';
import ShareModal from './ShareModal';

// ... (AutoPlayVideo component with dark adjustments if needed)

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onAppreciate, onRequestService }) => {
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{post.author.name}</h3>
                {post.author.isVerified && (
                  <svg ... className="w-4 h-4 text-gray-800 dark:text-gray-200" />
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-slate-400">
                {post.author.title} <span className="text-gray-400 dark:text-slate-500">• {post.createdAt}</span>
              </p>
            </div>
          </div>
          <button className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300">
            <svg ... className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mb-3">
          {post.title && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{post.title}</h2>
          )}
          <p className="text-gray-700 dark:text-slate-300 text-sm leading-relaxed">{post.content}</p>

          {post.location && (
            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-slate-400">
              <svg ... className="w-3.5 h-3.5" />
              {post.location}
            </div>
          )}

          <div className="flex items-center gap-2 mt-2">
            {post.hashtags.map(tag => (
              <span key={tag} className="text-blue-600 dark:text-blue-400 text-sm font-medium bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Media */}
        {post.imageUrl && (
          <div className="w-full mb-3">
            {post.mediaType === 'video' ? (
              <AutoPlayVideo src={post.imageUrl} poster={post.thumbnailUrl} onClick={() => setIsMediaOpen(true)} />
            ) : (
              <div className="cursor-pointer" onClick={() => setIsMediaOpen(true)}>
                <img src={post.imageUrl} alt={post.title} className="w-full h-auto rounded-lg object-cover" />
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <PostActions
          post={post}
          onLike={onLike}
          onAppreciate={onAppreciate}
          onRequestService={onRequestService}
          onShare={() => setIsShareModalOpen(true)}
        />
      </div>

      {/* Lightbox – already uses dark background */}
      {isMediaOpen && ( ... )}

      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={post}
      />
    </>
  );
};

export default PostCard;