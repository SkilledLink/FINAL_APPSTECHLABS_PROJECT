import { apiClient } from './client';
import type { Message, MessageCreate } from '../types/message';

export const messageApi = {
  list: async (conversationId: string, before?: string, limit?: number): Promise<Message[]> => {
    const params: any = {};
    if (before) params.before = before;
    if (limit) params.limit = limit;
    const res = await apiClient.get(`/conversations/${conversationId}/messages`, { params });
    return res.data;
  },

  send: async (conversationId: string, data: MessageCreate): Promise<Message> => {
    const res = await apiClient.post(`/conversations/${conversationId}/messages`, data);
    return res.data;
  },

  markRead: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/messages/read`);
  },
};