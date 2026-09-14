import { apiClient } from '../../../api/client';
import type {
  Availability,
  AvailabilityInput,
  Category,
  Portfolio,
  PortfolioCreateInput,
  PortfolioUpdateInput,
  PublicPortfolio,
  Service,
  ServiceCreateInput,
  ServiceUpdateInput,
  Work,
  WorkCreateInput,
  WorkUpdateInput,
} from '../types/portfolio.types';

function toMessage(err: any, fallback: string): string {
  const detail = err?.response?.data?.detail ?? err?.response?.data?.message;
  if (!detail) return err?.message || fallback;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg ?? JSON.stringify(d)).join(', ');
  }
  return JSON.stringify(detail);
}

const BASE = '/professionals/portfolio';

export const portfolioService = {
  /* ── Portfolio ───────────────────────────────────── */

  async getMine(): Promise<Portfolio | null> {
    try {
      const { data } = await apiClient.get<Portfolio | null>(BASE);
      return data;
    } catch (err: any) {
      if (err?.response?.status === 404) return null;
      throw new Error(toMessage(err, 'Failed to load portfolio'));
    }
  },

  async create(input: PortfolioCreateInput): Promise<Portfolio> {
    try {
      const { data } = await apiClient.post<Portfolio>(BASE, input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to create portfolio'));
    }
  },

  async update(input: PortfolioUpdateInput): Promise<Portfolio> {
    try {
      const { data } = await apiClient.put<Portfolio>(BASE, input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to update portfolio'));
    }
  },

  async remove(): Promise<void> {
    try {
      await apiClient.delete(BASE);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete portfolio'));
    }
  },

  async getPublic(userId: string): Promise<PublicPortfolio> {
    try {
      const { data } = await apiClient.get<PublicPortfolio>(
        `/professionals/${userId}/portfolio`
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load portfolio'));
    }
  },

  /* ── Services ────────────────────────────────────── */

  async listServices(): Promise<Service[]> {
    try {
      const { data } = await apiClient.get<Service[]>(`${BASE}/services`);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load services'));
    }
  },

  async createService(input: ServiceCreateInput): Promise<Service> {
    try {
      const { data } = await apiClient.post<Service>(`${BASE}/services`, input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to create service'));
    }
  },

  async updateService(id: string, input: ServiceUpdateInput): Promise<Service> {
    try {
      const { data } = await apiClient.put<Service>(`${BASE}/services/${id}`, input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to update service'));
    }
  },

  async deleteService(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE}/services/${id}`);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete service'));
    }
  },

  /* ── Works ───────────────────────────────────────── */

  async listWorks(): Promise<Work[]> {
    try {
      const { data } = await apiClient.get<Work[]>(`${BASE}/works`);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load works'));
    }
  },

  async createWork(input: WorkCreateInput): Promise<Work> {
    try {
      const { data } = await apiClient.post<Work>(`${BASE}/works`, input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to create work'));
    }
  },

  async updateWork(id: string, input: WorkUpdateInput): Promise<Work> {
    try {
      const { data } = await apiClient.put<Work>(`${BASE}/works/${id}`, input);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to update work'));
    }
  },

  async deleteWork(id: string): Promise<void> {
    try {
      await apiClient.delete(`${BASE}/works/${id}`);
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to delete work'));
    }
  },

  async uploadWorkImages(
    workId: string,
    files: { before?: File; after?: File }
  ): Promise<Work> {
    try {
      const form = new FormData();
      if (files.before) form.append('before', files.before);
      if (files.after) form.append('after', files.after);
      const { data } = await apiClient.post<Work>(
        `${BASE}/works/${workId}/images`,
        form,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to upload images'));
    }
  },

  /* ── Availability ────────────────────────────────── */

  async getAvailability(): Promise<Availability[]> {
    try {
      const { data } = await apiClient.get<Availability[]>(`${BASE}/availability`);
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load availability'));
    }
  },

  async setAvailability(items: AvailabilityInput[]): Promise<Availability[]> {
    try {
      const { data } = await apiClient.put<Availability[]>(
        `${BASE}/availability`,
        items
      );
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to save availability'));
    }
  },

  /* ── Categories ──────────────────────────────────── */

  async listCategories(): Promise<Category[]> {
    try {
      const { data } = await apiClient.get<Category[]>('/professionals/categories');
      return data;
    } catch (err) {
      throw new Error(toMessage(err, 'Failed to load categories'));
    }
  },
};