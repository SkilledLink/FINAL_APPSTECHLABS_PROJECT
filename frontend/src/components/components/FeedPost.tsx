// components/FeedPost.tsx
import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import type { Post } from "../../types/home";

interface FeedPostProps {
  post: Post;
}

const FeedPost: React.FC<FeedPostProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likes);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img
            src={post.avatar}
            alt={post.author}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-semibold text-gray-900 text-sm">{post.author}</p>
            <p className="text-xs text-gray-500">{post.createdAt}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Image */}
      {post.image && (
        <div className="relative">
          <img
            src={post.image}
            alt="Post image"
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-800 text-sm mb-2">{post.description}</p>
        {post.hashtags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.map((tag, index) => (
              <span
                key={index}
                className="text-blue-600 text-xs hover:underline cursor-pointer"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? "fill-red-500" : ""}`} />
            <span className="font-medium">{likesCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedPost;
