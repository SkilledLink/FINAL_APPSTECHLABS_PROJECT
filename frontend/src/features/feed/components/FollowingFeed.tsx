import React from "react";
import type { FeedFiltersState } from "../types/feed.types";
import { useInfiniteFeed } from "../hooks/useInfiniteFeed";
import { FeedList } from "./FeedList";

interface FollowingFeedProps {
  filters?: FeedFiltersState;
}

export const FollowingFeed: React.FC<FollowingFeedProps> = ({ filters }) => {
  const { items, isLoading, isLoadingMore, hasMore, loadMore } = useInfiniteFeed({
    type: "following",
    filters,
  });

  return (
    <FeedList
      items={items}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={loadMore}
      emptyMessage="You aren't following anyone yet or they haven't posted anything."
    />
  );
};