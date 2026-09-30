// src/features/messages/pages/MessagesPage.tsx

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ConversationList } from '../components/ConversationList';
import { ChatWindow } from '../components/ChatWindow';
import { useCall } from '../context/CallProvider';
import { useConversations } from '../../../hooks/useConversations';
import { useMessages } from '../../../hooks/useMessages';
import { useRealtimeMessages } from '../hooks/useRealtimeMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { useVoiceUpload } from '../hooks/useVoiceUpload';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAuth } from '../hooks/useAuth';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';
import { useSocketContext } from '../../../contexts/SocketContext';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';
import { normalizeId } from '../utils/idUtils';
import { generateUUID } from '../../../utils/uuid';

export const MessagesPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const { socket } = useSocketContext();
  const navigate = useNavigate();

  const { conversationId: urlConversationId } = useParams<{
    conversationId?: string;
  }>();

  const normalizedUrlId = normalizeId(urlConversationId);

  const [activeConversationId, setActiveConversationId] = useState<
    string | null
  >(normalizedUrlId ?? null);

  const [displayConversations, setDisplayConversations] = useState<any[]>([]);

  const { conversations, loading: convLoading, error: convError } =
    useConversations();

  useEffect(() => {
    setDisplayConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    const normalized = normalizeId(urlConversationId);
    if (normalized && normalized !== activeConversationId) {
      setActiveConversationId(normalized);
    } else if (!normalized && activeConversationId) {
      setActiveConversationId(null);
    }
  }, [urlConversationId, activeConversationId]);

  const { messages, setMessages, confirmMessage, addOptimistic } =
    useMessages(activeConversationId);
  const { send } = useSendMessage(activeConversationId);
  const { uploadVoice, uploading: voiceUploading } = useVoiceUpload();
  const { uploadFile, uploading: fileUploading, progress: uploadProgress } =
    useFileUpload();

  const isUploading = voiceUploading || fileUploading;
  const currentUserId = normalizeId(user?.id);

  const { onlineUsers } = usePresence(currentUserId);
  const { typingUsers, sendTyping } = useTyping(
    activeConversationId,
    currentUserId
  );

  const callApi = useCall();
  const { setCallParticipant } = callApi;

  const handleGlobalNewMessage = useCallback(
    (newMsg: any) => {
      const isActive = newMsg.conversation_id === activeConversationId;

      setDisplayConversations((prev) => {
        const index = prev.findIndex(
          (conversation) => conversation.id === newMsg.conversation_id
        );
        if (index < 0) return prev;

        const updated = {
          ...prev[index],
          lastMessage: newMsg,
          last_message: newMsg,
          unreadCount: isActive
            ? 0
            : (prev[index].unreadCount ?? prev[index].unread_count ?? 0) + 1,
          unread_count: isActive
            ? 0
            : (prev[index].unread_count ?? prev[index].unreadCount ?? 0) + 1,
        };
        return [
          updated,
          ...prev.filter((_, itemIndex) => itemIndex !== index),
        ];
      });

      if (isActive) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          const withoutTemp = prev.filter(
            (m) =>
              m.id !== newMsg.id &&
              !(
                typeof m.id === 'string' &&
                m.id.startsWith('temp-') &&
                m.client_message_id === newMsg.client_message_id
              )
          );
          return [...withoutTemp, newMsg];
        });

        if (socket) {
          socket.emit('message_read', {
            conversation_id: newMsg.conversation_id,
          });
        }
      }
    },
    [activeConversationId, setMessages, socket]
  );

  useRealtimeMessages(handleGlobalNewMessage);

  useEffect(() => {
    if (!activeConversationId || !socket) return;
    setDisplayConversations((prev) =>
      prev.map((conversation) =>
        conversation.id === activeConversationId
          ? { ...conversation, unreadCount: 0, unread_count: 0 }
          : conversation
      )
    );
    socket.emit('message_read', { conversation_id: activeConversationId });
  }, [activeConversationId, socket]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      const normalizedId = normalizeId(id);
      setActiveConversationId(normalizedId);
      navigate(`/home/messages/${normalizedId}`);
    },
    [navigate]
  );

  /* ── Send Text ──────────────────────────────────────────── */
  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!activeConversationId) return;

      try {
        const clientMessageId = generateUUID();
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

        const { realMessage, error } = await send(
          clientMessageId,
          text,
          'text'
        );

        if (realMessage) {
          confirmMessage(realMessage);
        } else if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...m,
                    content: `❌ ${error}`,
                    text: `❌ ${error}`,
                    status: 'failed',
                  }
                : m
            )
          );
        }
      } catch (err) {
        console.error('[send text] failed:', err);
      }
    },
    [
      activeConversationId,
      send,
      confirmMessage,
      setMessages,
      addOptimistic,
      currentUserId,
    ]
  );

  /* ── Send File / Image ──────────────────────────────────── */
  const handleSendFile = useCallback(
    async (file: File) => {
      if (!activeConversationId) return;
      try {
        const { publicUrl, name, size, type } = await uploadFile(file);
        const clientMessageId = generateUUID();
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

        const { realMessage, error } = await send(
          clientMessageId,
          null,
          isImage ? 'image' : 'file',
          publicUrl,
          undefined,
          name,
          type,
          size
        );

        if (realMessage) {
          confirmMessage(realMessage);
        } else if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, attachment_path: undefined, status: 'failed' }
                : m
            )
          );
        }
      } catch (err) {
        console.error('File upload failed', err);
      }
    },
    [
      activeConversationId,
      uploadFile,
      send,
      confirmMessage,
      setMessages,
      addOptimistic,
      currentUserId,
    ]
  );

  const handleSendImage = useCallback(
    async (file: File) => {
      await handleSendFile(file);
    },
    [handleSendFile]
  );

  /* ── Send Voice Note ────────────────────────────────────── */
  const handleSendVoiceNote = useCallback(
    async (duration: string) => {
      if (!activeConversationId) return;
      const blob = new Blob(['dummy audio'], { type: 'audio/webm' });
      const file = new File([blob], 'recording.webm', {
        type: 'audio/webm',
      });
      const durationNum = parseInt(duration.split(':')[1]) || 5;

      try {
        const { publicUrl } = await uploadVoice(file, durationNum);
        const clientMessageId = generateUUID();
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
            waveform: Array.from({ length: 15 }, () =>
              Math.floor(Math.random() * 75 + 25)
            ),
          },
        };
        addOptimistic(tempMessage);

        const { realMessage, error } = await send(
          clientMessageId,
          null,
          'voice',
          publicUrl,
          durationNum
        );

        if (realMessage) {
          confirmMessage(realMessage);
        } else if (error) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? { ...m, attachment_path: undefined, status: 'failed' }
                : m
            )
          );
        }
      } catch (err) {
        console.error('Voice upload failed', err);
      }
    },
    [
      activeConversationId,
      uploadVoice,
      send,
      confirmMessage,
      setMessages,
      addOptimistic,
      currentUserId,
    ]
  );

  const conversationsWithPresence = useMemo(() => {
    return displayConversations.map((c) => {
      if (!c.participant) return c;
      const isOnline = onlineUsers.includes(c.participant.id);
      return { ...c, participant: { ...c.participant, isOnline } };
    });
  }, [displayConversations, onlineUsers]);

  useEffect(() => {
    conversationsWithPresence.forEach((c) => {
      if (c.participant?.id) {
        setCallParticipant(c.id, {
          name: c.participant.name,
          avatar: c.participant.avatar,
        });
      }
    });
  }, [conversationsWithPresence, setCallParticipant]);

  const activeConversation = useMemo(
    () =>
      conversationsWithPresence.find(
        (c) => normalizeId(c.id) === normalizeId(activeConversationId)
      ) || null,
    [conversationsWithPresence, activeConversationId]
  );

  const handleStartCall = useCallback(() => {
    if (!activeConversationId || !activeConversation?.participant?.id) return;
    callApi.startCall(
      activeConversationId,
      activeConversation.participant.id,
      'audio'
    );
  }, [activeConversationId, activeConversation, callApi]);

  const handleStartVideoCall = useCallback(() => {
    if (!activeConversationId || !activeConversation?.participant?.id) return;
    callApi.startCall(
      activeConversationId,
      activeConversation.participant.id,
      'video'
    );
  }, [activeConversationId, activeConversation, callApi]);

  /* ── Loading state ──────────────────────────────────────── */
  if (authLoading || convLoading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-transparent">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-slate-300 border-t-slate-800 dark:border-slate-700 dark:border-t-slate-200 animate-spin" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading conversations…
          </span>
        </div>
      </div>
    );
  }

  /* ── Error state ────────────────────────────────────────── */
  if (convError) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-transparent">
        <div className="rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/30 px-6 py-4 text-sm font-medium text-rose-600 dark:text-rose-400 backdrop-blur-xl">
          Error: {convError}
        </div>
      </div>
    );
  }

  /* ── Main render ────────────────────────────────────────── */
  return (
    <div className="absolute inset-0 flex overflow-hidden bg-transparent">
      <div
        className={`${
          activeConversationId ? 'hidden lg:block' : 'w-full'
        } lg:w-auto h-full shrink-0 transition-all duration-300 ease-in-out`}
      >
        <ConversationList
          conversations={conversationsWithPresence as any}
          activeId={activeConversationId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* ChatWindow Area with Loading Fallback */}
      <div
        className={`${
          !activeConversationId ? 'hidden lg:flex' : 'flex'
        } flex-1 h-full min-h-0 transition-all duration-300 ease-in-out`}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation as any}
            messages={messages}
            currentUserId={currentUserId}
            onSendMessage={handleSendMessage}
            onSendVoiceNote={handleSendVoiceNote}
            onSendFile={handleSendFile}
            onSendImage={handleSendImage}
            uploading={isUploading}
            uploadProgress={uploadProgress}
            onBack={() => {
              setActiveConversationId(null);
              navigate('/home/messages');
            }}
            onTypingChange={sendTyping}
            typingUsers={typingUsers}
            onCall={handleStartCall}
            onVideoCall={handleStartVideoCall}
            callDisabled={!!callApi.call}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center h-full p-8 text-center bg-transparent">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-slate-100 mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              Loading conversation…
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;