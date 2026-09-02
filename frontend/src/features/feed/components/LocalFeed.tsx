import React from "react";
import type { FeedFiltersState } from "../types/feed.types";
import { useInfiniteFeed } from "../hooks/useInfiniteFeed";
import { FeedList } from "./FeedList";

interface LocalFeedProps {
  filters?: FeedFiltersState;
}

export const LocalFeed: React.FC<LocalFeedProps> = ({ filters }) => {
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useInfiniteFeed({
    type: "local",
    filters,
  });

  return (
    <FeedList
      items={items}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      emptyMessage="No activity found in your local area."
    />
  );
};