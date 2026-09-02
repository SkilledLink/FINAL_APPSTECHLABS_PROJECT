export interface MessageUser {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
  lastSeen?: string;
}

export interface AudioNote {
  url: string;
  duration: string;
  waveform: number[];
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  type: 'text' | 'audio';
  text?: string;
  audioDetails?: AudioNote;
  createdAt: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participant: MessageUser;
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
}