import { NavLink } from "react-router-dom";
import { Home, Compass, Plus, Briefcase, Settings } from "lucide-react";
import { motion } from "framer-motion";

const mobileNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: Plus, label: "Post", path: "/create", special: true },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export default function MobileNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#12131A]/95 backdrop-blur-xl border-t border-slate-800/80 z-50 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full group transition-colors ${
                  isActive ? "text-purple-400" : "text-slate-400 hover:text-slate-200"
                }`
              }
            >
              {({ isActive }) => {
                if (item.special) {
                  return (
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      className="absolute -top-5 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white p-3.5 rounded-2xl shadow-lg shadow-purple-600/40 border-2 border-[#12131A] flex items-center justify-center"
                    >
                      <Icon size={20} className="stroke-[2.5]" />
                    </motion.div>
                  );
                }

                return (
                  <div className="flex flex-col items-center justify-center space-y-1 relative w-full h-full pt-1">
                    <motion.div whileTap={{ scale: 0.85 }} className="relative">
                      <Icon size={20} className={isActive ? "stroke-[2.5]" : "stroke-[1.75]"} />
                      {isActive && (
                        <motion.span
                          layoutId="activeIndicator"
                          className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-purple-400 rounded-full"
                        />
                      )}
                    </motion.div>
                    <span
                      className={`text-[10px] font-medium tracking-tight ${
                        isActive ? "text-purple-400 font-semibold" : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </span>
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