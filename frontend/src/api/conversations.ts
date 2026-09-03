// src/api/conversations.ts
import { apiClient } from './client';
import type { Conversation, ConversationCreate } from '../features/messages/types';

export const conversationsApi = {
  list: async (): Promise<Conversation[]> => {
    const res = await apiClient.get('/conversations');
    return res.data;
  },
  create: async (data: ConversationCreate): Promise<Conversation> => {
    const res = await apiClient.post('/conversations', data);
    return res.data;
  },
};
