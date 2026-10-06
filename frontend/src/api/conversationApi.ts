// src/api/conversationApi.ts
import { apiClient } from './client';
import type {
  Conversation,
  ConversationCreate,
  ConversationStatus,
} from '../types/conversation';

const mapParticipant = (participant: any) => {
  if (!participant) return undefined;
  return {
    id: participant.id,
    first_name: participant.first_name || '',
    last_name: participant.last_name || '',
    name:
      `${participant.first_name || ''} ${participant.last_name || ''}`.trim() ||
      'User',
    avatar: participant.profile_image_url || '',
    role:
      participant.account_type === 'professional' ? 'Professional' : 'User',
    isOnline: participant.is_online || false,
    lastSeen: participant.last_seen || undefined,
  };
};

const mapConversation = (conv: any): Conversation => ({
  ...conv,
  status: (conv.status as ConversationStatus) || 'active',
  participant: mapParticipant(conv.participant),
});

export const conversationApi = {
  list: async (): Promise<Conversation[]> => {
    const res = await apiClient.get('/conversations');
    return res.data.map(mapConversation);
  },

  /** GET /conversations/requests — pending requests sent TO the current user. */
  listRequests: async (): Promise<Conversation[]> => {
    const res = await apiClient.get('/conversations/requests');
    return res.data.map(mapConversation);
  },

  create: async (data: ConversationCreate): Promise<Conversation> => {
    const res = await apiClient.post('/conversations', data);
    return mapConversation(res.data);
  },

  getOrCreateDirect: async (userId: string): Promise<Conversation> => {
    const res = await apiClient.post('/conversations/direct', {
      user_id: userId,
    });
    return mapConversation(res.data);
  },

  acceptRequest: async (conversationId: string): Promise<Conversation> => {
    const res = await apiClient.post(
      `/conversations/${conversationId}/accept`
    );
    return mapConversation(res.data);
  },

  rejectRequest: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/reject`);
  },
};