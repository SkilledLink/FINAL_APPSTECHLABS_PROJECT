import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, PlusSquare, Briefcase, User } from 'lucide-react';
import { motion } from 'framer-motion';

const mobileNavItems = [
  { icon: Home, label: 'Home', path: '/' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: PlusSquare, label: 'Post', path: '/create', special: true },
  { icon: Briefcase, label: 'Jobs', path: '/jobs' },
  { icon: User, label: 'Profile', path: '/profile' },
];

export default function MobileNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/75 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-blue-400/20 dark:border-blue-400/20 z-50 pb-[env(safe-area-inset-bottom)] shadow-2xl transition-colors duration-300 overflow-hidden">
      
      {/* SUBTLE LIGHT BLUE THUNDER HORIZONTAL OVERLAY */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <svg 
          className="w-full h-full opacity-35 dark:opacity-45" 
          viewBox="0 0 600 64" 
          preserveAspectRatio="none"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <filter id="light-blue-glow-mobile" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="thunder-blue-mobile-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Thin Horizontal Lightning Line 1 */}
          <motion.path
            d="M -20 20 L 80 40 L 140 18 L 220 48 L 290 22 L 370 50 L 450 15 L 530 42 L 620 20"
            stroke="url(#thunder-blue-mobile-grad)"
            strokeWidth="1.1"
            strokeLinecap="round"
            filter="url(#light-blue-glow-mobile)"
            initial={{ opacity: 0.25 }}
            animate={{ 
              opacity: [0.2, 0.6, 0.25, 0.65, 0.2],
              strokeWidth: [0.9, 1.2, 0.9, 1.3, 1]
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          />

          {/* Secondary Hairline Branch Line 2 */}
          <motion.path
            d="M 140 18 L 170 5 L 200 15 M 370 50 L 400 60 M 450 15 L 480 32"
            stroke="#93c5fd"
            strokeWidth="0.75"
            strokeLinecap="round"
            opacity="0.3"
            filter="url(#light-blue-glow-mobile)"
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.5, 0.15, 0.55, 0.1] }}
            transition={{
              duration: 2.6,
              repeat: Infinity,
              repeatType: "mirror",
              delay: 0.4
            }}
          />
        </svg>

        {/* Ambient Glow Blob */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-64 h-16 bg-blue-400/10 dark:bg-blue-500/15 rounded-full blur-2xl" />
      </div>

      {/* Navigation Items */}
      <div className="flex justify-around items-center h-16 px-2 relative z-10">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                }`
              }
            >
              {({ isActive }) => {
                if (item.special) {
                  return (
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="bg-blue-600 text-white p-3.5 rounded-2xl shadow-lg shadow-blue-600/30 -mt-5 border-4 border-[#f0f4f8] dark:border-[#0b1329] z-20"
                    >
                      <Icon size={22} />
                    </motion.div>
                  );
                }

                return (
                  <div className="relative flex flex-col items-center justify-center w-full h-full py-1">
                    {/* Active Pill Accent Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="mobileActivePill"
                        className="absolute inset-x-2 top-1 bottom-1 bg-blue-500/10 dark:bg-blue-400/15 rounded-xl border border-blue-500/20 dark:border-blue-400/20"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}

                    <motion.div whileTap={{ scale: 0.9 }} className="z-10">
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>
                    <span className="text-[10px] font-semibold z-10">{item.label}</span>
                  </div>
                );
              }}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}