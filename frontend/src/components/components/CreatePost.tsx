import React, { useState } from 'react';
import { Image, Video, MapPin, Smile, Send } from 'lucide-react';

interface CreatePostProps {
  userAvatar?: string;
  onPostSubmit?: (content: string) => void;
}

const DEFAULT_USER_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

const CreatePost: React.FC<CreatePostProps> = ({ 
  userAvatar = DEFAULT_USER_AVATAR, 
  onPostSubmit 
}) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    if (onPostSubmit) {
      onPostSubmit(content);
    }
    setContent('');
  };

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm transition-colors duration-300">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start gap-3">
          <img 
            src={userAvatar} 
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = DEFAULT_USER_AVATAR;
            }}
          />
          <div className="flex-1 min-w-0">
            <input 
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your project update or question..."
              className="w-full bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            
            <div className="flex items-center justify-between gap-2 mt-3 flex-wrap">
              <div className="flex items-center gap-1 sm:gap-2 text-slate-500 dark:text-slate-400">
                <button 
                  type="button" 
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Image className="w-4 h-4 text-emerald-500" />
                  <span className="hidden sm:inline">Photo</span>
                </button>

                <button 
                  type="button" 
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Video className="w-4 h-4 text-rose-500" />
                  <span className="hidden sm:inline">Video</span>
                </button>

                <button 
                  type="button" 
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="hidden sm:inline">Location</span>
                </button>

                <button 
                  type="button" 
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-2.5 py-1.5 rounded-lg transition-colors"
                >
                  <Smile className="w-4 h-4 text-purple-500" />
                  <span className="hidden sm:inline">Feeling</span>
                </button>
              </div>

              <button 
                type="submit"
                disabled={!content.trim()}
                className="ml-auto bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-sm shadow-blue-500/20 active:scale-95 shrink-0"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;