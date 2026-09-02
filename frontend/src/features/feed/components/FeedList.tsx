import React from "react";
import type { FeedItemData } from "../types/feed.types";
import { FeedItem } from "./FeedItem";
import { FeedSkeleton } from "./FeedSkeleton";

interface FeedListProps {
  items: FeedItemData[];
  isLoading: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  emptyMessage?: string;
}

export const FeedList: React.FC<FeedListProps> = ({
  items,
  isLoading,
  isLoadingMore,
  emptyMessage = "No content available at the moment."
}) => {
  if (isLoading) {
    return (
      <div>
        <FeedSkeleton />
        <FeedSkeleton />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm">
        <p className="text-gray-500 text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <FeedItem key={item.id} item={item} />
      ))}
      {isLoadingMore && (
        <>
          <FeedSkeleton />
        </>
      )}
    </div>
  );
};