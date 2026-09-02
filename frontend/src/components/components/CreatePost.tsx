// components/CreatePost.tsx
import React from 'react';
import { Image, Video, MapPin, Smile } from 'lucide-react';

const CreatePost: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-start gap-3">
        <img 
          src="https://i.pravatar.cc/150?img=1" 
          alt="User avatar"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <input 
            type="text"
            placeholder="Share your project update or question..."
            className="w-full bg-gray-50 border-0 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <div className="flex items-center gap-4 mt-3 text-gray-500">
            <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors">
              <Image className="w-4 h-4" />
              Photo
            </button>
            <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors">
              <Video className="w-4 h-4" />
              Video
            </button>
            <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors">
              <MapPin className="w-4 h-4" />
              Location
            </button>
            <button className="flex items-center gap-1.5 text-sm hover:text-blue-600 transition-colors">
              <Smile className="w-4 h-4" />
              Feeling
            </button>
            <button className="ml-auto bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors">
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;