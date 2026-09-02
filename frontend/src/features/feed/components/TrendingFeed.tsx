import React from "react";
import type { FeedFiltersState } from "../types/feed.types";
import { useInfiniteFeed } from "../hooks/useInfiniteFeed";
import { FeedList } from "./FeedList";

interface TrendingFeedProps {
  filters?: FeedFiltersState;
}

export const TrendingFeed: React.FC<TrendingFeedProps> = ({ filters }) => {
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useInfiniteFeed({
    type: "trending",
    filters,
  });

  return (
    <FeedList
      items={items}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      emptyMessage="No trending posts right now. Check back later!"
    />
  );
};