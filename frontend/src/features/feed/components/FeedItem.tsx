import React from "react";
import type { FeedItemData } from "../types/feed.types";
import { feedService } from "../services/feedService";

interface FeedItemProps {
  item: FeedItemData;
}

export const FeedItem: React.FC<FeedItemProps> = ({ item }) => {
  const handleLike = async () => {
    try {
      await feedService.likePost(item.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRequestService = async () => {
    try {
      await feedService.requestService(item.id);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <article className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <img
            src={item.author.avatar || "https://res.cloudinary.com/vo8xndxy/image/upload/v1787224662/samples/zoom.avif"}
            alt={item.author.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{item.author.name}</h3>
            <p className="text-xs text-gray-500">
              {item.author.title} • {item.createdAt}
            </p>
          </div>
        </div>
        <button aria-label="More options" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {item.title && <h2 className="font-bold text-gray-900 text-base mb-1">{item.title}</h2>}
      <p className="text-gray-700 text-sm mb-3 leading-relaxed">{item.content}</p>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.map((tag, idx) => (
            <span key={idx} className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              #{tag}
            </span>
          ))}
          {item.author.isVerified && (
            <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              ✓ Verified
            </span>
          )}
        </div>
      )}

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-100">
          <img
            src={item.images[0].url || "https://res.cloudinary.com/vo8xndxy/image/upload/v1787224662/samples/zoom.avif"}
            alt={item.images[0].alt || "Post attachment"}
            className="w-full h-auto object-cover max-h-[400px]"
          />
        </div>
      )}

      {/* Engagement Stats */}
      <div className="flex items-center justify-between text-xs text-gray-500 py-2 border-b border-gray-100 mb-3">
        <div className="flex items-center space-x-1">
          <span>👍</span>
          <span>{item.likesCount}</span>
        </div>
        <div>
          <span>{item.commentsCount} comments</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleLike}
          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <span>👍</span>
          <span>Appreciate</span>
        </button>
        <button
          onClick={handleRequestService}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Request Service
        </button>
      </div>
    </article>
  );
};