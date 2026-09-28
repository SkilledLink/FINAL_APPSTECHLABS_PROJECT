// src/features/messages/components/ChatWindow.tsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, ShieldCheck, Lock, Users, Compass } from 'lucide-react';
import type { Conversation, Message } from '../types/message.types';
import { ChatHeader } from './ChatHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

interface ChatWindowProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (text: string) => void;
  onSendVoiceNote: (duration: string) => void;
  onSendFile?: (file: File) => void;
  onSendImage?: (file: File) => void;
  uploading?: boolean;
  uploadProgress?: number;
  onBack?: () => void;
  onReplyMessage?: (message: Message) => void;
  onReactMessage?: (messageId: string, emoji: string) => void;
  onTypingChange?: (isTyping: boolean) => void;
  typingUsers?: Record<string, boolean>;
  onCall?: () => void;
  onVideoCall?: () => void;
  callDisabled?: boolean;
}

const UniverseBackground: React.FC = () => {
  // ... unchanged from your file ...
  return null; // placeholder — keep your existing implementation
};

const LightAmbientGlow: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 dark:hidden">
    <div className="absolute -top-32 -left-32 w-[26rem] h-[26rem] bg-gradient-to-br from-slate-200/50 via-slate-100/30 to-transparent rounded-full blur-3xl" />
    <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] bg-gradient-to-bl from-slate-200/40 via-slate-100/25 to-transparent rounded-full blur-3xl" />
    <div className="absolute -bottom-32 left-1/4 w-[26rem] h-[26rem] bg-gradient-to-t from-slate-200/40 via-slate-100/20 to-transparent rounded-full blur-3xl" />
  </div>
);

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage,
  onSendVoiceNote,
  onSendFile,
  onSendImage,
  uploading = false,
  uploadProgress = 0,
  onBack,
  onReplyMessage,
  onReactMessage,
  onTypingChange,
  typingUsers,
  onCall,
  onVideoCall,
  callDisabled = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setIsUserScrolling(false);
  };

  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom('auto');
    }
  }, [conversation?.id]);

  useEffect(() => {
    if (!isUserScrolling) {
      scrollToBottom('smooth');
    }
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    if (distanceFromBottom > 60) {
      setIsUserScrolling(true);
    } else {
      setIsUserScrolling(false);
    }
  };

  const groupedMessages = messages.reduce((acc, msg, index) => {
    const prev = messages[index - 1];
    const isSameSender = prev && prev.sender_id === msg.sender_id;
    const timeDiff = prev
      ? new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()
      : Infinity;
    const isSameGroup = isSameSender && timeDiff < 60000;
    if (isSameGroup) {
      acc[acc.length - 1].push(msg);
    } else {
      acc.push([msg]);
    }
    return acc;
  }, [] as Message[][]);

  const someoneIsTyping = !!typingUsers && Object.values(typingUsers).some(Boolean);

  // ── EMPTY WORKSPACE STATE ──
  if (!conversation) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-transparent p-8 text-center select-none h-full">
        <LightAmbientGlow />
        <UniverseBackground />

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="relative z-10 flex flex-col items-center max-w-md p-10 rounded-[28px] bg-white/60 dark:bg-slate-900/40 border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-2xl shadow-[0_24px_60px_-24px_rgba(15,23,42,0.15)] dark:shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]"
        >
          <div className="relative mb-7">
            <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 text-slate-600 dark:text-slate-300 rounded-[22px] flex items-center justify-center border border-white/80 dark:border-slate-700/60 shadow-lg shadow-slate-900/5">
              <MessageSquare className="w-9 h-9 stroke-[1.5]" />
            </div>
            <motion.div
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="absolute -top-1.5 -right-1.5 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 rounded-2xl shadow-md text-amber-500"
            >
              <Sparkles className="w-4 h-4 fill-amber-400/20" />
            </motion.div>
          </div>

          <motion.h3
            className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2"
            animate={{ y: [0, -3, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
          >
            Workspace Messages
          </motion.h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-7 max-w-xs">
            Select a contact to start messaging, share media files, or exchange high-fidelity voice
            notes in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md">
              <Lock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              End-to-End Encrypted
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Live Collaboration
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-[11px] font-semibold text-slate-700 dark:text-slate-300 shadow-sm backdrop-blur-md">
              <Compass className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              Dynamic Space
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── ACTIVE CONVERSATION ──
  return (
    <div className="flex flex-col h-full max-h-full w-full min-h-0 overflow-hidden bg-transparent text-slate-900 dark:text-slate-100 relative">
      <LightAmbientGlow />
      <UniverseBackground />

      <header className="flex-none shrink-0 w-full relative z-30 bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/70 pt-safe shadow-[0_1px_0_0_rgba(15,23,42,0.02)]">
        <ChatHeader
          user={conversation.participant}
          onBack={onBack}
          onCall={onCall}
          onVideoCall={onVideoCall}
        />

        <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-slate-50/60 dark:bg-slate-900/40 border-t border-slate-200/50 dark:border-slate-800/50 text-[11px] font-medium text-slate-500 dark:text-slate-400 backdrop-blur-sm">
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </motion.div>
          <span>End-to-end encrypted with</span>
          <span className="text-slate-800 dark:text-slate-200 font-semibold">
            {conversation.participant?.name || 'User'}
          </span>
        </div>
      </header>

      <main
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 min-h-0 w-full overflow-y-auto px-4 sm:px-6 py-6 space-y-1 relative z-10 scroll-smooth scrollbar-thin scrollbar-thumb-slate-300/70 dark:scrollbar-thumb-slate-700/70 scrollbar-track-transparent"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          {groupedMessages.map((group, groupIndex) => {
            const firstMsg = group[0];
            const isSender = firstMsg.sender_id === currentUserId;
            return (
              <motion.div
                key={groupIndex}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                  delay: groupIndex * 0.015,
                }}
                className={`flex flex-col ${isSender ? 'items-end' : 'items-start'} gap-1`}
              >
                {group.map((msg, idx) => (
                  <MessageBubble
                    key={msg.id}
                    message={msg}
                    isSender={msg.sender_id === currentUserId}
                    isFirstInGroup={idx === 0}
                    isLastInGroup={idx === group.length - 1}
                    onReply={onReplyMessage}
                    onReact={onReactMessage}
                  />
                ))}
              </motion.div>
            );
          })}
        </AnimatePresence>

        <AnimatePresence>
          {someoneIsTyping && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex items-center gap-2 pl-2 pt-2"
            >
              <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-full bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 backdrop-blur-md shadow-sm">
                <span
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <span className="text-xs italic text-slate-400 dark:text-slate-500">
                {conversation.participant?.name || 'Someone'} is typing…
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </main>

      <footer className="flex-none shrink-0 w-full relative z-30 bg-white/70 dark:bg-slate-950/60 backdrop-blur-2xl border-t border-slate-200/70 dark:border-slate-800/70 pb-safe">
        <MessageInput
          onSendMessage={onSendMessage}
          onSendVoiceNote={onSendVoiceNote}
          onSendFile={onSendFile}
          onSendImage={onSendImage}
          uploading={uploading}
          uploadProgress={uploadProgress}
          onTypingChange={onTypingChange}
        />
      </footer>
    </div>
  );
};
