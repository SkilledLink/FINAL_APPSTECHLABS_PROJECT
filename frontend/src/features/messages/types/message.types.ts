export type ConversationStatus = 'active' | 'pending' | 'rejected';

export interface MessageUser {
  id: string;
  name: string;
  avatar?: string;
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
  size: string;
  type: string;
  icon: string;
  extension: string;
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
  isRead?: boolean;
  audioDetails?: AudioDetails;
  fileDetails?: FileDetails;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  /** active = normal chat; pending = direct request awaiting acceptance */
  status?: ConversationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  lastMessage?: Message;
  unreadCount: number;
  participant?: MessageUser | null;
  /** Convenience flag set by the hook when the current user is the recipient of a pending request. */
  isIncomingRequest?: boolean;
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