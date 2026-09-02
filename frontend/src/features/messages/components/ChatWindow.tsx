import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Sparkles,
  ShieldCheck,
  ArrowDown,
  Lock,
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
  onBack,
  onReplyMessage,
  onReactMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottomButton, setShowScrollBottomButton] = useState(false);

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
    const isUp = scrollHeight - scrollTop - clientHeight > 180;
    setShowScrollBottomButton(isUp);
  };

  if (!conversation) {
    return (
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center relative overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 p-8 text-center select-none">
        {/* Ambient Decorative Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-tr from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="relative z-10 flex flex-col items-center max-w-md"
        >
          {/* Hero Icon Frame */}
          <div className="relative mb-6">
            <div className="w-22 h-22 bg-gradient-to-tr from-blue-600/15 via-indigo-600/15 to-violet-600/15 dark:from-blue-500/20 dark:via-indigo-500/20 dark:to-violet-500/20 text-indigo-600 dark:text-indigo-400 rounded-3xl flex items-center justify-center border border-indigo-500/20 dark:border-indigo-400/20 shadow-xl shadow-indigo-500/5 backdrop-blur-xl">
              <MessageSquare className="w-10 h-10 stroke-[1.6]" />
            </div>
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
              className="absolute -top-2 -right-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md text-amber-500"
            >
              <Sparkles className="w-4 h-4 fill-amber-400/20" />
            </motion.div>
          </div>

          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 mb-2">
            Your Workspace Messages
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
            Select a contact to collaborate, review project updates, or exchange quick audio memos.
          </p>

          {/* Key Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
              <Lock className="w-3.5 h-3.5 text-indigo-500" />
              Encrypted Messaging
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Smart Suggestions
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50/40 dark:bg-slate-950 relative overflow-hidden">
      {/* Header */}
      <ChatHeader user={conversation.participant} onBack={onBack} />

      {/* Security & Context Banner */}
      <div className="flex items-center justify-center gap-1.5 py-1.5 px-4 bg-slate-100/60 dark:bg-slate-900/50 border-b border-slate-200/40 dark:border-slate-800/40 text-[11px] font-semibold text-slate-500 dark:text-slate-400 backdrop-blur-md">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
        <span>End-to-end encrypted session with</span>
        <span className="text-slate-700 dark:text-slate-300 font-bold">
          {conversation.participant.name}
        </span>
      </div>

      {/* Messages Scroll Container */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 relative scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800"
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isSender={msg.senderId === currentUserId}
              onReply={onReplyMessage}
              onReact={onReactMessage}
            />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Scroll to Bottom Button */}
      <AnimatePresence>
        {showScrollBottomButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            onClick={() => scrollToBottom('smooth')}
            className="absolute bottom-20 right-6 z-30 p-2.5 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 transition"
            title="Scroll to latest messages"
          >
            <ArrowDown className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input Section */}
      <MessageInput
        onSendMessage={onSendMessage}
        onSendVoiceNote={onSendVoiceNote}
      />
    </div>
  );
};