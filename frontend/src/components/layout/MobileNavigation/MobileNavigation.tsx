import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Compass,
  PlusSquare,
  Briefcase,
  User,
  Settings,
  LogOut,
  Sun,
  Moon,
  ImagePlus,
  X,
} from "lucide-react";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useUser } from "../../../features/users/hooks/useUser";

interface MobileNavigationProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const mobileNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: PlusSquare, label: "Post", path: "/create", special: true },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
];

export default function MobileNavigation({ isDark, toggleTheme }: MobileNavigationProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user, loading, uploadAvatar } = useUser();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase() || "U";
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await uploadAvatar(e.target.files[0]);
      setIsProfileMenuOpen(false);
    }
  };

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/75 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-blue-400/20 dark:border-blue-400/20 z-40 pb-[env(safe-area-inset-bottom)] shadow-2xl transition-colors duration-300 overflow-hidden">
        {/* Background lightning (same as before) */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg className="w-full h-full opacity-35 dark:opacity-45" viewBox="0 0 600 64" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <motion.path d="M -20 20 L 80 40 L 140 18 L 220 48 L 290 22 L 370 50 L 450 15 L 530 42 L 620 20" stroke="url(#thunder-blue-mobile-grad)" strokeWidth="1.1" strokeLinecap="round" filter="url(#light-blue-glow-mobile)" initial={{ opacity: 0.25 }} animate={{ opacity: [0.2, 0.6, 0.25, 0.65, 0.2], strokeWidth: [0.9, 1.2, 0.9, 1.3, 1] }} transition={{ duration: 3.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
            <motion.path d="M 140 18 L 170 5 L 200 15 M 370 50 L 400 60 M 450 15 L 480 32" stroke="#93c5fd" strokeWidth="0.75" strokeLinecap="round" opacity="0.3" filter="url(#light-blue-glow-mobile)" initial={{ opacity: 0.1 }} animate={{ opacity: [0.1, 0.5, 0.15, 0.55, 0.1] }} transition={{ duration: 2.6, repeat: Infinity, repeatType: "mirror", delay: 0.4 }} />
          </svg>
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
                    isActive ? "text-blue-600 dark:text-blue-400 font-bold" : "text-slate-500 dark:text-slate-400"
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
                      {isActive && (
                        <motion.div
                          layoutId="mobileActivePill"
                          className="absolute inset-x-2 top-1 bottom-1 bg-blue-500/10 dark:bg-blue-400/15 rounded-xl border border-blue-500/20 dark:border-blue-400/20"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
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

          {/* Profile Avatar */}
          <div className="relative flex flex-col items-center justify-center w-full h-full">
            <button
              onClick={() => setIsProfileMenuOpen(true)}
              className="relative flex flex-col items-center justify-center w-full h-full focus:outline-none"
            >
              <div className="h-9 w-9 rounded-full bg-blue-600 shadow-md shadow-blue-600/20 overflow-hidden border-2 border-white dark:border-slate-700 flex items-center justify-center">
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
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-1">Profile</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ─── Bottom Sheet Profile Menu ─── */}
      <AnimatePresence>
        {isProfileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsProfileMenuOpen(false)}
            />

            {/* Bottom Sheet */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl border-t border-blue-400/20 dark:border-blue-400/20 max-h-[80vh] overflow-y-auto pb-safe"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-blue-600 shadow-md shadow-blue-600/20 overflow-hidden border-2 border-white dark:border-slate-700 flex items-center justify-center">
                    {loading ? (
                      <span className="text-white font-bold text-sm animate-pulse">...</span>
                    ) : user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {getInitials(user?.first_name, user?.last_name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={20} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => { navigate("/profile"); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <User size={18} className="text-slate-500 dark:text-slate-400" />
                  My Profile
                </button>
                <button
                  onClick={() => { fileInputRef.current?.click(); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <ImagePlus size={18} className="text-slate-500 dark:text-slate-400" />
                  Upload Avatar
                </button>
                <button
                  onClick={() => { navigate("/settings"); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <Settings size={18} className="text-slate-500 dark:text-slate-400" />
                  Settings
                </button>
                <button
                  onClick={() => { toggleTheme(); setIsProfileMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {isDark ? (
                    <>
                      <Sun size={18} className="text-yellow-500" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon size={18} className="text-blue-500" />
                      Dark Mode
                    </>
                  )}
                </button>
              </div>

              {/* Logout */}
              <div className="py-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-6 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>

              {/* Safe area bottom padding */}
              <div className="h-4" />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
    </>
  );
}