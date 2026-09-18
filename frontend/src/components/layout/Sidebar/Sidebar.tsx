// src/components/layout/Sidebar/Sidebar.tsx
import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  Briefcase,
  Users,
  LayoutDashboard,
  MessageSquareMore,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ChevronDown,
  ImagePlus,
} from 'lucide-react';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useUser } from '../../../features/profile/hooks/useUser';
import { useProfileImage } from '../../../features/profile/hooks/useProfileImage';

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const navItems = [
  { icon: Home, label: 'Home', path: '/home', end: true },
  { icon: Compass, label: 'Discover', path: '/home/discover' },
  { icon: Briefcase, label: 'Jobs', path: '/home/jobs' },
  { icon: LayoutDashboard, label: 'Portfolio', path: '/home/portfolio' },
  { icon: MessageSquareMore, label: 'Messages', path: '/home/messages' },
  { icon: Users, label: 'Network', path: '/home/professionals' },
];

export default function Sidebar({ isDark, toggleTheme }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // ── Auth for logout + fallback user ─────────────────────
  const { currentUser, logout, updateUser: updateAuthUser } = useAuth();

  // ── useUser with autoFetch loads the current user on mount ─
  const { user, loading } = useUser({ autoFetch: true });

  // ── useProfileImage handles the actual upload ────────────
  const { uploadProfileImage } = useProfileImage();

  // Prefer the richer profile record; fall back to auth context
  const activeUser = user ?? currentUser;

  // useUser maps backend `profile_image_url` → `profileImageUrl`
  const avatarUrl = activeUser?.profileImageUrl ?? null;

  useEffect(() => {
    if (!isHovered) setIsProfileDropdownOpen(false);
  }, [isHovered]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return 'U';
    return (
      `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() ||
      'U'
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const updated = await uploadProfileImage(file);
    if (updated) {
      // Sync the new avatar into the auth context immediately
      updateAuthUser({
        ...(activeUser as any),
        ...updated,
      });
    }
    setIsProfileDropdownOpen(false);
    e.target.value = '';
  };

  const openAvatarPicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isHovered ? 240 : 76 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ type: 'tween', ease: [0.4, 0, 0.2, 1], duration: 0.22 }}
      className="relative hidden h-full shrink-0 flex-col overflow-hidden border-r border-slate-200/70 bg-white/85 backdrop-blur-xl will-change-[width] md:flex dark:border-white/10 dark:bg-slate-950/70"
    >
      {/* Background lightning */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <svg
          className="h-full w-[240px] opacity-30 dark:opacity-40"
          viewBox="0 0 240 800"
          preserveAspectRatio="none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter
              id="light-blue-glow-sidebar"
              x="-10%"
              y="-10%"
              width="120%"
              height="120%"
            >
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient
              id="thunder-blue-vert-grad"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.15" />
            </linearGradient>
          </defs>
          <motion.path
            d="M 38 -20 L 25 120 L 55 190 L 15 310 L 48 420 L 22 550 L 60 670 L 30 820"
            stroke="url(#thunder-blue-vert-grad)"
            strokeWidth="1.1"
            strokeLinecap="round"
            filter="url(#light-blue-glow-sidebar)"
            initial={{ opacity: 0.25 }}
            animate={{
              opacity: [0.2, 0.6, 0.25, 0.65, 0.2],
              strokeWidth: [0.9, 1.2, 0.9, 1.3, 1],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'easeInOut',
            }}
          />
          <motion.path
            d="M 55 190 L 85 220 L 110 205 M 48 420 L 90 460 L 125 440 M 22 550 L 65 580"
            stroke="#93c5fd"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.3"
            filter="url(#light-blue-glow-sidebar)"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.5, 0.15, 0.55, 0.1] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatType: 'mirror',
              delay: 0.3,
            }}
          />
        </svg>
        <div className="pointer-events-none absolute -left-12 top-1/3 h-48 w-48 rounded-full bg-blue-400/10 blur-2xl dark:bg-blue-500/15" />
      </div>

      {/* Navigation */}
      <nav className="no-scrollbar relative z-10 flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `group relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 rounded-lg border border-blue-500/20 bg-blue-500/10 dark:border-blue-400/20 dark:bg-blue-400/10"
                    transition={{ type: 'tween', duration: 0.2 }}
                  >
                    <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-blue-600 dark:bg-blue-400" />
                  </motion.div>
                )}

                <item.icon
                  size={19}
                  className={`z-10 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                />

                <AnimatePresence initial={false}>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.12 }}
                      className="z-10 ml-3.5 overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User profile section */}
      <div className="relative z-10 border-t border-slate-200/70 p-3 dark:border-white/10">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            aria-expanded={isProfileDropdownOpen}
            aria-haspopup="true"
            className="group flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors hover:bg-blue-500/8 dark:hover:bg-blue-400/10"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-blue-600 shadow-sm shadow-blue-600/20 dark:border-slate-700/60">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={
                    `${activeUser?.firstName ?? ''} ${
                      activeUser?.lastName ?? ''
                    }`.trim() || 'Profile'
                  }
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : loading ? (
                <span className="animate-pulse text-sm font-bold text-white">
                  …
                </span>
              ) : (
                <span className="text-sm font-bold text-white">
                  {getInitials(activeUser?.firstName, activeUser?.lastName)}
                </span>
              )}
            </div>

            <AnimatePresence initial={false}>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                  className="flex-1 truncate text-left"
                >
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {activeUser?.firstName} {activeUser?.lastName}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 capitalize dark:text-slate-400">
                    {activeUser?.accountType ?? 'Member'}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <ChevronDown
              size={15}
              className={`shrink-0 text-slate-500 transition-transform duration-200 dark:text-slate-400 ${
                isProfileDropdownOpen ? 'rotate-180' : ''
              } ${!isHovered ? 'ml-auto' : ''}`}
            />
          </button>

          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className="absolute bottom-full left-0 right-0 z-50 mb-2 overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-xl shadow-slate-900/10 dark:border-white/10 dark:bg-slate-900"
              >
                <div className="border-b border-slate-100 px-4 py-3 dark:border-white/10">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {activeUser?.firstName} {activeUser?.lastName}
                  </p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                    {activeUser?.email}
                  </p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      navigate('/home/profile');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    <User
                      size={15}
                      className="text-slate-500 dark:text-slate-400"
                    />
                    My Profile
                  </button>
                  <button
                    onClick={openAvatarPicker}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    <ImagePlus
                      size={15}
                      className="text-slate-500 dark:text-slate-400"
                    />
                    Upload Avatar
                  </button>
                  <button
                    onClick={() => {
                      navigate('/home/settings');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    <Settings
                      size={15}
                      className="text-slate-500 dark:text-slate-400"
                    />
                    Settings
                  </button>
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
                  >
                    {isDark ? (
                      <Sun size={15} className="text-blue-500" />
                    ) : (
                      <Moon size={15} className="text-blue-500" />
                    )}
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </button>
                </div>
                <div className="border-t border-slate-100 py-1 dark:border-white/10">
                  <button
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-3 px-4 py-2 text-sm text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <LogOut size={15} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>
    </motion.aside>
  );
}