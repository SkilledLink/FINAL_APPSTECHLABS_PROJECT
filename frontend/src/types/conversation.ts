export type ConversationStatus = 'active' | 'pending' | 'rejected';

export interface ParticipantInfo {
  id: string;
  first_name: string;
  last_name: string;
  profile_image_url?: string | null;
  username?: string | null;
}

export interface Conversation {
  id: string;
  type: string;
  title?: string | null;
  status: ConversationStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message?: any;
  unread_count: number;
  participant?: ParticipantInfo | null;
}

export interface ConversationCreate {
  type?: string;
  title?: string | null;
  participant_ids: string[];
}