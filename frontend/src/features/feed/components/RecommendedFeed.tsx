import React from "react";
import type { FeedFiltersState } from "../types/feed.types";
import { useInfiniteFeed } from "../hooks/useInfiniteFeed";
import { FeedList } from "./FeedList";

interface RecommendedFeedProps {
  filters?: FeedFiltersState;
}

export const RecommendedFeed: React.FC<RecommendedFeedProps> = ({ filters }) => {
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useInfiniteFeed({
    type: "recommended",
    filters,
  });

  return (
    <FeedList
      items={items}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      emptyMessage="No recommended posts available right now."
    />
  );
};