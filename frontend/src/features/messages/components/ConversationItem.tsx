import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2, Mic, UserPlus, X } from 'lucide-react';
import type { Conversation } from '../types/message.types';

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onSelect: (id: string) => void;
  /** When true, render in request mode (accept/reject buttons instead of selection). */
  isRequest?: boolean;
  onAccept?: (id: string) => Promise<void> | void;
  onReject?: (id: string) => Promise<void> | void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isActive,
  onSelect,
  isRequest = false,
  onAccept,
  onReject,
}) => {
  const participant = conversation.participant;
  const displayName = participant?.name || 'Unknown User';
  const displayAvatar = participant?.avatar || '/default-avatar.png';
  const isOnline = participant?.isOnline || false;
  const role = participant?.role || 'User';

  const [busy, setBusy] = useState<'accept' | 'reject' | null>(null);

  const handleAccept = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy('accept');
    try {
      await onAccept?.(conversation.id);
    } finally {
      setBusy(null);
    }
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (busy) return;
    setBusy('reject');
    try {
      await onReject?.(conversation.id);
    } finally {
      setBusy(null);
    }
  };

  const renderMessagePreview = () => {
    if (isRequest) {
      return (
        <span className="inline-flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
          <UserPlus className="w-3 h-3" />
          <span>Wants to start a conversation</span>
        </span>
      );
    }
    const lm = conversation.lastMessage;
    if (!lm) return 'Started a conversation';
    if (lm.type === 'audio') {
      return (
        <span className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
          <Mic className="w-3 h-3" />
          <span>Voice note ({lm.audioDetails?.duration || 'Audio'})</span>
        </span>
      );
    }
    return lm.text || lm.content || 'Message attachment';
  };

  const Wrapper: any = isRequest ? motion.div : motion.button;
  const wrapperProps = isRequest
    ? {}
    : { whileHover: { scale: 1.005 }, whileTap: { scale: 0.985 }, onClick: () => onSelect(conversation.id) };

  return (
    <Wrapper
      {...wrapperProps}
      className={`relative w-full text-left p-3.5 rounded-2xl transition-all duration-200 flex flex-col gap-2 group overflow-hidden ${
        isActive
          ? 'bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/70 shadow-[0_4px_16px_-6px_rgba(15,23,42,0.12)]'
          : 'bg-transparent border border-transparent hover:bg-white/70 dark:hover:bg-slate-900/60 hover:border-slate-200/60 dark:hover:border-slate-800/60'
      }`}
    >
      <div className="flex items-center gap-3.5 w-full">
        {isActive && !isRequest && (
          <motion.div
            layoutId="activeConversationIndicator"
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="absolute left-0 top-3 bottom-3 w-[3px] bg-slate-900 dark:bg-slate-100 rounded-r-full"
          />
        )}

        <div className="relative shrink-0">
          <div
            className={`p-[2px] rounded-full transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-tr from-slate-900 via-slate-700 to-slate-500 dark:from-slate-100 dark:via-slate-300 dark:to-slate-400'
                : 'bg-slate-200/60 dark:bg-slate-800/60 group-hover:bg-slate-300/70 dark:group-hover:bg-slate-700/60'
            }`}
          >
            <img
              src={displayAvatar}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-white dark:border-slate-900 shadow-sm"
            />
          </div>
          {isOnline && !isRequest && (
            <span className="absolute bottom-0.5 right-0.5 flex items-center justify-center">
              <span className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping opacity-60" />
              <span className="relative w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1.5">
            <h4
              className={`font-semibold text-[13.5px] truncate tracking-tight transition-colors ${
                isActive
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-slate-100'
              }`}
            >
              {displayName}
            </h4>
            {!isRequest && conversation.lastMessage && (
              <span
                className={`text-[10.5px] font-medium shrink-0 tabular-nums ${
                  (conversation.unreadCount || 0) > 0
                    ? 'text-slate-800 dark:text-slate-200 font-semibold'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {new Date(
                  conversation.lastMessage.created_at
                ).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <div className="flex items-center">
            <span className="inline-block text-[10px] font-semibold px-1.5 py-[1px] rounded-md bg-slate-100/80 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/60 truncate max-w-[140px]">
              {role}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <div className="text-[12px] text-slate-500 dark:text-slate-400 truncate flex-1 font-normal">
              {renderMessagePreview()}
            </div>
            {!isRequest && (conversation.unreadCount || 0) > 0 && (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                className="shrink-0 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center tabular-nums shadow-sm"
              >
                {conversation.unreadCount}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      {isRequest && (
        <div className="flex items-center gap-2 pl-[62px]">
          <button
            type="button"
            onClick={handleAccept}
            disabled={!!busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition disabled:opacity-60 disabled:cursor-wait"
          >
            {busy === 'accept' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>Accept</span>
          </button>
          <button
            type="button"
            onClick={handleReject}
            disabled={!!busy}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-[11.5px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition disabled:opacity-60 disabled:cursor-wait"
          >
            {busy === 'reject' ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <X className="w-3.5 h-3.5" />
            )}
            <span>Decline</span>
          </button>
        </div>
      )}
    </Wrapper>
  );
};