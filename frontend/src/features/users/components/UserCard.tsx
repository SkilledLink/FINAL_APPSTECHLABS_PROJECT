// src/features/users/components/UserCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Briefcase, User as UserIcon } from 'lucide-react';
import type { User } from '../../../types/user';
import { useConversations } from '../../../hooks/useConversations';
import { useNavigate } from 'react-router-dom';

interface UserCardProps {
  user: User;
  onMessage?: (userId: string) => void;
}

export default function UserCard({ user, onMessage }: UserCardProps) {
  const navigate = useNavigate();
  const { getOrCreateDirect } = useConversations();

  const handleMessage = async () => {
    try {
      const conv = await getOrCreateDirect(user.id);
      navigate(`/home/messages/${conv.id}`);
    } catch (err) {
      console.error('Failed to start conversation:', err);
    }
  };

  const isProfessional = user.account_type?.toLowerCase() === 'professional';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-4 shadow-sm hover:shadow-xl transition-all overflow-hidden"
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <Link to={`/home/profile/${user.id}`} className="shrink-0">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            {user.profile_image_url ? (
              <img src={user.profile_image_url} alt={user.first_name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-xl">
                {user.first_name?.[0]}{user.last_name?.[0]}
              </div>
            )}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <Link to={`/home/profile/${user.id}`} className="hover:underline">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate">
              {user.first_name} {user.last_name}
            </h3>
          </Link>
          {user.username && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">@{user.username}</p>
          )}
          {user.location && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{user.location}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {isProfessional ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 px-2 py-0.5 rounded-full border border-cyan-200/50">
                <Briefcase size={12} /> Professional
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                <UserIcon size={12} /> User
              </span>
            )}
            {/* TODO: show specialties if professional */}
          </div>
        </div>

        <button
          onClick={handleMessage}
          className="shrink-0 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-md hover:shadow-lg transition-all"
          title="Send message"
        >
          <MessageCircle size={18} />
        </button>
      </div>

      {/* Optionally show bio */}
      {user.bio && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 line-clamp-2">{user.bio}</p>
      )}
    </motion.div>
  );
}