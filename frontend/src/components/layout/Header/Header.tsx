import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Sun, Moon, ChevronDown, User, Settings, LogOut, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { useUser } from '../../../features/profile/hooks/useUser';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search logic
    console.log("Searching for:", searchQuery);
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="h-20 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-blue-400/20 dark:border-blue-400/20 flex items-center justify-between px-6 sm:px-8 z-30 shadow-sm transition-colors duration-300 shrink-0 relative overflow-hidden">
        {/* Background lightning (keep as is) */}
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

        {/* Logo */}
        <div className="flex items-center gap-6 flex-1 z-10 relative">
          <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white shrink-0 select-none">
            Skilled<span className="text-blue-600 dark:text-blue-400">Link</span>
          </Link>
        </div>

        {/* Right side: Search icon + Bell */}
        <div className="flex items-center gap-2.5 sm:gap-3 z-10 relative shrink-0">
          {/* Search Icon */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all relative border border-transparent hover:border-white/50 dark:hover:border-slate-700/50"
          >
            <Search size={20} />
          </button>

          {/* Bell */}
          <button className="p-2 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all relative border border-transparent hover:border-white/50 dark:hover:border-slate-700/50">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>
        </div>
      </header>

      {/* ─── Full‑screen Search Modal ─── */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl flex items-start justify-center pt-20 px-4"
          >
            <div className="w-full max-w-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Search</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={24} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search professionals, jobs, services..."
                  className="w-full px-6 py-4 text-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-blue-400/50"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  <Search size={20} />
                </button>
              </form>

              {/* Optional: Recent searches / suggestions */}
              <div className="mt-8 text-slate-500 dark:text-slate-400 text-sm">
                <p className="font-semibold mb-2">Recent searches</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">UI/UX Designer</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">React Developer</span>
                  <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full">Remote Jobs</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}