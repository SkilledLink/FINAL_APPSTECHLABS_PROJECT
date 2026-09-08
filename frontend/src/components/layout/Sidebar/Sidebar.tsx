import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { useAuth } from "../../../features/auth/hooks/useAuth";
import { useUser } from "../../../features/users/hooks/useUser";

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: LayoutDashboard, label: "Portfolio", path: "/portfolio" },
  { icon: MessageSquareMore, label: "Messages", path: "/messages" },
  { icon: Users, label: "Network", path: "/professionals" },
];

export default function Sidebar({ isDark, toggleTheme }: SidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { user, loading, uploadAvatar } = useUser();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      setIsProfileDropdownOpen(false);
    }
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isHovered ? 240 : 76 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ type: "tween", ease: [0.4, 0, 0.2, 1], duration: 0.22 }}
      className="hidden md:flex flex-col h-[calc(100vh-5rem)] sticky top-4 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl text-slate-800 dark:text-slate-100 border border-blue-400/20 dark:border-blue-400/20 z-20 shadow-xl shrink-0 overflow-hidden will-change-[width] transform-gpu"
    >
      {/* Background lightning (same as before) */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden transform-gpu">
        <svg className="w-[240px] h-full opacity-35 dark:opacity-45" viewBox="0 0 240 800" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="light-blue-glow-sidebar" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id="thunder-blue-vert-grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path d="M 38 -20 L 25 120 L 55 190 L 15 310 L 48 420 L 22 550 L 60 670 L 30 820" stroke="url(#thunder-blue-vert-grad)" strokeWidth="1.1" strokeLinecap="round" filter="url(#light-blue-glow-sidebar)" initial={{ opacity: 0.25 }} animate={{ opacity: [0.2, 0.6, 0.25, 0.65, 0.2], strokeWidth: [0.9, 1.2, 0.9, 1.3, 1] }} transition={{ duration: 3.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }} />
          <motion.path d="M 55 190 L 85 220 L 110 205 M 48 420 L 90 460 L 125 440 M 22 550 L 65 580" stroke="#93c5fd" strokeWidth="0.75" strokeLinecap="round" opacity="0.3" filter="url(#light-blue-glow-sidebar)" initial={{ opacity: 0.1 }} animate={{ opacity: [0.1, 0.5, 0.15, 0.55, 0.1] }} transition={{ duration: 2.8, repeat: Infinity, repeatType: "mirror", delay: 0.3 }} />
        </svg>
        <div className="absolute top-1/3 -left-12 w-48 h-48 bg-blue-400/10 dark:bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1.5 px-3 overflow-y-auto no-scrollbar relative z-10">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `relative flex items-center px-3.5 py-3 rounded-xl font-semibold text-sm transition-colors duration-150 group ${
                isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="sidebarActivePill"
                    className="absolute inset-0 bg-blue-500/10 dark:bg-blue-400/15 rounded-xl border border-blue-500/20 dark:border-blue-400/20 shadow-sm"
                    transition={{ type: "tween", duration: 0.2 }}
                  >
                    <span className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 dark:bg-blue-400 rounded-r-full shadow-[0_0_10px_rgba(37,99,235,0.7)]" />
                  </motion.div>
                )}
                <item.icon size={20} className={`shrink-0 z-10 transition-transform duration-150 group-hover:scale-110 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-400"}`} />
                <AnimatePresence initial={false}>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      transition={{ duration: 0.12 }}
                      className="ml-3.5 z-10 whitespace-nowrap overflow-hidden"
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

      {/* ─── User Profile Section (Bottom) ─── */}
      <div className="p-3 border-t border-blue-400/20 dark:border-blue-400/20 relative z-10">
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-blue-500/10 dark:hover:bg-blue-400/10 transition-colors group"
          >
            {/* Avatar */}
            <div className="h-9 w-9 rounded-full bg-blue-600 shadow-md shadow-blue-600/20 overflow-hidden border border-white/40 dark:border-slate-700/60 flex items-center justify-center shrink-0">
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

            {/* Name & Role (visible when expanded) */}
            <AnimatePresence initial={false}>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.12 }}
                  className="flex-1 text-left truncate"
                >
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">Professional</p>
                </motion.div>
              )}
            </AnimatePresence>

            <ChevronDown
              size={16}
              className={`text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-200 ${
                isProfileDropdownOpen ? "rotate-180" : ""
              } ${!isHovered && "ml-auto"}`}
            />
          </button>

          {/* Dropdown menu */}
          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden z-50"
              >
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => { navigate("/profile"); setIsProfileDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <User size={16} className="text-slate-500 dark:text-slate-400" />
                    My Profile
                  </button>
                  <button
                    onClick={() => { fileInputRef.current?.click(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <ImagePlus size={16} className="text-slate-500 dark:text-slate-400" />
                    Upload Avatar
                  </button>
                  <button
                    onClick={() => { navigate("/settings"); setIsProfileDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <Settings size={16} className="text-slate-500 dark:text-slate-400" />
                    Settings
                  </button>
                  {/* Theme Toggle inside dropdown */}
                  <button
                    onClick={() => { toggleTheme(); setIsProfileDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    {isDark ? <Sun size={16} className="text-yellow-500" /> : <Moon size={16} className="text-blue-500" />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </button>
                </div>
                <div className="py-1 border-t border-slate-100 dark:border-slate-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden file input for avatar upload */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>
    </motion.aside>
  );
}