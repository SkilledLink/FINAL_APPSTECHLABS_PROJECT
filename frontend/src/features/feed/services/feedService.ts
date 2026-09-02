import type { FeedType, FeedFiltersState, FeedResponse } from '../types/feed.types';
import { MOCK_FEED_ITEMS } from './feed.mock';

// Uses process.env.BASE_API or import.meta.env.VITE_BASE_API depending on build setup
const BASE_API = import.meta.env.BASE_API || '';

export const feedService = {
  async getFeed(type: FeedType, filters?: FeedFiltersState, cursor?: string): Promise<FeedResponse> {
    if (BASE_API) {
      const params = new URLSearchParams({
        type,
        ...(cursor ? { cursor } : {}),
        ...(filters?.category ? { category: filters.category } : {}),
        ...(filters?.location ? { location: filters.location } : {}),
        ...(filters?.sortBy ? { sortBy: filters.sortBy } : {}),
      });

      const response = await fetch(`${BASE_API}/api/feed?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} feed from backend.`);
      }
      return await response.json();
    }

    // Mock Backend Delay & Controlled Response
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockItems = MOCK_FEED_ITEMS[type] || [];
    return {
      items: mockItems,
      nextCursor: undefined,
      hasMore: false,
    };
  },
};