// src/types/message.types.ts
export interface MessageUser {
  id: string;
  name: string;
  avatar: string;
  role?: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface AudioDetails {
  url: string;
  duration: string;
  waveform: number[];
}

export interface FileDetails {
  name: string;
  size: string;        // human-readable
  type: string;        // MIME type
  icon: string;        // icon name
  extension: string;   // file extension
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  client_message_id: string;
  type: 'text' | 'audio' | 'voice' | 'image' | 'file' | 'system';
  content?: string;
  text?: string;
  attachment_path?: string;
  attachment_name?: string;
  attachment_size?: number;
  attachment_type?: string;
  duration_seconds?: number;
  created_at: string;
  edited_at?: string;
  deleted_at?: string;
  status?: 'sending' | 'sent' | 'failed';
  audioDetails?: AudioDetails;
  fileDetails?: FileDetails;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  lastMessage?: Message;
  unreadCount: number;
  participant?: MessageUser;
}

export interface MessageCreate {
  client_message_id: string;
  type: 'text' | 'voice' | 'file' | 'image';
  content?: string;
  attachment_path?: string;
  duration_seconds?: number;
  attachment_name?: string;
  attachment_type?: string;
  attachment_size?: number;
}

export interface UploadUrlRequest {
  file_name: string;
  content_type: string;
  duration_seconds?: number;
  file_size?: number;
}

export interface UploadUrlResponse {
  upload_url: string;
  path: string;
  public_url?: string;
}