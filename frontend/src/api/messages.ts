// src/api/messages.ts
import { apiClient } from './client';
import type { Message, MessageCreate } from '../features/messages/types';

export const messagesApi = {
  get: async (conversationId: string, before?: string, limit = 50): Promise<Message[]> => {
    const params = new URLSearchParams();
    if (before) params.append('before', before);
    params.append('limit', String(limit));
    const res = await apiClient.get(`/conversations/${conversationId}/messages?${params}`);
    return res.data;
  },
  send: async (conversationId: string, data: MessageCreate): Promise<Message> => {
    const res = await apiClient.post(`/conversations/${conversationId}/messages`, data);
    return res.data;
  },
  markRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/read`);
  },
};
