// src/api/conversationApi.ts
import { apiClient } from './client';
import type { Conversation, ConversationCreate } from '../types/conversation';

// Helper to map backend participant to frontend MessageUser
const mapParticipant = (participant: any) => {
  if (!participant) return undefined;
  return {
    id: participant.id,
    first_name: participant.first_name || '',
    last_name: participant.last_name || '',
    name: `${participant.first_name || ''} ${participant.last_name || ''}`.trim() || 'User',
    avatar: participant.profile_image_url || '',
    role: participant.account_type === 'professional' ? 'Professional' : 'User',
    isOnline: participant.is_online || false,
    lastSeen: participant.last_seen || undefined,
  };
};

export const conversationApi = {
  list: async (): Promise<Conversation[]> => {
    const res = await apiClient.get('/conversations');
    // Map each conversation's participant
    return res.data.map((conv: any) => ({
      ...conv,
      participant: mapParticipant(conv.participant),
    }));
  },

  create: async (data: ConversationCreate): Promise<Conversation> => {
    const res = await apiClient.post('/conversations', data);
    const conv = res.data;
    return {
      ...conv,
      participant: mapParticipant(conv.participant),
    };
  },

  getOrCreateDirect: async (userId: string): Promise<Conversation> => {
    const res = await apiClient.post('/conversations/direct', { user_id: userId });
    const conv = res.data;
    return {
      ...conv,
      participant: mapParticipant(conv.participant),
    };
  },
};