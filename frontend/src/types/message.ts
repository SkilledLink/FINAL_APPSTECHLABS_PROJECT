export interface MessageCreate {
  client_message_id: string;
  type: 'text' | 'voice' | 'image' | 'file' | 'system';
  content?: string | null;
  attachment_path?: string | null;
  duration_seconds?: number | null;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  client_message_id: string;
  type: string;
  content?: string | null;
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_size?: number | null;
  duration_seconds?: number | null;
  created_at: string;
  edited_at?: string | null;
  deleted_at?: string | null;
}

// src/types/message.types.ts
export interface MessageUser {
  id: string;
  first_name: string;
  last_name: string;
  name?: string; // computed or from backend
  avatar: string;
  role?: string;
  isOnline: boolean;
  lastSeen?: string;
}