// src/components/feed/PostComposer.tsx
import React, { useState } from 'react';

interface PostComposerProps {
  onPost: (data: {
    title: string;
    content: string;
    hashtags: string[];
    mediaUrl?: string;
    mediaType?: 'image' | 'video';
    thumbnailUrl?: string;
    location?: string;
  }) => void;
  onOpenModal: (type: 'image' | 'video') => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ onPost, onOpenModal }) => {
  const [content, setContent] = useState('');

  const handleDirectPost = () => {
    if (content.trim()) {
      onPost({
        title: '',
        content: content.trim(),
        hashtags: [],
        location: 'Austin, TX',
      });
      setContent('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-start gap-3 mb-3">
        <img
          src="https://i.pravatar.cc/150?img=12"
          alt="User"
          className="w-10 h-10 rounded-full"
        />
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && content.trim() && handleDirectPost()}
          placeholder="What are you working on?"
          className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <hr className="border-gray-100 dark:border-slate-700 mb-3" />

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => onOpenModal('image')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg ... className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Photo
          </button>
          <button
            onClick={() => onOpenModal('video')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg ... className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Video
          </button>
          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
            <svg ... className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Project
          </button>
        </div>

        <button
          onClick={handleDirectPost}
          disabled={!content.trim()}
          className="bg-blue-600 text-white text-sm font-semibold px-6 py-2 rounded-full hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default PostComposer;