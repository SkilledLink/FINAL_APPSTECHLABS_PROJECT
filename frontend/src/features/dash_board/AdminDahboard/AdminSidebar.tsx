import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  Settings,
  Activity,
  UserCheck,
  Search,
  ChevronRight,
  X,
  Sun,
  Moon,
} from "lucide-react";
import { NavLink } from "react-router-dom";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Workers", path: "/admin/workers", icon: UserCheck },
  { label: "Posts", path: "/admin/posts", icon: FileText },
  { label: "Jobs", path: "/admin/jobs", icon: BriefcaseBusiness },
];

const moderation = [
  { label: "Reports", path: "/admin/reports", icon: ShieldCheck },
  { label: "Verification", path: "/admin/verification", icon: UserCheck },
];

const system = [
  { label: "Settings", path: "/admin/settings", icon: Settings },
  { label: "System Center", path: "/admin/system", icon: Activity },
];

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Theme state: checks local storage or defaults to light mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  // Determines if the sidebar should show full text (mobile open OR desktop hover)
  const isExpanded = mobileOpen || isHovered;

  // Effect to toggle the 'dark' class on the HTML document element
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`
          fixed left-0 top-0 z-50
          flex h-screen
          flex-col
          border-r border-slate-200 dark:border-slate-800
          bg-white dark:bg-slate-950
          transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0 w-[270px]" : "-translate-x-full lg:translate-x-0"}
          ${isHovered ? "lg:w-[270px]" : "lg:w-[80px]"}
        `}
      >
        {/* Logo Area */}
        <div className={`flex h-[76px] items-center border-b border-slate-100 dark:border-slate-800 transition-all ${isExpanded ? "justify-between px-6" : "justify-center px-0"}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
              SK
            </div>

            {isExpanded && (
              <div className="whitespace-nowrap transition-opacity duration-300">
                <h1 className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-white">
                  SKILLED LINK
                </h1>
                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  Connect · Work · Grow
                </p>
              </div>
            )}
          </div>

          {isExpanded && (
            <button
              onClick={onMobileClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Search */}
        <div className={`py-4 transition-all ${isExpanded ? "px-4" : "px-3"}`}>
          <div className={`flex h-10 items-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 transition-all ${isExpanded ? "gap-2 px-3" : "justify-center px-0"}`}>
            <Search size={16} className="shrink-0 text-slate-400" />
            
            {isExpanded && (
              <>
                <input
                  placeholder="Search menu..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400 dark:text-white"
                />
                <span className="hidden rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-1.5 py-0.5 text-[9px] text-slate-400 sm:block">
                  SK
                </span>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-4 scrollbar-hide">
          <NavSection title="" isExpanded={isExpanded}>
            {navigation.map((item) => (
              <SidebarLink key={item.path} {...item} onClick={onMobileClose} isExpanded={isExpanded} />
            ))}
          </NavSection>

          <NavSection title="MODERATION" isExpanded={isExpanded}>
            {moderation.map((item) => (
              <SidebarLink key={item.path} {...item} onClick={onMobileClose} isExpanded={isExpanded} />
            ))}
          </NavSection>

          <NavSection title="SYSTEM" isExpanded={isExpanded}>
            {system.map((item) => (
              <SidebarLink key={item.path} {...item} onClick={onMobileClose} isExpanded={isExpanded} />
            ))}
          </NavSection>
        </nav>

        {/* Theme Toggle & Profile Area */}
        <div className="mt-auto border-t border-slate-100 dark:border-slate-800 p-3">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`mb-2 flex h-11 w-full items-center gap-3 rounded-lg text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200 ${isExpanded ? "px-3" : "justify-center"}`}
            title="Toggle Theme"
          >
            {isDarkMode ? <Moon size={18} className="shrink-0" /> : <Sun size={18} className="shrink-0" />}
            {isExpanded && <span className="text-sm font-medium whitespace-nowrap">Dark Mode</span>}
          </button>

          {/* Admin Profile */}
          <div className={`flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-900/50 ${!isExpanded && "justify-center"}`}>
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                AD
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-500" />
            </div>

            {isExpanded && (
              <>
                <div className="min-w-0 flex-1 whitespace-nowrap">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Administrator
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Super Admin</p>
                </div>
                <ChevronRight size={15} className="text-slate-400" />
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}

// ---------------- Helper Components ----------------

function NavSection({
  title,
  isExpanded,
  children,
}: {
  title: string;
  isExpanded: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {title && isExpanded && (
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400 dark:text-slate-500 whitespace-nowrap transition-opacity">
          {title}
        </p>
      )}
      {/* Small divider line when collapsed to separate sections */}
      {title && !isExpanded && (
        <div className="mx-4 my-3 h-px bg-slate-200 dark:bg-slate-800" />
      )}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function SidebarLink({
  label,
  path,
  icon: Icon,
  onClick,
  isExpanded,
}: {
  label: string;
  path: string;
  icon: React.ElementType;
  onClick: () => void;
  isExpanded: boolean;
}) {
  return (
    <NavLink
      to={path}
      end={path === "/admin"}
      onClick={onClick}
      className={({ isActive }) =>
        `
        group relative flex h-11 items-center rounded-lg transition-all duration-200
        ${isExpanded ? "gap-3 px-3" : "justify-center px-0"}
        ${
          isActive
            ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200"
        }
        `
      }
      title={!isExpanded ? label : undefined}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 h-6 w-0.5 rounded-r-full bg-blue-600 dark:bg-blue-500" />
          )}

          <Icon
            size={18}
            strokeWidth={isActive ? 2.4 : 2}
            className={`shrink-0 transition-colors ${
              isActive
                ? "text-blue-600 dark:text-blue-500"
                : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"
            }`}
          />

          {isExpanded && (
            <>
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              {(label === "Posts" || label === "Jobs" || label === "Reports") && (
                <ChevronRight size={14} className="ml-auto text-slate-300 dark:text-slate-600" />
              )}
            </>
          )}
        </>
        
      )}
    </NavLink>
  );
}