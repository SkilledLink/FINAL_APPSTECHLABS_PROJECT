import { NavLink } from "react-router-dom";
import { Home, Compass, PlusSquare, Briefcase, User } from "lucide-react";
import { motion } from "framer-motion";

const mobileNavItems = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Compass, label: "Discover", path: "/discover" },
  { icon: PlusSquare, label: "Post", path: "/create", special: true },
  { icon: Briefcase, label: "Jobs", path: "/jobs" },
  { icon: User, label: "Profile", path: "/profile" },
];

export default function MobileNavigation() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1e1035] border-t border-purple-900/50 z-50 pb-[env(safe-area-inset-bottom)] shadow-2xl">
      <div className="flex justify-around items-center h-16 px-2">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? "text-purple-400" : "text-purple-300/60"
                }`
              }
            >
              {({ isActive }) => {
                if (item.special) {
                  return (
                    <motion.div
                      whileTap={{ scale: 0.9 }}
                      className="bg-linear-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-2xl shadow-lg shadow-purple-900/50 -mt-5 border-4 border-[#1e1035]"
                    >
                      <Icon size={22} />
                    </motion.div>
                  );
                }

                return (
                  <div className="flex flex-col items-center justify-center space-y-1">
                    <motion.div whileTap={{ scale: 0.9 }}>
                      <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </motion.div>
                    <span className="text-[10px] font-medium">
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
