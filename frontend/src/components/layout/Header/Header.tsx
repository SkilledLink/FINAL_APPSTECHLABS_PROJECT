import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useUser } from '../../../features/profile/hooks/useUser';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user, loading, uploadAvatar } = useUser();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || "U";
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadAvatar(e.target.files[0]);
      setIsDropdownOpen(false);
    }
  };

  return (
    <header className="h-20 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-blue-400/20 dark:border-blue-400/20 flex items-center justify-between px-6 sm:px-8 z-30 shadow-sm transition-colors duration-300 shrink-0 relative overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg className="w-full h-full opacity-35 dark:opacity-45" viewBox="0 0 1200 80" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="light-blue-glow-header" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="thunder-blue-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path d="M -50 15 L 120 45 L 180 25 L 290 60 L 350 35 L 480 65 L 560 20 L 710 55 L 830 25 L 940 60 L 1050 30 L 1250 50" stroke="url(#thunder-blue-grad-1)" strokeWidth="1.1" strokeLinecap="round" filter="url(#light-blue-glow-header)" initial={{ opacity: 0.3 }} animate={{ opacity: [0.25, 0.6, 0.3, 0.7, 0.35], strokeWidth: [0.9, 1.2, 0.9, 1.3, 1] }} transition={{ duration: 3.5, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
          <motion.path d="M 180 25 L 220 5 L 270 18 M 480 65 L 510 85 M 710 55 L 750 75 L 790 65 M 940 60 L 980 78" stroke="#93c5fd" strokeWidth="0.75" strokeLinecap="round" opacity="0.4" filter="url(#light-blue-glow-header)" initial={{ opacity: 0.15 }} animate={{ opacity: [0.1, 0.5, 0.15, 0.55, 0.1] }} transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror", delay: 0.5 }} />
        </svg>
        <div className="absolute -top-10 left-1/3 w-72 h-24 bg-blue-400/10 dark:bg-blue-500/15 rounded-full blur-3xl" />
      </div>

      <div className="flex items-center gap-6 flex-1 z-10 relative">
        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white shrink-0 select-none">
          Skilled<span className="text-blue-600 dark:text-blue-400">Link</span>
        </span>
        <div className="hidden sm:flex items-center max-w-xs md:max-w-md w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/40 transition-all border border-slate-200/60 dark:border-slate-700/60">
          <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <input type="text" placeholder="Search professionals, jobs, services..." className="bg-transparent border-none outline-none ml-2.5 w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium" />
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 z-10 relative shrink-0">
        
        <button type="button" onClick={toggleTheme} aria-label="Toggle dark and light theme" className="relative flex items-center w-20 h-7.5 p-0.5 rounded-full bg-slate-200/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-300/70 dark:border-slate-800/80 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.2)] cursor-pointer transition-colors duration-300 select-none overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-between px-2 text-slate-400 dark:text-slate-500 z-0 pointer-events-none">
            <Sun size={11} className={!isDark ? 'opacity-0' : 'opacity-100'} />
            <Moon size={11} className={isDark ? 'opacity-0' : 'opacity-100'} />
          </div>
          <motion.div className="w-9 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400 z-10 border border-slate-100 dark:border-slate-700" animate={{ x: isDark ? 36 : 0 }} transition={{ type: "spring", stiffness: 450, damping: 32 }}>
            {isDark ? <Moon size={12} className="fill-blue-400/20" /> : <Sun size={12} className="fill-blue-600/20" />}
          </motion.div>
        </button>

        <button className="p-2 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all relative border border-transparent hover:border-white/50 dark:hover:border-slate-700/50">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>
        
        <div className="relative" ref={dropdownRef}>
          <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center gap-1.5 p-1 rounded-full border border-transparent hover:border-white/50 dark:hover:border-slate-700/50 transition-all">
            <div className="h-9 w-9 rounded-full bg-blue-600 shadow-md shadow-blue-600/20 overflow-hidden border border-white/40 dark:border-slate-700/60 flex items-center justify-center">
              {loading ? (
                <span className="text-white font-bold text-sm animate-pulse">...</span>
              ) : user?.avatar_url ? (
                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {getInitials(user?.first_name, user?.last_name)}
                </span>
              )}
            </div>
            <ChevronDown size={14} className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 mt-3 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <User size={16} className="text-slate-500 dark:text-slate-400" />
                    My Profile
                  </button>
                  <button onClick={() => { fileInputRef.current?.click(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <ImagePlus size={16} className="text-slate-500 dark:text-slate-400" />
                    Upload Avatar
                  </button>
                  <button onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                    <Settings size={16} className="text-slate-500 dark:text-slate-400" />
                    Settings
                  </button>
                </div>
                <div className="py-1 border-t border-slate-100 dark:border-slate-700">
                  <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        </div>
      </div>
    </header>
  );
}