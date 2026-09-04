// src/api/messages.ts
import { apiClient } from '../../../api/client';
import type { Message, MessageCreate } from '../types/message.types';

export const messagesApi = {
  get: (conversationId: string, before?: string, limit = 50): Promise<Message[]> =>
    apiClient
      .get(`/conversations/${conversationId}/messages`, {
        params: { before, limit },
      })
      .then((res) => res.data),
  send: (conversationId: string, data: MessageCreate): Promise<Message> =>
    apiClient
      .post(`/conversations/${conversationId}/messages`, data)
      .then((res) => res.data),
  markRead: (conversationId: string): Promise<void> =>
    apiClient.post(`/conversations/${conversationId}/read`),
};