import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  MessageSquare,
  Plus,
  UserPlus,
} from 'lucide-react';
import type { Conversation } from '../types/message.types';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  /** Pending incoming requests. Optional — if omitted, no Requests tab is rendered. */
  requests?: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat?: () => void;
  onAcceptRequest?: (id: string) => Promise<void> | void;
  onRejectRequest?: (id: string) => Promise<void> | void;
}

type TabId = 'all' | 'unread' | 'requests';

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  requests = [],
  activeId,
  onSelectConversation,
  onNewChat,
  onAcceptRequest,
  onRejectRequest,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<TabId>('all');

  const totalUnread = conversations.reduce(
    (acc, item) => acc + (item.unreadCount || 0),
    0
  );
  const requestCount = requests.length;

  const filteredConversations = (filter === 'requests' ? requests : conversations).filter(
    (item) => {
      const participantName = item.participant?.name?.toLowerCase() || '';
      const lastMessageText =
        (item.lastMessage?.text || item.lastMessage?.content || '')?.toLowerCase() ||
        '';
      const matchesSearch =
        participantName.includes(search.toLowerCase()) ||
        lastMessageText.includes(search.toLowerCase());
      const matchesFilter =
        filter === 'unread' ? (item.unreadCount || 0) > 0 : true;
      return matchesSearch && matchesFilter;
    }
  );

  const filterTabs: Array<{ id: TabId; label: string; count: number }> = [
    { id: 'all', label: 'All', count: conversations.length },
    { id: 'unread', label: 'Unread', count: totalUnread },
  ];
  if (onAcceptRequest && onRejectRequest) {
    filterTabs.push({ id: 'requests', label: 'Requests', count: requestCount });
  }

  const isRequestView = filter === 'requests';

  return (
    <div className="w-full lg:w-[340px] xl:w-[380px] flex flex-col h-full border-r border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-950/40 backdrop-blur-2xl">
      {/* Header */}
      <div className="p-5 space-y-4 border-b border-slate-200/60 dark:border-slate-800/60 bg-white/40 dark:bg-slate-900/30 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[22px] font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Messages
            </h2>
            {totalUnread > 0 && !isRequestView && (
              <motion.span
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-0.5 text-[10px] font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-full shadow-sm"
              >
                {totalUnread}
              </motion.span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onNewChat && (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={onNewChat}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-slate-100/80 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 rounded-xl transition shadow-[0_1px_2px_rgba(15,23,42,0.04)] border border-slate-200/60 dark:border-slate-700/60"
                title="New Chat"
              >
                <Plus className="w-4 h-4" strokeWidth={2.2} />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Search */}
        <div className="relative flex items-center group">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400 group-focus-within:text-slate-600 dark:group-focus-within:text-slate-300 transition-colors" />
          <input
            type="text"
            placeholder={
              isRequestView ? 'Search requests…' : 'Search conversations…'
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-slate-100/70 dark:bg-slate-900/70 border border-transparent focus:border-slate-300/80 dark:focus:border-slate-700/80 rounded-2xl text-[13px] font-medium text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-slate-900 transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-200/70 dark:bg-slate-800/70 hover:bg-slate-300/70 dark:hover:bg-slate-700/70 rounded-full transition"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[12px] font-semibold transition-colors ${
                  isActive
                    ? 'text-slate-900 dark:text-slate-100'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.06)] border border-slate-200/60 dark:border-slate-700/60"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`relative z-10 font-mono text-[10px] px-1.5 py-0.5 rounded-md transition-colors ${
                      tab.id === 'requests' && isActive
                        ? 'bg-amber-500 text-white'
                        : isActive
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-slate-300/50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-slate-300/60 dark:scrollbar-thumb-slate-700/60 scrollbar-track-transparent">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              >
                <ConversationItem
                  conversation={item}
                  isActive={item.id === activeId}
                  onSelect={onSelectConversation}
                  isRequest={isRequestView}
                  onAccept={onAcceptRequest}
                  onReject={onRejectRequest}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 px-4 text-center"
            >
              <div className="p-4 bg-slate-100/70 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl mb-3 text-slate-400">
                {isRequestView ? (
                  <UserPlus className="w-6 h-6 stroke-[1.5]" />
                ) : (
                  <MessageSquare className="w-6 h-6 stroke-[1.5]" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {isRequestView ? 'No pending requests' : 'No conversations found'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[220px] mt-1 leading-relaxed">
                {search
                  ? `No results matching "${search}"`
                  : isRequestView
                  ? "You're all caught up."
                  : 'You have no unread messages right now.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};