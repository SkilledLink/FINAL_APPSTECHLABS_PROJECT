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

// Helper: Extracts clean array data regardless of API response wrapping
function extractArrayData<T>(responsePayload: any): T[] {
  if (!responsePayload) return [];
  if (Array.isArray(responsePayload)) {
    return responsePayload.filter((item): item is T => item !== null && item !== undefined);
  }
  // Handle nested keys like { data: [...] } or { services: [...] }
  if (Array.isArray(responsePayload.data)) {
    return responsePayload.data.filter((item): item is T => item !== null && item !== undefined);
  }
  if (Array.isArray(responsePayload.services)) {
    return responsePayload.services.filter((item): item is T => item !== null && item !== undefined);
  }
  if (Array.isArray(responsePayload.works)) {
    return responsePayload.works.filter((item): item is T => item !== null && item !== undefined);
  }
  return [];
}

// Helper: Safely unwraps nested object payloads like { data: { ... } }
function extractObjectData<T>(responsePayload: any): T {
  if (responsePayload && typeof responsePayload === 'object' && 'data' in responsePayload && responsePayload.data) {
    return responsePayload.data as T;
  }
  return responsePayload as T;
}

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
    return extractObjectData<Portfolio>(res.data);
  },

  getMy: async (): Promise<Portfolio> => {
    const res = await apiClient.get('/professionals/portfolio');
    return extractObjectData<Portfolio>(res.data);
  },

  update: async (data: Partial<Omit<Portfolio, 'id' | 'user_id' | 'created_at' | 'updated_at'>> & { specialty_ids?: string[] }): Promise<Portfolio> => {
    const res = await apiClient.put('/professionals/portfolio', data);
    return extractObjectData<Portfolio>(res.data);
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
    return extractObjectData<Work>(res.data);
  },

  getWorks: async (): Promise<Work[]> => {
    const res = await apiClient.get('/professionals/portfolio/works');
    return extractArrayData<Work>(res.data);
  },

  getWork: async (workId: string): Promise<Work> => {
    const res = await apiClient.get(`/professionals/portfolio/works/${workId}`);
    return extractObjectData<Work>(res.data);
  },

  updateWork: async (workId: string, data: Partial<Omit<Work, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>): Promise<Work> => {
    const res = await apiClient.put(`/professionals/portfolio/works/${workId}`, data);
    return extractObjectData<Work>(res.data);
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
    return extractObjectData<Work>(res.data);
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
    return extractObjectData<Service>(res.data);
  },

  getServices: async (): Promise<Service[]> => {
    const res = await apiClient.get('/professionals/portfolio/services');
    return extractArrayData<Service>(res.data);
  },

  updateService: async (serviceId: string, data: Partial<Omit<Service, 'id' | 'portfolio_id' | 'created_at' | 'updated_at'>>): Promise<Service> => {
    const res = await apiClient.put(`/professionals/portfolio/services/${serviceId}`, data);
    return extractObjectData<Service>(res.data);
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
    return extractArrayData<Availability>(res.data);
  },

  getAvailability: async (): Promise<Availability[]> => {
    const res = await apiClient.get('/professionals/portfolio/availability');
    return extractArrayData<Availability>(res.data);
  },

  // Public
  getPublicPortfolio: async (userId: string): Promise<PublicPortfolio> => {
    const res = await apiClient.get(`/professionals/${userId}/portfolio`);
    const data = extractObjectData<PublicPortfolio>(res.data);
    
    // Safely normalize embedded services & works arrays inside public portfolio objects
    if (data) {
      data.services = extractArrayData<Service>(data.services);
      data.works = extractArrayData<Work>(data.works);
    }
    return data;
  },

  // Categories
  getCategories: async (): Promise<Category[]> => {
    const res = await apiClient.get('/professionals/categories');
    return extractArrayData<Category>(res.data);
  },
};