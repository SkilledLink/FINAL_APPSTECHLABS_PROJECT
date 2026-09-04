import React from 'react';
import { Search, Bell, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export default function Header({ isDark, toggleTheme }: HeaderProps) {
  return (
    <header className="h-20 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-blue-400/20 dark:border-blue-400/20 flex items-center justify-between px-6 sm:px-8 z-30 shadow-sm transition-colors duration-300 shrink-0 relative overflow-hidden">
      
      {/* SUBTLE LIGHT BLUE THUNDER / LIGHTNING OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg 
          className="w-full h-full opacity-35 dark:opacity-45" 
          viewBox="0 0 1200 80" 
          preserveAspectRatio="none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Soft Glow Filter */}
            <filter id="light-blue-glow-header" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Faint Gradient Line */}
            <linearGradient id="thunder-blue-grad-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Ultra Thin Main Crackling Line */}
          <motion.path
            d="M -50 15 L 120 45 L 180 25 L 290 60 L 350 35 L 480 65 L 560 20 L 710 55 L 830 25 L 940 60 L 1050 30 L 1250 50"
            stroke="url(#thunder-blue-grad-1)"
            strokeWidth="1.1"
            strokeLinecap="round"
            filter="url(#light-blue-glow-header)"
            initial={{ opacity: 0.3 }}
            animate={{ 
              opacity: [0.25, 0.6, 0.3, 0.7, 0.35],
              strokeWidth: [0.9, 1.2, 0.9, 1.3, 1]
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />

          {/* Secondary Faint Hairline Branch */}
          <motion.path
            d="M 180 25 L 220 5 L 270 18 M 480 65 L 510 85 M 710 55 L 750 75 L 790 65 M 940 60 L 980 78"
            stroke="#93c5fd"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.4"
            filter="url(#light-blue-glow-header)"
            initial={{ opacity: 0.15 }}
            animate={{ opacity: [0.1, 0.5, 0.15, 0.55, 0.1] }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              repeatType: "mirror",
              delay: 0.5
            }}
          />
        </svg>

        {/* Very Faint Light Blue Ambient Glow */}
        <div className="absolute -top-10 left-1/3 w-72 h-24 bg-blue-400/10 dark:bg-blue-500/15 rounded-full blur-3xl" />
      </div>

      {/* Left side: Brand Logo + Search */}
      <div className="flex items-center gap-6 flex-1 z-10 relative">
        
        {/* SkilledLink Brand Name */}
        <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-white shrink-0 select-none">
          Skilled<span className="text-blue-600 dark:text-blue-400">Link</span>
        </span>

        {/* Search Input */}
        <div className="hidden sm:flex items-center max-w-xs md:max-w-md w-full bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-2xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-blue-500/40 transition-all border border-slate-200/60 dark:border-slate-700/60">
          <Search size={18} className="text-slate-400 dark:text-slate-500 shrink-0" />
          <input 
            type="text" 
            placeholder="Search professionals, jobs, services..." 
            className="bg-transparent border-none outline-none ml-2.5 w-full text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 font-medium"
          />
        </div>
      </div>

      {/* Right side: Actions & User Avatar */}
      <div className="flex items-center gap-2.5 sm:gap-3 z-10 relative shrink-0">
        
        {/* Compact Neumorphic Toggle Switch */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label="Toggle dark and light theme"
          className="relative flex items-center w-20 h-7.5 p-0.5 rounded-full bg-slate-200/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-300/70 dark:border-slate-800/80 shadow-[inset_0_1.5px_3px_rgba(0,0,0,0.2)] cursor-pointer transition-colors duration-300 select-none overflow-hidden"
        >
          {/* Background Icons */}
          <div className="absolute inset-0 flex items-center justify-between px-2 text-slate-400 dark:text-slate-500 z-0 pointer-events-none">
            <Sun size={11} className={!isDark ? 'opacity-0' : 'opacity-100'} />
            <Moon size={11} className={isDark ? 'opacity-0' : 'opacity-100'} />
          </div>

          {/* Sliding Knob */}
          <motion.div
            className="w-9 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md flex items-center justify-center text-blue-600 dark:text-blue-400 z-10 border border-slate-100 dark:border-slate-700"
            animate={{
              x: isDark ? 36 : 0,
            }}
            transition={{
              type: "spring",
              stiffness: 450,
              damping: 32
            }}
          >
            {isDark ? (
              <Moon size={12} className="fill-blue-400/20" />
            ) : (
              <Sun size={12} className="fill-blue-600/20" />
            )}
          </motion.div>
        </button>

        {/* Notifications */}
        <button className="p-2 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-800/60 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-all relative border border-transparent hover:border-white/50 dark:hover:border-slate-700/50">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
        </button>
        
        {/* User Profile Avatar */}
        <div className="h-9 w-9 rounded-full bg-blue-600 p-0.5 shadow-md shadow-blue-600/20 cursor-pointer overflow-hidden border border-white/40 dark:border-slate-700/60 ml-0.5">
          <img 
            src="https://ui-avatars.com/api/?name=User&background=2563eb&color=fff" 
            alt="Profile" 
            className="rounded-lg w-full h-full object-cover" 
          />
        </div>
      </div>
    </header>
  );
}