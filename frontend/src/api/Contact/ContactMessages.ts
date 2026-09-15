
import { apiClient } from '../client';

export interface ContactMessageCreate {
  name: string;
  email: string;
  message: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  message: string;
  is_read: boolean;
  replied: boolean;
  admin_reply: string | null;
  created_at: string;
  replied_at: string | null;
}

export interface ContactMessageReply {
  reply: string;
}

/**
 * Public contact form submission.
 *
 * This endpoint can be used by both logged-in and
 * non-logged-in visitors.
 */
export const createContactMessage = async (
  data: ContactMessageCreate
): Promise<ContactMessage> => {
  const response = await apiClient.post<ContactMessage>(
    '/contact-messages',
    data
  );

  return response.data;
};

/**
 * Admin: get all contact messages.
 */
export const getContactMessages = async (): Promise<ContactMessage[]> => {
  const response = await apiClient.get<ContactMessage[]>(
    '/contact-messages'
  );

  return response.data;
};

/**
 * Admin: get one contact message.
 */
export const getContactMessage = async (
  messageId: number
): Promise<ContactMessage> => {
  const response = await apiClient.get<ContactMessage>(
    `/contact-messages/${messageId}`
  );

  return response.data;
};

/**
 * Admin: mark a contact message as read.
 */
export const markContactMessageAsRead = async (
  messageId: number
): Promise<ContactMessage> => {
  const response = await apiClient.patch<ContactMessage>(
    `/contact-messages/${messageId}/read`
  );

  return response.data;
};

/**
 * Admin: reply to a contact message.
 */
export const replyToContactMessage = async (
  messageId: number,
  reply: string
): Promise<ContactMessage> => {
  const response = await apiClient.post<ContactMessage>(
    `/contact-messages/${messageId}/reply`,
    { reply }
  );

  return response.data;
};

