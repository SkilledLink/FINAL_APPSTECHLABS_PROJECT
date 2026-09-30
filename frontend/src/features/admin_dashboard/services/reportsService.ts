// src/features/admin/services/reportsService.ts
import { api } from '../api/api';
import type {
  AdminReport,
  ReportAction,
  ReportReason,
  ReportReviewPayload,
  ReportStatus,
  ReportTargetType,
} from '../types/admin.types';

const mapReport = (r: any): AdminReport => ({
  id: r.id,
  reporterId: r.reporter_id,
  targetId: r.target_id,
  targetType: r.target_type as ReportTargetType,
  reason: r.reason as ReportReason,
  description: r.description ?? undefined,
  status: r.status as ReportStatus,
  actionTaken: (r.action_taken ?? 'none') as ReportAction,
  reviewNotes: r.review_notes ?? undefined,
  reviewedBy: r.reviewed_by ?? undefined,
  reviewedAt: r.reviewed_at ?? undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
});

export interface ReportFilters {
  status?: ReportStatus;
  targetType?: ReportTargetType;
}

export interface ReportsPage {
  items: AdminReport[];
  total: number;
}

export const reportsService = {
  /**
   * Fetch a single page of reports. When no filters are passed, the backend
   * returns every report (pending → resolved), which lets the tab compute
   * per-status counts client-side.
   */
  async getPage(
    skip: number,
    limit: number,
    filters: ReportFilters = {},
  ): Promise<ReportsPage> {
    const params: Record<string, unknown> = { skip, limit };
    if (filters.status) params.status = filters.status;
    if (filters.targetType) params.target_type = filters.targetType;

    const { data } = await api.get('/reports', { params });
    return {
      items: (data.items ?? []).map(mapReport),
      total: data.total ?? 0,
    };
  },

  async getAll(limit = 500): Promise<AdminReport[]> {
    const { items } = await this.getPage(0, limit);
    return items;
  },

  async getOne(id: string): Promise<AdminReport> {
    const { data } = await api.get(`/reports/${id}`);
    return mapReport(data);
  },

  async review(id: string, payload: ReportReviewPayload): Promise<AdminReport> {
    const { data } = await api.patch(`/reports/${id}/review`, payload);
    return mapReport(data);
  },

  async withdraw(id: string): Promise<void> {
    await api.delete(`/reports/${id}`);
  },
};