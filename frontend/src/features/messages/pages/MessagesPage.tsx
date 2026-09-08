// src/features/messages/pages/MessagesPage.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { useVoiceUpload } from '../hooks/useVoiceUpload';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAuth } from '../hooks/useAuth';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { normalizeId } from '../utils/idUtils';

export const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const { conversations, loading: convLoading, error: convError, updateConversation } = useConversations();
  const { messages, setMessages, confirmMessage, addOptimistic } = useMessages(activeConversationId);
  const { send, sending } = useSendMessage(activeConversationId);
  const { uploadVoice, uploading: voiceUploading } = useVoiceUpload();
  const { uploadFile, uploading: fileUploading, progress: uploadProgress } = useFileUpload();

  const isUploading = voiceUploading || fileUploading || sending;

  // Normalize user ID
  const currentUserId = normalizeId(user?.id);

  // Debug logs
  console.log('👤 User from useAuth:', user);
  console.log('👤 Normalized current user ID:', currentUserId);
  if (messages.length > 0) {
    const firstSender = normalizeId(messages[0].sender_id);
    console.log('📩 First message sender_id (normalized):', firstSender);
    console.log('🔍 Comparison (sender_id === currentUserId):', firstSender === currentUserId);
    console.log('🔍 First message object:', messages[0]);
  }

  const handleNewMessage = useCallback((newMsg: any) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === newMsg.id)) return prev;
      const withoutTemp = prev.filter((m) => m.id !== newMsg.id && !m.id.startsWith('temp-'));
      return [...withoutTemp, newMsg];
    });
    updateConversation(newMsg.conversation_id, {
      lastMessage: newMsg,
      updated_at: newMsg.created_at,
    });
  }, [setMessages, updateConversation]);

  const { broadcastMessage } = useRealtimeMessages(activeConversationId, handleNewMessage);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  // Send text
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;
      const tempId = `temp-${crypto.randomUUID()}`;
      const tempMessage: any = {
        id: tempId,
        conversation_id: activeConversationId,
        sender_id: currentUserId,
        client_message_id: crypto.randomUUID(),
        type: 'text',
        content: text,
        text: text,
        created_at: new Date().toISOString(),
        status: 'sending',
        isRead: false,
      };
      addOptimistic(tempMessage);

      const { realMessage, rawMessage, error } = await send(text, 'text');
      if (realMessage && rawMessage) {
        confirmMessage(realMessage);
        broadcastMessage(rawMessage);
        updateConversation(activeConversationId, {
          lastMessage: realMessage,
          updated_at: realMessage.created_at,
        });
      } else if (error) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === tempId ? { ...m, content: '❌ Failed to send', text: '❌ Failed to send', status: 'failed' } : m
          )
        );
      }
    },
    [activeConversationId, send, confirmMessage, broadcastMessage, updateConversation, setMessages, addOptimistic, currentUserId]
  );

  const handleSendFile = useCallback(
    async (file: File) => {
      if (!activeConversationId) return;
      try {
        const { path, name, size, type } = await uploadFile(file);

        const tempId = `temp-${crypto.randomUUID()}`;
        const isImage = type.startsWith('image/');
        const tempMessage: any = {
          id: tempId,
          conversation_id: activeConversationId,
          sender_id: currentUserId,
          client_message_id: crypto.randomUUID(),
          type: isImage ? 'image' : 'file',
          attachment_path: path,
          attachment_name: name,
          attachment_size: size,
          attachment_type: type,
          created_at: new Date().toISOString(),
          status: 'sending',
          isRead: false,
          fileDetails: {
            name,
            size: formatFileSize(size),
            type,
            icon: getFileIcon(type),
            extension: name.split('.').pop() || '',
          },
        };
        addOptimistic(tempMessage);

        const { realMessage, rawMessage, error } = await send(
          null,
          isImage ? 'image' : 'file',
          path,
          undefined,
          name,
          type,
          size
        );

        if (realMessage && rawMessage) {
          confirmMessage(realMessage);
          broadcastMessage(rawMessage);
          updateConversation(activeConversationId, {
            lastMessage: realMessage,
            updated_at: realMessage.created_at,
          });
        } else if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, attachment_path: undefined, status: 'failed' } : m
            )
          );
        }
      } catch (err) {
        console.error('File upload failed', err);
      }
    },
    [activeConversationId, uploadFile, send, confirmMessage, broadcastMessage, updateConversation, setMessages, addOptimistic, currentUserId]
  );

  const handleSendImage = useCallback(
    async (file: File) => {
      await handleSendFile(file);
    },
    [handleSendFile]
  );

  const handleSendVoiceNote = useCallback(
    async (duration: string) => {
      if (!activeConversationId) return;
      const blob = new Blob(['dummy audio'], { type: 'audio/webm' });
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
      const durationNum = parseInt(duration.split(':')[1]) || 5;

      try {
        const { path } = await uploadVoice(file, durationNum);
        const tempId = `temp-${crypto.randomUUID()}`;
        const tempMessage: any = {
          id: tempId,
          conversation_id: activeConversationId,
          sender_id: currentUserId,
          client_message_id: crypto.randomUUID(),
          type: 'audio',
          attachment_path: path,
          duration_seconds: durationNum,
          created_at: new Date().toISOString(),
          status: 'sending',
          isRead: false,
          audioDetails: {
            url: `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/messages/${path}`,
            duration: `${durationNum}s`,
            waveform: Array.from({ length: 15 }, () => Math.floor(Math.random() * 75 + 25)),
          },
        };
        addOptimistic(tempMessage);

        const { realMessage, rawMessage, error } = await send(null, 'voice', path, durationNum);
        if (realMessage && rawMessage) {
          confirmMessage(realMessage);
          broadcastMessage(rawMessage);
          updateConversation(activeConversationId, {
            lastMessage: realMessage,
            updated_at: realMessage.created_at,
          });
        } else if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId ? { ...m, attachment_path: undefined, status: 'failed' } : m
            )
          );
        }
      } catch (err) {
        console.error('Voice upload failed', err);
      }
    },
    [activeConversationId, uploadVoice, send, confirmMessage, broadcastMessage, updateConversation, setMessages, addOptimistic, currentUserId]
  );

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConversationId) || null,
    [conversations, activeConversationId]
  );

  if (authLoading || convLoading) {
    return <div className="flex items-center justify-center h-screen">Loading conversations...</div>;
  }

  if (convError) {
    return <div className="text-red-500 p-4">Error: {convError.message}</div>;
  }

  return (
    <div className="h-screen w-full  flex overflow-hidden border-x border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl">
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
          currentUserId={currentUserId}
          onSendMessage={handleSendMessage}
          onSendVoiceNote={handleSendVoiceNote}
          onSendFile={handleSendFile}
          onSendImage={handleSendImage}
          uploading={isUploading}
          uploadProgress={uploadProgress}
          onBack={() => setActiveConversationId(null)}
        />
      </div>
    </div>
  );
};

export default MessagesPage;