// src/features/profile/components/ProfileMediaTab.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageOff } from 'lucide-react';
import { useUserMedia } from '../hooks/useUserMedia';
import { MediaGrid } from './MediaGrid';
import { MediaLightbox } from './MediaLightbox';
import type { FeedThumbnail } from '../types/profile.types';

interface ProfileMediaTabProps {
  userId: string;
  isOwnProfile: boolean;
}

export const ProfileMediaTab: React.FC<ProfileMediaTabProps> = ({
  userId,
  isOwnProfile,
}) => {
  const navigate = useNavigate();
  const [selectedItem, setSelectedItem] = useState<FeedThumbnail | null>(null);

  const {
    items,
    status,
    error,
    hasMore,
    isLoadingMore,
    loadMore,
    refetch,
  } = useUserMedia(userId);

  const handleCardClick = (item: FeedThumbnail) => {
    setSelectedItem(item);
  };

  const handleViewPost = (feedId: string) => {
    setSelectedItem(null);
    navigate(`/feeds/${feedId}`);
  };

  const emptyState = (
    <div className="flex flex-col items-center justify-center
                    py-16 text-center">
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
        <ImageOff className="h-6 w-6 text-slate-400 dark:text-slate-500" />
      </div>
      <h3 className="mt-4 text-base font-semibold
                     text-slate-900 dark:text-slate-100">
        No media posts yet
      </h3>
      {isOwnProfile && (
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Share your first photo or video to see it here.
        </p>
      )}
    </div>
  );

  return (
    <>
      <MediaGrid
        items={items}
        status={status}
        error={error}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={loadMore}
        onCardClick={handleCardClick}
        onRetry={refetch}
        emptyState={emptyState}
      />

      <MediaLightbox
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onViewPost={handleViewPost}
      />
    </>
  );
};