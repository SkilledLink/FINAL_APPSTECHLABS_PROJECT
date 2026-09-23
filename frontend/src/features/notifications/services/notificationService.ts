// src/features/notifications/services/notificationService.ts

import {
  AlertCircle,
  AlertTriangle,
  BadgeCheck,
  CheckCircle2,
  Clock,
  CreditCard,
  Flag,
  Heart,
  Mail,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Reply,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react';

import { apiClient } from '../../../api/client';
import type {
  NotificationCategoryConfig,
  NotificationDTO,
  NotificationListResponse,
  NotificationNamespace,
} from '../types/notification.types';

const BASE = '/users/me/notifications';

/* ═══════════════════════════════════════════════════════════
 * API CALLS
 * ═══════════════════════════════════════════════════════════ */

export async function listNotifications(params: {
  unread_only?: boolean;
  skip?: number;
  limit?: number;
} = {}): Promise<NotificationListResponse> {
  const res = await apiClient.get<NotificationListResponse>(BASE, { params });
  return res.data;
}

export async function getUnreadCount(): Promise<number> {
  const res = await apiClient.get<{ unread: number }>(`${BASE}/unread-count`);
  return res.data.unread;
}

export async function getSummary(): Promise<Record<string, number>> {
  const res = await apiClient.get<{ counts: Record<string, number> }>(
    `${BASE}/summary`,
  );
  return res.data.counts;
}

export async function getOne(id: string): Promise<NotificationDTO> {
  const res = await apiClient.get<NotificationDTO>(`${BASE}/${id}`);
  return res.data;
}

export async function markRead(id: string): Promise<NotificationDTO> {
  const res = await apiClient.post<NotificationDTO>(`${BASE}/${id}/read`);
  return res.data;
}

export async function markUnread(id: string): Promise<NotificationDTO> {
  const res = await apiClient.post<NotificationDTO>(`${BASE}/${id}/unread`);
  return res.data;
}

export async function bulkMarkRead(ids: string[]): Promise<number> {
  const res = await apiClient.post<{ marked_read: number }>(
    `${BASE}/read`,
    { ids },
  );
  return res.data.marked_read;
}

export async function markAllRead(): Promise<number> {
  const res = await apiClient.post<{ marked_read: number }>(
    `${BASE}/read-all`,
  );
  return res.data.marked_read;
}

export async function deleteOne(id: string): Promise<void> {
  await apiClient.delete(`${BASE}/${id}`);
}

export async function clearRead(): Promise<number> {
  const res = await apiClient.delete<{ deleted: number }>(BASE);
  return res.data.deleted;
}

export async function createTest(payload: {
  title?: string;
  body?: string;
  type?: string;
} = {}): Promise<NotificationDTO> {
  const res = await apiClient.post<NotificationDTO>(`${BASE}/test`, payload);
  return res.data;
}

/* ═══════════════════════════════════════════════════════════
 * NAMESPACE RESOLUTION
 * ═══════════════════════════════════════════════════════════ */

const DOTLESS_MAP: Record<string, NotificationNamespace> = {
  contact_message: 'admin',
  post_rejected: 'post',
  post_pending_review: 'post',
};

export function getNamespace(type: string): NotificationNamespace {
  if (!type) return 'system';
  const direct = DOTLESS_MAP[type];
  if (direct) return direct;
  const dot = type.indexOf('.');
  if (dot === -1) return 'system';
  const prefix = type.slice(0, dot) as NotificationNamespace;
  return NAMESPACE_CONFIG[prefix] ? prefix : 'system';
}

/* ═══════════════════════════════════════════════════════════
 * CATEGORY CONFIG
 * ═══════════════════════════════════════════════════════════ */

export const NAMESPACE_CONFIG: Record<
  NotificationNamespace,
  NotificationCategoryConfig
> = {
  social: {
    label: 'Social',
    icon: MessageCircle,
    accent: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  verification: {
    label: 'Verification',
    icon: BadgeCheck,
    accent: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  payment: {
    label: 'Payments',
    icon: CreditCard,
    accent: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },
  review: {
    label: 'Reviews',
    icon: Star,
    accent: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  moderation: {
    label: 'Moderation',
    icon: ShieldAlert,
    accent: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  post: {
    label: 'Posts',
    icon: MessageSquare,
    accent: 'bg-purple-500/10',
    iconColor: 'text-purple-500',
  },
  admin: {
    label: 'Admin',
    icon: Mail,
    accent: 'bg-slate-500/10',
    iconColor: 'text-slate-500',
  },
  system: {
    label: 'System',
    icon: Megaphone,
    accent: 'bg-slate-500/10',
    iconColor: 'text-slate-500',
  },
};

const TYPE_OVERRIDES: Record<string, Partial<NotificationCategoryConfig>> = {
  'social.message': { icon: MessageCircle },
  'social.like': {
    icon: Heart,
    accent: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  'social.follow': { icon: UserPlus },
  'social.comment': { icon: MessageSquare },
  'social.reply': { icon: Reply },

  'verification.approved': {
    icon: BadgeCheck,
    accent: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  'verification.rejected': {
    icon: XCircle,
    accent: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  'verification.manual_review': {
    icon: Clock,
    accent: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  'verification.expired': {
    icon: AlertCircle,
    accent: 'bg-slate-500/10',
    iconColor: 'text-slate-500',
  },
  'verification.failed': {
    icon: AlertTriangle,
    accent: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },

  'payment.succeeded': {
    icon: CheckCircle2,
    accent: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  'payment.failed': {
    icon: XCircle,
    accent: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  'payment.refunded': {
    icon: CreditCard,
    accent: 'bg-indigo-500/10',
    iconColor: 'text-indigo-500',
  },

  'review.received': { icon: Star },

  'moderation.professional_suspended': { icon: ShieldAlert },
  'moderation.professional_reactivated': {
    icon: ShieldCheck,
    accent: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
  'moderation.professional_flagged': {
    icon: Flag,
    accent: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },
  'moderation.professional_unflagged': { icon: ShieldCheck },
  'moderation.professional_deleted': {
    icon: Trash2,
    accent: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },

  post_rejected: {
    icon: XCircle,
    accent: 'bg-rose-500/10',
    iconColor: 'text-rose-500',
  },
  post_pending_review: {
    icon: Clock,
    accent: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
  },

  'system.announcement': { icon: Megaphone },
  'test.notification': { icon: Sparkles },
};

export function getNotificationTypeConfig(
  type: string,
): NotificationCategoryConfig {
  const ns = getNamespace(type);
  const base = NAMESPACE_CONFIG[ns];
  const override = TYPE_OVERRIDES[type];
  return override ? { ...base, ...override } : base;
}

export const SIDEBAR_NAMESPACES: NotificationNamespace[] = [
  'social',
  'verification',
  'payment',
  'review',
  'moderation',
  'post',
  'admin',
  'system',
];