// src/features/messages/components/ChatWindow.tsx
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ArrowDown,
  Lock,
  Users,
} from 'lucide-react';
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
}

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
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

  // Debug: log user IDs
  console.log('🔍 ChatWindow currentUserId:', currentUserId);
  console.log('🔍 First message sender_id:', messages[0]?.sender_id);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom('auto');
  }, [conversation?.id]);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [messages]);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 200;
    setShowScrollBottomButton(isUp);
  };

  if (!conversation) {
    return (
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50/80 via-white to-slate-100/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-8 text-center select-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 28 }}
          className="relative z-10 flex flex-col items-center max-w-sm"
        >
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-violet-500/10 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-violet-500/20 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center border border-indigo-500/20 dark:border-indigo-400/20 shadow-xl shadow-indigo-500/5 backdrop-blur-xl">
              <MessageSquare className="w-9 h-9 stroke-[1.5]" />
            </div>
            <motion.div
              animate={{ rotate: [0, 12, -12, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="absolute -top-1 -right-1 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md text-amber-500"
            >
              <Sparkles className="w-4 h-4 fill-amber-400/20" />
            </motion.div>
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">Your Workspace Messages</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Select a contact to collaborate, review project updates, or exchange quick audio memos.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Encrypted
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm">
              <Users className="w-3.5 h-3.5 text-emerald-500" />
              Team Chat
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-b from-slate-50/60 via-white to-slate-100/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950/90 relative overflow-hidden">
      <ChatHeader user={conversation.participant} onBack={onBack} />

      <div className="flex items-center justify-center gap-2 py-1.5 px-4 bg-slate-100/60 dark:bg-slate-900/50 border-b border-slate-200/40 dark:border-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 backdrop-blur-sm">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>End-to-end encrypted session with</span>
        <span className="text-slate-700 dark:text-slate-300 font-bold">
          {conversation.participant.name}
        </span>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 relative scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700"
      >
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(#0f172a_1px,transparent_1px)] [background-size:16px_16px]" />
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSender={msg.sender_id === currentUserId}
              onReply={onReplyMessage}
              onReact={onReactMessage}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <AnimatePresence>
        {showScrollBottomButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-24 right-6 z-30 p-3 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-full shadow-lg shadow-indigo-500/20 border border-indigo-200/50 dark:border-indigo-800/50 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-200"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      <MessageInput
        onSendMessage={onSendMessage}
        onSendVoiceNote={onSendVoiceNote}
        onSendFile={onSendFile}
        onSendImage={onSendImage}
        uploading={uploading}
        uploadProgress={uploadProgress}
      />
    </div>
  );
};