import React from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Compass,
  Briefcase,
  Users,
  LayoutDashboard,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const navItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: LayoutDashboard, label: "Portfolio", path: "/portfolio" },
  { icon: Users, label: "Network", path: "/professionals" },
];

export default function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      className="hidden md:flex flex-col h-full bg-purple-900 text-white-200 relative border-r border-purple-900/50 z-30 shadow-2xl transition-all duration-300 ease-in-out"
    >
      <div className="h-16 flex items-center justify-between px-6 border-b border-purple-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/50 shrink-0">
            N
          </div>
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="font-bold text-white tracking-wide text-sm whitespace-nowrap overflow-hidden"
            >
              Professional Net
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <nav className="flex-1 py-6 flex flex-col gap-1.5 px-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
                isActive
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50 ring-1 ring-purple-400/30"
                  : "hover:bg-purple-900/40 hover:text-white text-purple-300/80"
              }`
            }
          >
            <item.icon
              size={20}
              className="shrink-0 transition-transform group-hover:scale-110"
            />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="ml-3.5 whitespace-nowrap overflow-hidden"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-purple-900/40">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isActive
                ? "bg-purple-600 text-white shadow-lg shadow-purple-900/50 ring-1 ring-purple-400/30"
                : "hover:bg-purple-900/40 hover:text-white text-purple-300/80"
            }`
          }
        >
          <Settings
            size={20}
            className="shrink-0 transition-transform group-hover:rotate-45"
          />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="ml-3.5 whitespace-nowrap overflow-hidden"
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>
      </div>

      <button
        onClick={toggleSidebar}
        className="absolute -right-3.5 top-20 bg-purple-800 text-purple-200 rounded-full p-1.5 border border-purple-700 hover:bg-purple-700 hover:text-white shadow-xl transition-all"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>
    </motion.aside>
  );
}
