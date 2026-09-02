import React from 'react';
import { Post } from '../types/post.types';
import PostActions from './PostActions';

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onAppreciate: (id: string) => void;
  onRequestService: (id: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLike, onAppreciate, onRequestService }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <img src={post.author.avatarUrl} alt={post.author.name} className="w-10 h-10 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-sm">{post.author.name}</h3>
              {post.author.isVerified && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-800">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-xs text-gray-500">{post.author.title} <span className="text-gray-400">• {post.createdAt}</span></p>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </button>
      </div>

      <div className="mb-3">
        <h2 className="text-xl font-bold text-gray-900 mb-1">{post.title}</h2>
        <p className="text-gray-700 text-sm leading-relaxed">{post.content}</p>
        <div className="flex items-center gap-2 mt-2">
          {post.hashtags.map(tag => (
            <span key={tag} className="text-blue-600 text-sm font-medium bg-blue-50 px-2 py-0.5 rounded-full">{tag}</span>
          ))}
        </div>
      </div>

      {post.imageUrl && (
        <div className="w-full mb-3">
          <img src={post.imageUrl} alt={post.title} className="w-full h-auto rounded-lg object-cover" />
        </div>
      )}

      <PostActions 
        post={post}
        onLike={onLike}
        onAppreciate={onAppreciate}
        onRequestService={onRequestService}
      />
    </div>
  );
};

export default PostCard;