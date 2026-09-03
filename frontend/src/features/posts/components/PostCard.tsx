import React from 'react';
import type { Post } from '../types/post.types';
import PostActions from './PostActions';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onAppreciate: (id: string) => void;
  onRequestService: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onRequestService,
}) => {
  return (
    <div className="w-full max-w-full overflow-hidden bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <img
            src={post.author.avatarUrl}
            alt={post.author.name}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 object-cover"
          />

          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">
                {post.author.name}
              </h3>

              {post.author.isVerified && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4 text-gray-800 flex-shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <p className="text-xs text-gray-500 truncate">
              {post.author.title}{' '}
              <span className="text-gray-400">• {post.createdAt}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-gray-400 hover:text-gray-600 flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="mb-3 min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 break-words">
          {post.title}
        </h2>

        <p className="text-gray-700 text-sm leading-relaxed break-words whitespace-pre-wrap">
          {post.content}
        </p>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2">
          {post.hashtags.map(tag => (
            <span
              key={tag}
              className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-0.5 rounded-full max-w-full break-words"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Image */}
      {post.imageUrl && (
        <div className="w-full mb-3 overflow-hidden rounded-lg">
          <img
            src={post.imageUrl}
            alt={post.title}
            className="block w-full h-auto max-w-full rounded-lg object-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="w-full min-w-0">
        <PostActions
          post={post}
          onLike={onLike}
          onRequestService={onRequestService}
        />
      </div>
    </div>
  );
};

export default PostCard;