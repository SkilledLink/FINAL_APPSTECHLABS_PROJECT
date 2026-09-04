// src/features/messages/components/ConversationItem.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Mic } from 'lucide-react';
import type { Conversation } from '../types/message.types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
}) => {
  const { participant, lastMessage, unreadCount } = conversation;

  const renderMessagePreview = () => {
    if (!lastMessage) return 'Started a conversation';

    if (lastMessage.type === 'audio') {
      return (
        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
          <Mic className="w-3.5 h-3.5" />
          <span>Voice note ({lastMessage.audioDetails?.duration || 'Audio'})</span>
        </span>
      );
    }

    return lastMessage.text || 'Message attachment';
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(conversation.id)}
      className={`relative w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex items-center gap-3.5 group overflow-hidden ${
        isActive
          ? 'bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-transparent dark:from-indigo-950/50 dark:via-indigo-900/20 border border-indigo-500/30 dark:border-indigo-500/40 shadow-sm'
          : 'bg-white/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700/80 shadow-2xs'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="activeConversationIndicator"
          className="absolute left-0 top-3 bottom-3 w-1 bg-gradient-to-b from-blue-600 via-indigo-600 to-purple-600 rounded-r-full"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      <div className="relative shrink-0">
        <div
          className={`p-0.5 rounded-full transition-all duration-200 ${
            isActive
              ? 'bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500'
              : 'bg-transparent group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
          }`}
        >
          <img
            src={participant.avatar}
            alt={participant.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-xs"
          />
        </div>
        {participant.isOnline && (
          <span
            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs"
            title="Online"
          />
        )}
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-1.5">
          <h4
            className={`font-bold text-sm truncate tracking-tight transition-colors ${
              isActive
                ? 'text-indigo-950 dark:text-indigo-100'
                : 'text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400'
            }`}
          >
            {participant.name}
          </h4>
          {lastMessage && (
            <span
              className={`text-[11px] font-medium shrink-0 ${
                unreadCount > 0
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {lastMessage.createdAt}
            </span>
          )}
        </div>

        <div className="flex items-center">
          <span className="inline-block text-[10px] font-semibold px-2 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[140px]">
            {participant.role}
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate flex-1 font-normal">
            {renderMessagePreview()}
          </div>

          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="shrink-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs shadow-indigo-500/30"
            >
              {unreadCount}
            </motion.span>
          )}
        </div>
      </div>
    </motion.button>
  );
};