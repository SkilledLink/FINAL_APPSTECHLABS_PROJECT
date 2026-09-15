import { useEffect, useState, useCallback } from 'react';
import { feedsService } from '../services/feedsService';
import type { AdminFeed, FeedStatus } from '../types/moderator.types';

export const useFeeds = () => {
  const [feeds, setFeeds] = useState<AdminFeed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setFeeds(await feedsService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load feeds'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const updateStatus = useCallback(async (id: string, status: FeedStatus) => {
    await feedsService.updateStatus(id, status);
    setFeeds((prev) => prev.map((f) => (f.id === id ? { ...f, status } : f)));
  }, []);

  return { feeds, loading, error, refetch: load, updateStatus };
};