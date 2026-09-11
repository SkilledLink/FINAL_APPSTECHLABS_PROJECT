import type { NotificationItemData, NotificationType, NotificationTypeConfig } from '../types/notification.types';
import {
  UserPlus,
  Briefcase,
  MessageSquare,
  MapPin,
} from 'lucide-react';

const typeConfig: Record<NotificationType, NotificationTypeConfig> = {
  follower: {
    icon: UserPlus,
    accent: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    dotColor: 'bg-blue-500',
    label: 'Follower',
  },
  job_alert: {
    icon: Briefcase,
    accent: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    dotColor: 'bg-amber-500',
    label: 'Job Alert',
  },
  message: {
    icon: MessageSquare,
    accent: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
    dotColor: 'bg-violet-500',
    label: 'Message',
  },
  local_job: {
    icon: MapPin,
    accent: 'bg-rose-100 dark:bg-rose-900/40',
    iconColor: 'text-rose-600 dark:text-rose-400',
    dotColor: 'bg-rose-500',
    label: 'Local Job',
  },
};

export function getNotificationTypeConfig(type: NotificationType): NotificationTypeConfig {
  return typeConfig[type];
}

const mockNotifications: NotificationItemData[] = [
  {
    id: 'n1',
    type: 'follower',
    title: 'Jane Doe started following you',
    message: 'Jane Doe is now following your professional updates.',
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    read: false,
    actorName: 'Jane Doe',
    actorRole: 'Product Designer at Flowbase',
    actions: [{ label: 'Follow Back', variant: 'primary' }],
  },
  {
    id: 'n2',
    type: 'job_alert',
    title: 'New Job Alert: Senior React Developer',
    message: 'A new role matching your profile was just posted. Salary range: $120k–$160k.',
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    read: false,
    actions: [{ label: 'View Job', variant: 'primary' }],
  },
  {
    id: 'n3',
    type: 'message',
    title: 'Alex sent you a message',
    message: "Hey, are you free for a call this afternoon to discuss the project timeline?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
    actorName: 'Alex Rivera',
    actorRole: 'Project Manager',
    actions: [{ label: 'Reply', variant: 'primary' }],
  },
  {
    id: 'n4',
    type: 'local_job',
    title: '3 new jobs posted near you',
    message: '3 new jobs posted within 5 miles of your location (Douala).',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    read: false,
    actions: [{ label: 'Browse Jobs', variant: 'primary' }],
  },
  {
    id: 'n5',
    type: 'follower',
    title: 'Marie Tchoumi started following you',
    message: 'Marie Tchoumi is now following your professional updates.',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    read: true,
    actorName: 'Marie Tchoumi',
    actorRole: 'UX Researcher',
    actions: [{ label: 'Follow Back', variant: 'primary' }],
  },
  {
    id: 'n6',
    type: 'job_alert',
    title: 'New Job Alert: Frontend Lead',
    message: 'A Frontend Lead role matching 90% of your skills was posted.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actions: [{ label: 'View Job', variant: 'primary' }],
  },
  {
    id: 'n7',
    type: 'message',
    title: 'Sarah sent you a message',
    message: "Thanks for connecting! I'd love to learn more about your recent project.",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actorName: 'Sarah Mbongo',
    actorRole: 'HR Manager at TechLabs',
    actions: [{ label: 'Reply', variant: 'primary' }],
  },
  {
    id: 'n8',
    type: 'local_job',
    title: '5 new jobs posted near you',
    message: '5 new jobs posted within 10 miles of your location (Douala).',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    read: true,
    actions: [{ label: 'Browse Jobs', variant: 'primary' }],
  },
];

export async function fetchNotifications(): Promise<NotificationItemData[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return structuredClone(mockNotifications);
}
