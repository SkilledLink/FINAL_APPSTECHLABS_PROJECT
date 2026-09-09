import React, { useState, useCallback, useMemo } from 'react';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { useConversations } from '../../../hooks/useConversations';
import { useMessages } from '../../../hooks/useMessages';
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
  const currentUserId = normalizeId(user?.id);

  const handleNewMessage = useCallback(
    (newMsg: any) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        const withoutTemp = prev.filter((m) => m.id !== newMsg.id && !m.id.startsWith('temp-'));
        return [...withoutTemp, newMsg];
      });
      if (updateConversation) {
        updateConversation(newMsg.conversation_id, {
          lastMessage: newMsg,
          updated_at: newMsg.created_at,
        });
      }
    },
    [setMessages, updateConversation]
  );

  const { broadcastMessage } = useRealtimeMessages(activeConversationId, handleNewMessage);

  const handleSelectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
  }, []);

  // ── Send Text ──────────────────────────────────────────────
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;
      // ✅ Generate clientMessageId once
      const clientMessageId = crypto.randomUUID();
      const tempId = `temp-${clientMessageId}`;

      const tempMessage: any = {
        id: tempId,
        conversation_id: activeConversationId,
        sender_id: currentUserId,
        client_message_id: clientMessageId,
        type: 'text',
        content: text,
        text: text,
        created_at: new Date().toISOString(),
        status: 'sending',
        isRead: false,
      };
      addOptimistic(tempMessage);

      // ✅ Pass clientMessageId to send
      const { realMessage, rawMessage, error } = await send(clientMessageId, text, 'text');
      if (realMessage && rawMessage) {
        confirmMessage(realMessage);
        broadcastMessage(rawMessage);
        if (updateConversation) {
          updateConversation(activeConversationId, {
            lastMessage: realMessage,
            updated_at: realMessage.created_at,
          });
        }
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

  // ── Send File / Image ──────────────────────────────────────
  const handleSendFile = useCallback(
    async (file: File) => {
      if (!activeConversationId) return;
      try {
        const { publicUrl, name, size, type } = await uploadFile(file);
        const clientMessageId = crypto.randomUUID();
        const tempId = `temp-${clientMessageId}`;
        const isImage = type.startsWith('image/');

        const tempMessage: any = {
          id: tempId,
          conversation_id: activeConversationId,
          sender_id: currentUserId,
          client_message_id: clientMessageId,
          type: isImage ? 'image' : 'file',
          attachment_path: publicUrl,
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
          clientMessageId,
          null,
          isImage ? 'image' : 'file',
          publicUrl,
          undefined,
          name,
          type,
          size
        );

        if (realMessage && rawMessage) {
          confirmMessage(realMessage);
          broadcastMessage(rawMessage);
          if (updateConversation) {
            updateConversation(activeConversationId, {
              lastMessage: realMessage,
              updated_at: realMessage.created_at,
            });
          }
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

  // ── Send Voice Note ────────────────────────────────────────
  const handleSendVoiceNote = useCallback(
    async (duration: string) => {
      if (!activeConversationId) return;
      const blob = new Blob(['dummy audio'], { type: 'audio/webm' });
      const file = new File([blob], 'recording.webm', { type: 'audio/webm' });
      const durationNum = parseInt(duration.split(':')[1]) || 5;

      try {
        const { publicUrl } = await uploadVoice(file, durationNum);
        const clientMessageId = crypto.randomUUID();
        const tempId = `temp-${clientMessageId}`;

        const tempMessage: any = {
          id: tempId,
          conversation_id: activeConversationId,
          sender_id: currentUserId,
          client_message_id: clientMessageId,
          type: 'audio',
          attachment_path: publicUrl,
          duration_seconds: durationNum,
          created_at: new Date().toISOString(),
          status: 'sending',
          isRead: false,
          audioDetails: {
            url: publicUrl,
            duration: `${durationNum}s`,
            waveform: Array.from({ length: 15 }, () => Math.floor(Math.random() * 75 + 25)),
          },
        };
        addOptimistic(tempMessage);

        const { realMessage, rawMessage, error } = await send(
          clientMessageId,
          null,
          'voice',
          publicUrl,
          durationNum
        );

        if (realMessage && rawMessage) {
          confirmMessage(realMessage);
          broadcastMessage(rawMessage);
          if (updateConversation) {
            updateConversation(activeConversationId, {
              lastMessage: realMessage,
              updated_at: realMessage.created_at,
            });
          }
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
    <div className="h-screen w-full flex overflow-hidden border-x border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-2xl">
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