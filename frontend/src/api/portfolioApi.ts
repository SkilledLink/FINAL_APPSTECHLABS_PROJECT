import { apiClient } from './client';
import type {
  Portfolio,
  Work,
  Service,
  Availability,
  Category,
  PublicPortfolio,
  Specialty,
} from '../types/portfolio';

// Re-export types for convenience
export type {
  Portfolio,
  Work,
  Service,
  Availability,
  Category,
  PublicPortfolio,
  Specialty,
};

export const portfolioApi = {
  create: async (data: {
    headline?: string;
    bio?: string;
    years_experience?: number;
    business_name?: string;
    business_description?: string;
    service_area?: string;
    phone?: string;
    is_public?: boolean;
    specialty_ids: string[];
  }): Promise<Portfolio> => {
    const res = await apiClient.post('/professionals/portfolio', data);
    return res.data;
  },

  getMy: async (): Promise<Portfolio> => {
    const res = await apiClient.get('/professionals/portfolio');
    return res.data;
  },

  update: async (data: Partial<Omit<Portfolio, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { specialty_ids?: string[] }): Promise<Portfolio> => {
    const res = await apiClient.put('/professionals/portfolio', data);
    return res.data;
  },

  delete: async (): Promise<void> => {
    await apiClient.delete('/professionals/portfolio');
  },

  // Works
  createWork: async (data: {
    title: string;
    description?: string;
    service_category?: string;
    location?: string;
    completed_at?: string;
    duration_value?: number;
    duration_unit?: string;
    team_size?: number;
    client_type?: string;
  }): Promise<Work> => {
    const res = await apiClient.post('/professionals/portfolio/works', data);
    return res.data;
  },

  getWorks: async (): Promise<Work[]> => {
    const res = await apiClient.get('/professionals/portfolio/works');
    return res.data;
  },

  getWork: async (workId: string): Promise<Work> => {
    const res = await apiClient.get(`/professionals/portfolio/works/${workId}`);
    return res.data;
  },

  updateWork: async (workId: string, data: Partial<Omit<Work, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>): Promise<Work> => {
    const res = await apiClient.put(`/professionals/portfolio/works/${workId}`, data);
    return res.data;
  },

  deleteWork: async (workId: string): Promise<void> => {
    await apiClient.delete(`/professionals/portfolio/works/${workId}`);
  },

  uploadWorkImages: async (workId: string, before?: File, after?: File): Promise<Work> => {
    const formData = new FormData();
    if (before) formData.append('before', before);
    if (after) formData.append('after', after);
    const res = await apiClient.post(`/professionals/portfolio/works/${workId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  // Services
  createService: async (data: {
    title: string;
    description?: string;
    category?: string;
    starting_price?: number;
    pricing_type?: string;
    estimated_duration?: string;
    service_area?: string;
    is_active?: boolean;
    is_emergency_service?: boolean;
  }): Promise<Service> => {
    const res = await apiClient.post('/professionals/portfolio/services', data);
    return res.data;
  },

  getServices: async (): Promise<Service[]> => {
    const res = await apiClient.get('/professionals/portfolio/services');
    return res.data;
  },

  updateService: async (serviceId: string, data: Partial<Omit<Service, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
    const res = await apiClient.put(`/professionals/portfolio/services/${serviceId}`, data);
    return res.data;
  },

  deleteService: async (serviceId: string): Promise<void> => {
    await apiClient.delete(`/professionals/portfolio/services/${serviceId}`);
  },

  // Availability
  setAvailability: async (availabilities: {
    day_of_week: string;
    start_time?: string | null;
    end_time?: string | null;
    is_available?: boolean;
  }[]): Promise<Availability[]> => {
    const res = await apiClient.put('/professionals/portfolio/availability', availabilities);
    return res.data;
  },

  getAvailability: async (): Promise<Availability[]> => {
    const res = await apiClient.get('/professionals/portfolio/availability');
    return res.data;
  },

  // Public
  getPublicPortfolio: async (userId: string): Promise<PublicPortfolio> => {
    const res = await apiClient.get(`/professionals/${userId}/portfolio`);
    return res.data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/professionals/categories');
    return res.data;
  },
};