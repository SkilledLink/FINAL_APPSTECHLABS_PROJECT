// src/api/conversations.ts
import { apiClient } from '../../../api/client';

export type BackendConversationStatus = 'active' | 'pending' | 'rejected';

export interface BackendConversation {
  id: string;
  type: string;
  title?: string | null;
  status?: BackendConversationStatus;
  created_by?: string;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  participant?: any;
  last_message?: any;
}

export interface BackendMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  client_message_id?: string;
  type: 'text' | 'voice' | 'file' | 'image';
  content?: string | null;
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  attachment_type?: string | null;
  duration_seconds?: number | null;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
}

export const conversationsApi = {
  /** GET /conversations — active conversations only. */
  list: async (): Promise<BackendConversation[]> => {
    const { data } = await apiClient.get<BackendConversation[]>(
      '/conversations'
    );
    return data;
  },

  /** GET /conversations/requests — pending requests sent TO me. */
  listRequests: async (): Promise<BackendConversation[]> => {
    const { data } = await apiClient.get<BackendConversation[]>(
      '/conversations/requests'
    );
    return data;
  },

  /** GET /conversations/sent-requests — pending requests I SENT. */
  listSentRequests: async (): Promise<BackendConversation[]> => {
    const { data } = await apiClient.get<BackendConversation[]>(
      '/conversations/sent-requests'
    );
    return data;
  },

  /** GET /conversations/:id */
  get: async (id: string): Promise<BackendConversation> => {
    const { data } = await apiClient.get<BackendConversation>(
      `/conversations/${id}`
    );
    return data;
  },

  /** POST /conversations — generic (group) create. */
  create: async (payload: {
    participant_ids: string[];
    title?: string;
    type?: string;
  }): Promise<BackendConversation> => {
    const { data } = await apiClient.post<BackendConversation>(
      '/conversations',
      payload
    );
    return data;
  },

  /** POST /conversations/direct — send request / return active. */
  getOrCreateDirect: async (
    userId: string
  ): Promise<BackendConversation> => {
    const { data } = await apiClient.post<BackendConversation>(
      '/conversations/direct',
      { user_id: userId }
    );
    return data;
  },

  /** POST /conversations/:id/accept */
  acceptRequest: async (
    conversationId: string
  ): Promise<BackendConversation> => {
    const { data } = await apiClient.post<BackendConversation>(
      `/conversations/${conversationId}/accept`
    );
    return data;
  },

  /** POST /conversations/:id/reject */
  rejectRequest: async (conversationId: string): Promise<void> => {
    await apiClient.post(`/conversations/${conversationId}/reject`);
  },
};