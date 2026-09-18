import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  Search,
  User,
  Briefcase,
  MapPin,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Loader2,
  Users as UsersIcon,
} from 'lucide-react';
import { useUsers } from '../../../hooks/useUsers';
import { useConversations } from '../../messages/hooks/useConversations';
import { useAuth } from '../../auth/hooks/useAuth';
import { useFollow } from '../../../hooks/useFollow';
import type { User as UserType } from '../../../types/user';

// ─── Motion tokens ───────────────────────────────────────────────────────────
const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
const EASE_IN: [number, number, number, number] = [0.4, 0, 1, 1];

// ─── Preloader ───────────────────────────────────────────────────────────────
function PagePreloader() {
  return (
    <motion.div
      key="preloader"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: EASE_IN } }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white dark:bg-slate-950"
    >
      {/* Soft ambient glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT }}
        className="absolute w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl"
      />

      <div className="relative flex flex-col items-center gap-6">
        {/* Orbiting icon ring */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          {/* Outer pulsing ring */}
          <motion.span
            className="absolute inset-0 rounded-full border border-blue-500/30"
            animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
          />
          <motion.span
            className="absolute inset-0 rounded-full border border-blue-500/20"
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }}
            transition={{
              duration: 2.2,
              ease: 'easeInOut',
              repeat: Infinity,
              delay: 0.4,
            }}
          />

          {/* Rotating gradient arc */}
          <motion.span
            className="absolute inset-2 rounded-full"
            style={{
              background:
                'conic-gradient(from 0deg, transparent 0deg, rgba(59,130,246,0) 200deg, rgba(59,130,246,0.9) 360deg)',
              WebkitMask:
                'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
              mask: 'radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.4, ease: 'linear', repeat: Infinity }}
          />

          {/* Center icon — gentle breathe */}
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2.2, ease: 'easeInOut', repeat: Infinity }}
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30"
          >
            <UsersIcon size={26} className="text-white" strokeWidth={2.2} />
          </motion.div>
        </div>

        {/* Label */}
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE_OUT, delay: 0.15 }}
          className="text-center"
        >
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 tracking-wide">
            Gathering the community
          </p>
          <motion.p
            className="text-xs text-slate-400 dark:text-slate-500 mt-1"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, ease: 'easeInOut', repeat: Infinity }}
          >
            This will only take a moment
          </motion.p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-blue-500"
              animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1.15, 0.85] }}
              transition={{
                duration: 1.2,
                ease: 'easeInOut',
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function UsersPage() {
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { users, loading, error, fetchUsers, total } = useUsers({ limit: 50 });
  const { getOrCreateDirect } = useConversations();
  const { follow, unfollow } = useFollow();
  const [searchQuery, setSearchQuery] = useState('');
  const [localUsers, setLocalUsers] = useState<UserType[]>(users);
  const [messagingId, setMessagingId] = useState<string | null>(null);

  // Minimum preloader duration so it doesn't flash on fast responses
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMinTimeElapsed(true), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const authCheck = isAuthenticated();
  const isInitialLoading = authCheck && loading && users.length === 0;
  const showPreloader = isInitialLoading || !minTimeElapsed;

  if (!authCheck) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 dark:text-slate-400">Please log in to see users.</p>
      </div>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers({ search: searchQuery || undefined, limit: 50 });
  };

  const handleMessage = async (targetUserId: string) => {
    if (messagingId) return;
    setMessagingId(targetUserId);
    try {
      const conversation = await getOrCreateDirect(targetUserId);
      navigate(`/home/messages/${conversation.id}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to start conversation');
    } finally {
      setMessagingId(null);
    }
  };

  const handleFollowToggle = async (targetUserId: string, isFollowing: boolean) => {
    try {
      if (isFollowing) {
        await unfollow(targetUserId);
        setLocalUsers(prev =>
          prev.map(u => (u.id === targetUserId ? { ...u, is_following: false } : u)),
        );
        toast.success('Unfollowed');
      } else {
        await follow(targetUserId);
        setLocalUsers(prev =>
          prev.map(u => (u.id === targetUserId ? { ...u, is_following: true } : u)),
        );
        toast.success('Followed');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || err?.message || 'Failed to update follow status');
    }
  };

  if (error) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 text-center bg-red-50/50 dark:bg-red-950/20 rounded-3xl border border-red-200">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => fetchUsers()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>{showPreloader && <PagePreloader />}</AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{
          opacity: showPreloader ? 0 : 1,
          y: showPreloader ? 12 : 0,
        }}
        transition={{ duration: 0.7, ease: EASE_OUT, delay: showPreloader ? 0 : 0.15 }}
        className="max-w-6xl mx-auto py-6 px-4 space-y-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <UsersIcon size={24} className="text-blue-600" />
              Community
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {total} professionals and users on SkilledLink
            </p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="relative max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search users by name, skill, or location..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-sm"
          />
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {users.map(user => {
              const isProfessional = user.account_type?.toLowerCase() === 'professional';
              const isCurrentUser = currentUser?.id === user.id;
              const isFollowing = user.is_following || false;
              const isMessaging = messagingId === user.id;

              return (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="group bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-5 shadow-sm hover:shadow-xl hover:border-blue-400/30 transition-all duration-300"
                >
                  <div className="cursor-pointer" onClick={() => navigate(`/home/profile/${user.id}`)}>
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-700 shadow-md">
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.first_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold text-xl">
                              {user.first_name?.[0]}
                              {user.last_name?.[0]}
                            </div>
                          )}
                        </div>
                        {isProfessional && (
                          <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-blue-600 rounded-full border-2 border-white dark:border-slate-900">
                            <Briefcase size={10} className="text-white" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">
                            {user.first_name} {user.last_name}
                          </h3>
                          {isProfessional && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold rounded-full border border-blue-500/20 shrink-0">
                              <Sparkles size={10} /> Pro
                            </span>
                          )}
                        </div>
                        {user.username && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            @{user.username}
                          </p>
                        )}
                        {user.location && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} /> {user.location}
                          </p>
                        )}
                      </div>
                    </div>

                    {user.bio && (
                      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                        {user.bio}
                      </p>
                    )}

                    {isProfessional && (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-medium rounded-full border border-amber-500/20">
                          👷 Skilled Professional
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
                    {!isCurrentUser && (
                      <>
                        <button
                          onClick={() => handleMessage(user.id)}
                          disabled={isMessaging}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all shadow-sm hover:shadow-md active:scale-95 disabled:opacity-60 disabled:cursor-wait"
                        >
                          {isMessaging ? (
                            <>
                              <Loader2 size={14} className="animate-spin" /> Opening…
                            </>
                          ) : (
                            <>
                              <MessageCircle size={14} /> Message
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => handleFollowToggle(user.id, isFollowing)}
                          className={`px-3 py-2 text-xs font-semibold rounded-xl transition-all active:scale-95 ${
                            isFollowing
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                              : 'bg-slate-200/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-300/80 dark:hover:bg-slate-700/80'
                          }`}
                        >
                          {isFollowing ? 'Following' : 'Follow'}
                        </button>
                      </>
                    )}
                    {isCurrentUser && (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                        This is you
                      </span>
                    )}
                    <button
                      onClick={() => navigate(`/profile/${user.id}`)}
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {users.length === 0 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
            className="text-center py-16"
          >
            <User size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
              No users found
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Try adjusting your search</p>
          </motion.div>
        )}
      </motion.div>
    </>
  );
}