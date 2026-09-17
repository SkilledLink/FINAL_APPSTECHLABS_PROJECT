// src/api/conversations.ts
import { apiClient } from '../../../api/client';

export interface BackendConversation {
  id: string;
  type: string;
  title?: string | null;
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
  // GET /conversations
  list: async (): Promise<BackendConversation[]> => {
    const { data } = await apiClient.get<BackendConversation[]>('/conversations');
    return data;
  },

  // GET /conversations/:id
  get: async (id: string): Promise<BackendConversation> => {
    const { data } = await apiClient.get<BackendConversation>(`/conversations/${id}`);
    return data;
  },

  // POST /conversations
  create: async (payload: {
    participant_ids: string[];
    title?: string;
    type?: string;
  }): Promise<BackendConversation> => {
    const { data } = await apiClient.post<BackendConversation>('/conversations', payload);
    return data;
  },

  // POST /conversations/direct   ← this is what was missing
  getOrCreateDirect: async (userId: string): Promise<BackendConversation> => {
    const { data } = await apiClient.post<BackendConversation>('/conversations/direct', {
      user_id: userId,
    });
    return data;
  },
};