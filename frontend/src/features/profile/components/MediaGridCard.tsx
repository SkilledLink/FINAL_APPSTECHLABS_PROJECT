// src/features/profile/components/MediaGridCard.tsx

import React from 'react';
import { Play, Layers } from 'lucide-react';

interface MediaGridCardProps {
  thumbnailUrl: string;
  title: string;
  mediaType: 'image' | 'video';
  mediaCount: number;
  onClick: () => void;
}

export const MediaGridCard: React.FC<MediaGridCardProps> = ({
  thumbnailUrl,
  title,
  mediaType,
  mediaCount,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={title}
      className="relative aspect-square overflow-hidden rounded-xl
                 bg-slate-100 dark:bg-slate-800
                 group focus:outline-none focus:ring-2
                 focus:ring-blue-500/50"
    >
      <img
        src={thumbnailUrl}
        alt={title}
        loading="lazy"
        className="h-full w-full object-cover
                   transition-transform duration-300
                   group-hover:scale-105"
      />

      {mediaCount > 1 && (
        <div className="absolute top-2 left-2 rounded-md
                        bg-black/60 px-1.5 py-0.5
                        backdrop-blur-sm">
          <span className="flex items-center gap-1 text-[10px]
                           font-semibold text-white">
            <Layers className="h-3 w-3" />
            {mediaCount}
          </span>
        </div>
      )}

      {mediaType === 'video' && (
        <div className="absolute top-2 right-2 rounded-full
                        bg-black/60 p-1.5 backdrop-blur-sm">
          <Play className="h-3.5 w-3.5 fill-white text-white" />
        </div>
      )}

      <div className="absolute inset-0 bg-black/0
                      transition-colors group-hover:bg-black/10" />
    </button>
  );
};