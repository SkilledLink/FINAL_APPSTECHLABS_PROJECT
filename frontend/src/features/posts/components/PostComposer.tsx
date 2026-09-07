// src/features/posts/components/PostComposer.tsx
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
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200/80 dark:border-slate-800/80 p-4">
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
          className="flex-1 bg-gray-100/80 dark:bg-slate-700/80 rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
        />
      </div>

      <hr className="border-slate-200/80 dark:border-slate-700/80 mb-3" />

      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <button
            onClick={() => onOpenModal('image')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
            Photo
          </button>

          <button
            onClick={() => onOpenModal('video')}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
            Video
          </button>

          <button className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437 1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008Z" />
            </svg>
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