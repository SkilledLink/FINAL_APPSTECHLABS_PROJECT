// src/api/conversations.ts
import { apiClient } from '../../../api/client';
import type { Conversation, ConversationCreate } from '../types/message.types';

export const conversationsApi = {
  list: (): Promise<Conversation[]> => apiClient.get('/conversations').then(res => res.data),
  create: (data: ConversationCreate): Promise<Conversation> =>
    apiClient.post('/conversations', data).then(res => res.data),
};
