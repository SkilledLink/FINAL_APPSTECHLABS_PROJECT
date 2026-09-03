import React, { useState, useCallback } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { useVoiceUpload } from '../hooks/useVoiceUpload';
import { useAuth } from '../hooks/useAuth';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const { conversations, loading: convLoading, error: convError, updateConversation } = useConversations();
  const { messages, setMessages, confirmMessage } = useMessages(activeConversationId);
  const { broadcastMessage } = useRealtimeMessages(
    activeConversationId,
    (newMsg) => {
      setMessages((prev) => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        const withoutTemp = prev.filter(m => m.id !== newMsg.id && !m.id.startsWith('temp-'));
        return [...withoutTemp, newMsg];
      });
      updateConversation(newMsg.conversation_id, {
        last_message: newMsg,
        updated_at: newMsg.created_at,
      });
    }
  );
  const { send, sending } = useSendMessage(activeConversationId);
  const { uploadVoice, uploading } = useVoiceUpload();

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;
      const { tempId, realMessage, error } = await send(text, 'text');
      if (realMessage) {
        confirmMessage(realMessage);
        broadcastMessage(realMessage);
        updateConversation(activeConversationId, {
          last_message: realMessage,
          updated_at: realMessage.created_at,
        });
      } else if (error) {
        setMessages(prev =>
          prev.map(m =>
            m.id === `temp-${tempId}` ? { ...m, text: '❌ Failed to send' } : m
          )
        );
      }
    },
    [activeConversationId, send, confirmMessage, broadcastMessage, updateConversation, setMessages]
  );

  const handleSendVoiceNote = useCallback(
    async (duration: string) => {
      if (!activeConversationId) return;
      // In real usage, you'll pass the actual file from MediaRecorder.
      // For now we create a dummy blob.
      const blob = new Blob(['dummy audio'], { type: 'audio/webm' });
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
      const durationNum = parseInt(duration.split(':')[1]) || 5;

      try {
        const { path } = await uploadVoice(file, durationNum);
        const { tempId, realMessage, error } = await send(null, 'audio', path, durationNum);
        if (realMessage) {
          confirmMessage(realMessage);
          broadcastMessage(realMessage);
          updateConversation(activeConversationId, {
            last_message: realMessage,
            updated_at: realMessage.created_at,
          });
        } else if (error) {
          setMessages(prev =>
            prev.map(m =>
              m.id === `temp-${tempId}` ? { ...m, audioDetails: undefined } : m
            )
          );
        }
      } catch (err) {
        console.error('Voice upload failed', err);
      }
    },
    [activeConversationId, uploadVoice, send, confirmMessage, broadcastMessage, updateConversation, setMessages]
  );

  const activeConversation = conversations.find(c => c.id === activeConversationId) || null;

  if (convLoading) {
    return <div className="flex items-center justify-center h-screen">Loading conversations...</div>;
  }

  if (convError) {
    return <div className="text-red-500 p-4">Error: {convError.message}</div>;
  }

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
          messages={messages}
          currentUserId={user?.id || ''}
          onSendMessage={handleSendMessage}
          onSendVoiceNote={handleSendVoiceNote}
          onBack={() => setActiveConversationId(null)}
        />
      </div>
    </div>
  );
};

export default MessagesPage;