import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Sparkles, MoreVertical, ArrowLeft, Phone, Video, Search, ShieldCheck, UserCheck } from 'lucide-react';
import type { MessageUser } from '../types/message.types';

interface ChatHeaderProps {
  user: MessageUser;
  onBack?: () => void;
  onCall?: () => void;
  onVideoCall?: () => void;
  onSearchMessages?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  user,
  onBack,
  onCall,
  onVideoCall,
  onSearchMessages,
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="h-20 px-4 sm:px-6 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex items-center justify-between shrink-0 z-20 transition-colors">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onBack && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>
        )}

        <div className="relative shrink-0">
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 shadow-xs">
            <img
              src={user.avatar || '/default-avatar.png'}
              alt={user.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-white dark:border-slate-900"
            />
          </div>
          {user.isOnline && (
            <div className="absolute bottom-0 right-0 flex items-center justify-center">
              <span className="absolute w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping opacity-75" />
              <span className="relative w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-xs" />
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 tracking-tight truncate">
              {user.name}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-amber-500" /> Pro
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            {user.isOnline ? (
              <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active now
              </span>
            ) : (
              <span>{user.lastSeen || 'Offline'}</span>
            )}
            {user.role && (
              <>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="truncate hidden sm:inline font-medium text-slate-500 dark:text-slate-400">
                  {user.role}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 text-xs font-semibold">
          <Mic className="w-3.5 h-3.5 text-indigo-500" />
          <span>Voice Memos Active</span>
        </div>

        {onSearchMessages && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onSearchMessages}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Search className="w-4 h-4" />
          </motion.button>
        )}
        {onCall && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onCall}
            className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Phone className="w-4 h-4" />
          </motion.button>
        )}
        {onVideoCall && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onVideoCall}
            className="p-2.5 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <Video className="w-4 h-4" />
          </motion.button>
        )}

        <div className="relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDropdown((prev) => !prev)}
            className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -8 }}
                  className="absolute right-0 mt-2 w-48 py-1.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xl z-40 text-xs font-medium text-slate-700 dark:text-slate-300"
                >
                  <button
                    type="button"
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition"
                    onClick={() => setShowDropdown(false)}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    View Contact Details
                  </button>
                  <button
                    type="button"
                    className="w-full px-3.5 py-2 text-left hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition"
                    onClick={() => setShowDropdown(false)}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    Security & Encryption
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};