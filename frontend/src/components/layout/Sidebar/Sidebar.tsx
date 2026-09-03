import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  Compass,
  Briefcase,
  Users,
  LayoutDashboard,
  Settings,
  LogOut,
  Moon,
  Sun,
  Network,
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: LayoutDashboard, label: "Portfolio", path: "/portfolio" },
  { icon: Users, label: "Professionals", path: "/professionals" },
];

export default function Sidebar() {
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <motion.aside
      initial={false}
      animate={{ width: isHovered ? 264 : 76 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
      className={`hidden md:flex flex-col h-full relative border-r z-30 shadow-xl select-none transition-colors duration-300 ${
        isDarkMode
          ? "bg-[#12131A] text-slate-200 border-slate-800"
          : "bg-white text-slate-700 border-slate-100"
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 gap-3 overflow-hidden shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-purple-500/25 shrink-0">
          <Network size={20} />
        </div>
        <AnimatePresence mode="wait">
          {isHovered && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="font-extrabold tracking-tight text-sm uppercase bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent"
            >
              SkilledLink
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 py-3 flex flex-col gap-1.5 px-3 overflow-y-auto overflow-x-hidden scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex items-center h-11 px-3.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
                  isActive
                    ? isDarkMode
                      ? "bg-purple-950/60 text-purple-400 font-semibold shadow-inner"
                      : "bg-purple-50 text-purple-600 font-semibold shadow-xs"
                    : isDarkMode
                    ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center justify-center w-5 h-5 shrink-0">
                    <Icon size={18} className="transition-transform duration-200 group-hover:scale-110" />
                  </div>

                  <AnimatePresence mode="wait">
                    {isHovered && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ duration: 0.2 }}
                        className="ml-3.5 whitespace-nowrap overflow-hidden text-sm tracking-tight"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Top-notch curved active indicator edge pill */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute right-0 w-1.5 h-6 bg-purple-600 rounded-l-full shadow-sm shadow-purple-500/50"
                    />
                  )}

                  {/* Tooltip for collapsed view */}
                  {!isHovered && (
                    <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Utilities Section */}
      <div className={`p-3 border-t flex flex-col gap-1.5 shrink-0 ${isDarkMode ? "border-slate-800" : "border-slate-100"}`}>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `relative flex items-center h-11 px-3.5 rounded-xl font-medium text-sm transition-all duration-200 group ${
              isActive
                ? "bg-purple-50 text-purple-600 font-semibold"
                : isDarkMode
                ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <div className="flex items-center justify-center w-5 h-5 shrink-0">
                <Settings size={18} className="transition-transform duration-300 group-hover:rotate-45" />
              </div>
              <AnimatePresence mode="wait">
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="ml-3.5 whitespace-nowrap overflow-hidden text-sm"
                  >
                    Settings
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <div className="absolute right-0 w-1.5 h-6 bg-purple-600 rounded-l-full shadow-sm shadow-purple-500/50" />
              )}
              {!isHovered && (
                <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  Settings
                </div>
              )}
            </>
          )}
        </NavLink>

        <button
          onClick={() => {}}
          className={`relative flex items-center h-11 w-full px-3.5 rounded-xl font-medium text-sm transition-all duration-200 group cursor-pointer ${
            isDarkMode
              ? "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <div className="flex items-center justify-center w-5 h-5 shrink-0">
            <LogOut size={18} />
          </div>
          <AnimatePresence mode="wait">
            {isHovered && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                className="ml-3.5 whitespace-nowrap overflow-hidden text-sm"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
          {!isHovered && (
            <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>

        {/* Theme Mode Toggle Switch */}
        <div className={`relative flex items-center justify-between h-11 px-3.5 rounded-xl font-medium text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
          <div className="flex items-center gap-3.5 overflow-hidden">
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} className="text-amber-500" />}
            </div>
            <AnimatePresence mode="wait">
              {isHovered && (
                <motion.span
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden text-xs font-semibold"
                >
                  Dark Mode
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Toggle Switch */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-9 h-5 flex items-center rounded-full p-1 transition-colors duration-300 cursor-pointer shrink-0 ${
              isDarkMode ? "bg-purple-600" : "bg-slate-300"
            }`}
          >
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="w-3.5 h-3.5 bg-white rounded-full shadow-md"
              animate={{ x: isDarkMode ? 16 : 0 }}
            />
          </button>
        </div>
      </div>
    </motion.aside>
  );
}