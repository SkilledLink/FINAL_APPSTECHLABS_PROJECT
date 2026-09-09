import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, X, MessageSquare, Plus } from 'lucide-react';
import type { Conversation } from '../types/message.types';
import { ConversationItem } from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat?: () => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const totalUnread = conversations.reduce((acc, item) => acc + (item.unreadCount || 0), 0);

  const filteredConversations = conversations.filter((item) => {
    const participantName = item.participant?.name?.toLowerCase() || '';
    const lastMessageText = (item.lastMessage?.text || item.lastMessage?.content || '')?.toLowerCase() || '';
    const matchesSearch =
      participantName.includes(search.toLowerCase()) ||
      lastMessageText.includes(search.toLowerCase());
    const matchesFilter = filter === 'unread' ? (item.unreadCount || 0) > 0 : true;
    return matchesSearch && matchesFilter;
  });

  const filterTabs = [
    { id: 'all' as const, label: 'All', count: conversations.length },
    { id: 'unread' as const, label: 'Unread', count: totalUnread },
  ];

  return (
    <div className="w-full lg:w-80 xl:w-96 flex flex-col h-full border-r border-slate-200/80 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-2xl">
      <div className="p-4 space-y-3.5 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">Messages</h2>
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 text-[11px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 rounded-full shadow-xs">
                {totalUnread} new
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {onNewChat && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNewChat}
                className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-xl transition shadow-xs"
                title="New Chat"
              >
                <Plus className="w-4 h-4" />
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2.5 bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-full transition"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-200/50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id)}
                className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-semibold transition-colors ${
                  isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200/60 dark:border-slate-700/60"
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`relative z-10 font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-slate-100 dark:bg-slate-700 text-slate-700' : 'bg-slate-300/50 text-slate-500'
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

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredConversations.length > 0 ? (
            filteredConversations.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
              >
                <ConversationItem
                  conversation={item}
                  isActive={item.id === activeId}
                  onSelect={onSelectConversation}
                />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-16 px-4 text-center"
            >
              <div className="p-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 rounded-2xl mb-3 text-slate-400">
                <MessageSquare className="w-6 h-6 stroke-[1.5]" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No conversations found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] mt-1">
                {search ? `No results matching "${search}"` : 'You have no unread messages right now.'}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};