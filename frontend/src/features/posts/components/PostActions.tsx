import React from 'react';
import type { Post } from '../types/post.types';

interface PostActionsProps {
  post: Post;
  onLike: (id: string) => void;
  onAppreciate: (id: string) => void;
  onRequestService: (id: string) => void;
}

const PostActions: React.FC<PostActionsProps> = ({ post, onLike, onAppreciate, onRequestService }) => {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-3">
      <div className="flex items-center gap-6">
        <button 
          onClick={() => onLike(post.id)}
          className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors"
        >
          {post.isLiked ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
              <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H7.493ZM7.493 18.5v-4.5" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
            </svg>
          )}
          {post.initialLikes + (post.isLiked ? 1 : 0)}
        </button>

        <button className="flex items-center gap-2 text-sm font-medium hover:text-blue-600 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z" />
          </svg>
          {post.initialComments}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => onAppreciate(post.id)}
          className={`px-4 py-2 rounded-full border text-sm font-semibold transition-colors ${
            post.isAppreciated 
              ? 'bg-blue-50 border-blue-200 text-blue-600' 
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Appreciate
        </button>
        
        <button 
          onClick={() => onRequestService(post.id)}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
            post.isRequested 
              ? 'bg-blue-700 text-white' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {post.isRequested ? 'Requested' : 'Request Service'}
        </button>
      </div>
    </div>
  );
};

export default PostActions;