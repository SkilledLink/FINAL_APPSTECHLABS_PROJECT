import { useState, useEffect, useCallback } from 'react';
import type{ portfolioApi, Service } from '../api/portfolioApi';

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await portfolioApi.getServices();
      setServices(data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load services');
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data: Parameters<typeof portfolioApi.createService>[0]) => {
    try {
      const newService = await portfolioApi.createService(data);
      setServices(prev => [newService, ...prev]);
      return newService;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to create service');
    }
  }, []);

  const updateService = useCallback(async (serviceId: string, data: Parameters<typeof portfolioApi.updateService>[1]) => {
    try {
      const updated = await portfolioApi.updateService(serviceId, data);
      setServices(prev => prev.map(s => s.id === serviceId ? updated : s));
      return updated;
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to update service');
    }
  }, []);

  const deleteService = useCallback(async (serviceId: string) => {
    try {
      await portfolioApi.deleteService(serviceId);
      setServices(prev => prev.filter(s => s.id !== serviceId));
    } catch (err: any) {
      throw new Error(err.response?.data?.detail || 'Failed to delete service');
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, []);

  return { services, loading, error, fetchServices, createService, updateService, deleteService };
}