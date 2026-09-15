import { useEffect, useState, useCallback } from 'react';
import { moderationService } from '../services/moderationService';
import type { ModerationQueueItem } from '../types/admin.types';

export const useModeration = () => {
  const [items, setItems] = useState<ModerationQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setItems(await moderationService.getQueue());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load moderation queue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const approve = useCallback(async (recordId: string, reason: string) => {
    await moderationService.approve(recordId, reason);
    setItems((prev) => prev.filter((i) => i.recordId !== recordId));
  }, []);

  const reject = useCallback(async (recordId: string, reason: string) => {
    await moderationService.reject(recordId, reason);
    setItems((prev) => prev.filter((i) => i.recordId !== recordId));
  }, []);

  return { items, loading, error, refetch: load, approve, reject };
};