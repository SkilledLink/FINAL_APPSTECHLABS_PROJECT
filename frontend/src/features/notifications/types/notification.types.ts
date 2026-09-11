import type { LucideIcon } from 'lucide-react';

export type NotificationType =
  | 'follower'
  | 'job_alert'
  | 'message'
  | 'local_job';

export type NotificationFilter = 'all' | 'unread';

export interface NotificationAction {
  label: string;
  variant: 'primary' | 'secondary';
}

export interface NotificationItemData {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO string
  read: boolean;
  avatarUrl?: string;
  actorName?: string;
  actorRole?: string;
  actions: NotificationAction[];
}

export interface NotificationTypeConfig {
  icon: LucideIcon;
  accent: string; // tailwind classes for icon bg
  iconColor: string; // tailwind text color
  dotColor: string; // tailwind bg color for the unread dot
  label: string;
}
