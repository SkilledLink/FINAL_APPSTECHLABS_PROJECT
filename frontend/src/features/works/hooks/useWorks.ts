import { useState, useEffect, useCallback } from 'react';
import { portfolioApi, Work } from '../../../api/portfolioApi';

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

  const createWork = useCallback(async (data: Parameters<typeof portfolioApi.createWork>[0]) => {
    try {
      const newWork = await portfolioApi.createWork(data);
      setWorks(prev => [newWork, ...prev]);
      return newWork;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create work');
    }
  }, []);

  const updateWork = useCallback(async (workId: string, data: Parameters<typeof portfolioApi.updateWork>[1]) => {
    try {
      const updated = await portfolioApi.updateWork(workId, data);
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
  }, []);

  return { works, loading, error, fetchWorks, createWork, updateWork, deleteWork, uploadImages };
}