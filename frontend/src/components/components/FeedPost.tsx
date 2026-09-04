import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, CheckCircle, MapPin } from 'lucide-react';
import type { Post } from '../features/posts/types/post.types';

interface FeedPostProps {
  post: Post;
}

const FeedPost: React.FC<FeedPostProps> = ({ post }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked ?? false);
  const [likesCount, setLikesCount] = useState(post.initialLikes ?? 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 overflow-hidden shadow-sm transition-colors duration-300">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <img 
            src={post.author.avatarUrl} 
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-semibold text-slate-900 dark:text-white text-sm">
                {post.author.name}
              </p>
              {post.author.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {post.author.title} • {post.createdAt}
            </p>
          </div>
        </div>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Post Image */}
      {post.imageUrl && (
        <div className="relative">
          <img 
            src={post.imageUrl} 
            alt={post.title || "Post image"}
            className="w-full max-h-96 object-cover"
          />
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        {post.title && (
          <h4 className="font-semibold text-slate-900 dark:text-white text-base mb-1">
            {post.title}
          </h4>
        )}

        <p className="text-slate-700 dark:text-slate-300 text-sm mb-2 leading-relaxed">
          {post.content}
        </p>

        {post.location && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mb-3">
            <MapPin className="w-3 h-3" />
            <span>{post.location}</span>
          </div>
        )}

        {post.hashtags && post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.hashtags.map((tag, index) => (
              <span key={index} className="text-blue-600 dark:text-blue-400 text-xs hover:underline cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Post Actions */}
        <div className="flex items-center gap-6 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <button 
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-sm transition-colors ${
              isLiked ? 'text-red-500' : 'text-slate-600 dark:text-slate-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500' : ''}`} />
            <span className="font-medium">{likesCount}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">{post.initialComments}</span>
          </button>
          <button className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedPost;