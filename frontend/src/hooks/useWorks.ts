import { useState, useEffect, useCallback } from 'react';
import { portfolioApi } from '../api/portfolioApi';
import type { Work } from '../types/portfolio';

export function useWorks() {
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.getWorks();
      setWorks(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load works');
    } finally {
      setLoading(false);
    }
  }, []);

  const createWork = useCallback(async (data: any, files?: { before?: File; after?: File }) => {
    try {
      // 1. Create work
      const newWork = await portfolioApi.createWork(data);
      // 2. Upload images if any
      if (files?.before || files?.after) {
        await portfolioApi.uploadWorkImages(newWork.id, files?.before, files?.after);
        // Refresh to get updated work with image URLs
        const updated = await portfolioApi.getWork(newWork.id);
        setWorks(prev => [updated, ...prev]);
        return updated;
      }
      setWorks(prev => [newWork, ...prev]);
      return newWork;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create work');
    }
  }, []);

  const updateWork = useCallback(async (workId: string, data: any, files?: { before?: File; after?: File }) => {
    try {
      // 1. Update work data
      const updated = await portfolioApi.updateWork(workId, data);
      // 2. Upload images if any
      if (files?.before || files?.after) {
        await portfolioApi.uploadWorkImages(workId, files?.before, files?.after);
        const refreshed = await portfolioApi.getWork(workId);
        setWorks(prev => prev.map(w => w.id === workId ? refreshed : w));
        return refreshed;
      }
      setWorks(prev => prev.map(w => w.id === workId ? updated : w));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update work');
    }
  }, []);

  const deleteWork = useCallback(async (workId: string) => {
    try {
      await portfolioApi.deleteWork(workId);
      setWorks(prev => prev.filter(w => w.id !== workId));
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete work');
    }
  }, []);

  const uploadImages = useCallback(async (workId: string, before?: File, after?: File) => {
    try {
      const updated = await portfolioApi.uploadWorkImages(workId, before, after);
      setWorks(prev => prev.map(w => w.id === workId ? updated : w));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to upload images');
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  return { works, loading, error, fetchWorks, createWork, updateWork, deleteWork, uploadImages };
}