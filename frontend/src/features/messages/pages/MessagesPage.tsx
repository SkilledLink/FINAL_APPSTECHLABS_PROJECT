import React, { useState } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import type { Conversation, Message } from '../types/message.types';

const MOCK_CURRENT_USER_ID = 'u_me';

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c_1',
    participant: {
      id: 'u_1',
      name: 'Sarah Jenkins',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'Master Carpenter',
      isOnline: true,
    },
    lastMessage: {
      id: 'm_102',
      conversationId: 'c_1',
      senderId: 'u_1',
      type: 'audio',
      createdAt: '10:42 AM',
      isRead: false,
    },
    unreadCount: 1,
    updatedAt: '10:42 AM',
  },
  {
    id: 'c_2',
    participant: {
      id: 'u_2',
      name: 'David Vance',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Licensed Electrician',
      isOnline: false,
      lastSeen: '2h ago',
    },
    lastMessage: {
      id: 'm_201',
      conversationId: 'c_2',
      senderId: MOCK_CURRENT_USER_ID,
      type: 'text',
      text: 'Sounds good, let me know when the estimate is ready.',
      createdAt: 'Yesterday',
      isRead: true,
    },
    unreadCount: 0,
    updatedAt: 'Yesterday',
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c_1: [
    {
      id: 'm_100',
      conversationId: 'c_1',
      senderId: MOCK_CURRENT_USER_ID,
      type: 'text',
      text: 'Hi Sarah! I saw your recent custom cabinet portfolio. Are you free for a project review?',
      createdAt: '10:30 AM',
      isRead: true,
    },
    {
      id: 'm_101',
      conversationId: 'c_1',
      senderId: 'u_1',
      type: 'text',
      text: 'Hello! Thanks for reaching out. Yes, I have an opening starting Thursday.',
      createdAt: '10:35 AM',
      isRead: true,
    },
    {
      id: 'm_102',
      conversationId: 'c_1',
      senderId: 'u_1',
      type: 'audio',
      audioDetails: {
        url: '',
        duration: '0:24',
        waveform: [
          30, 55, 80, 40, 90, 65, 35, 75, 100, 45, 60, 85, 50, 70, 30,
        ],
      },
      createdAt: '10:42 AM',
      isRead: false,
    },
  ],
  c_2: [
    {
      id: 'm_200',
      conversationId: 'c_2',
      senderId: 'u_2',
      type: 'text',
      text: 'Hey! I checked the wiring specs for your workshop upgrade.',
      createdAt: 'Yesterday',
      isRead: true,
    },
    {
      id: 'm_201',
      conversationId: 'c_2',
      senderId: MOCK_CURRENT_USER_ID,
      type: 'text',
      text: 'Sounds good, let me know when the estimate is ready.',
      createdAt: 'Yesterday',
      isRead: true,
    },
  ],
};

export const MessagesPage: React.FC = () => {
  const [conversations, setConversations] =
    useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >('c_1');
  const [messages, setMessages] =
    useState<Record<string, Message[]>>(MOCK_MESSAGES);

  const activeConversation =
    conversations.find((c) => c.id === activeConversationId) || null;

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);

    // Auto mark conversation as read when opened
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === id ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  const updateConversationState = (
    conversationId: string,
    lastMsg: Message
  ) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
              ...c,
              lastMessage: lastMsg,
              updatedAt: lastMsg.createdAt,
            }
          : c
      )
    );
  };

  const handleSendMessage = (text: string) => {
    if (!activeConversationId) return;

    const newMessage: Message = {
      id: `m_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: MOCK_CURRENT_USER_ID,
      type: 'text',
      text,
      createdAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [
        ...(prev[activeConversationId] || []),
        newMessage,
      ],
    }));

    updateConversationState(activeConversationId, newMessage);
  };

  const handleSendVoiceNote = (duration: string) => {
    if (!activeConversationId) return;

    const newVoiceNote: Message = {
      id: `m_audio_${Date.now()}`,
      conversationId: activeConversationId,
      senderId: MOCK_CURRENT_USER_ID,
      type: 'audio',
      audioDetails: {
        url: '',
        duration,
        waveform: Array.from({ length: 15 }, () =>
          Math.floor(Math.random() * 75 + 25)
        ),
      },
      createdAt: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      isRead: false,
    };

    setMessages((prev) => ({
      ...prev,
      [activeConversationId]: [
        ...(prev[activeConversationId] || []),
        newVoiceNote,
      ],
    }));

    updateConversationState(activeConversationId, newVoiceNote);
  };

  const handleReplyMessage = (message: Message) => {
    if (message.text) {
      handleSendMessage(`> Replying to: "${message.text.slice(0, 40)}..."\n\n`);
    }
  };

  const handleReactMessage = (messageId: string, emoji: string) => {
    if (!activeConversationId) return;

    setMessages((prev) => {
      const currentList = prev[activeConversationId] || [];
      return {
        ...prev,
        [activeConversationId]: currentList.map((msg) =>
          msg.id === messageId
            ? { ...msg, text: `${msg.text || ''} ${emoji}` }
            : msg
        ),
      };
    });
  };

  return (
    <div className="h-screen w-full max-w-7xl mx-auto flex overflow-hidden border-x border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl">
      <div
        className={`${
          activeConversationId ? 'hidden lg:block' : 'w-full'
        } lg:w-auto h-full shrink-0 transition-all duration-300 ease-in-out`}
      >
        <ConversationList
          conversations={conversations}
          activeId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      <div
        className={`${
          !activeConversationId ? 'hidden lg:flex' : 'flex'
        } flex-1 h-full transition-all duration-300 ease-in-out`}
      >
        <ChatWindow
          conversation={activeConversation}
          messages={
            activeConversationId ? messages[activeConversationId] || [] : []
          }
          currentUserId={MOCK_CURRENT_USER_ID}
          onSendMessage={handleSendMessage}
          onSendVoiceNote={handleSendVoiceNote}
          onBack={() => setActiveConversationId(null)}
          onReplyMessage={handleReplyMessage}
          onReactMessage={handleReactMessage}
        />
      </div>
    </div>
  );
};

export default MessagesPage;