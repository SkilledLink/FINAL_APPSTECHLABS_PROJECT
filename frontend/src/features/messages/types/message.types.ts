// src/types/index.ts
export interface User {
  id: string;
  email: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message?: Message;
  unread_count: number;
  participant?: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  client_message_id: string;
  type: 'text' | 'voice' | 'image' | 'file' | 'system';
  content?: string;
  attachment_path?: string;
  attachment_name?: string;
  attachment_size?: number;
  duration_seconds?: number;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  // Frontend-only status (optimistic)
  status?: 'sending' | 'sent' | 'failed';
}

export interface MessageCreate {
  client_message_id: string; // UUID v4
  type: 'text' | 'voice';
  content?: string;
  attachment_path?: string;
  duration_seconds?: number;
}

export interface ConversationCreate {
  type: 'direct' | 'group';
  title?: string;
  participant_ids: string[];
}

export interface UploadUrlResponse {
  upload_url: string;
  path: string;
  public_url?: string;
}

export interface UploadUrlRequest {
  file_name: string;
  content_type: string;
  duration_seconds?: number;
}
