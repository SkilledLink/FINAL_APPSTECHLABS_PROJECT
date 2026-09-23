// src/features/notifications/types/notification.types.ts

import type { ComponentType } from 'react';

/* ═══════════════════════════════════════════════════════════
 * BACKEND DTOs — mirror the API response exactly, no renames.
 * ═══════════════════════════════════════════════════════════ */

export interface NotificationDTO {
  id: string;
  type: string;
  title: string;
  body: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListResponse {
  items: NotificationDTO[];
  total: number;
  page: number;
  size: number;
  unread_count: number;
}

/* ═══════════════════════════════════════════════════════════
 * FRONTEND-ONLY TYPES
 * ═══════════════════════════════════════════════════════════ */

export type NotificationNamespace =
  | 'social'
  | 'verification'
  | 'payment'
  | 'review'
  | 'moderation'
  | 'post'
  | 'admin'
  | 'system';

export type NotificationFilter = 'all' | 'unread';

export interface NotificationCategoryConfig {
  label: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  accent: string;
  iconColor: string;
}