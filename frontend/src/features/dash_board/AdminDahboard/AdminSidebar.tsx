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
} from "lucide-react";

import { NavLink } from "react-router-dom";

interface AdminSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Workers",
    path: "/admin/workers",
    icon: UserCheck,
  },
  {
    label: "Posts",
    path: "/admin/posts",
    icon: FileText,
  },
  {
    label: "Jobs",
    path: "/admin/jobs",
    icon: BriefcaseBusiness,
  },
];

const moderation = [
  {
    label: "Reports",
    path: "/admin/reports",
    icon: ShieldCheck,
  },
  {
    label: "Verification",
    path: "/admin/verification",
    icon: UserCheck,
  },
];

const system = [
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
  {
    label: "System Center",
    path: "/admin/system",
    icon: Activity,
  },
];

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: AdminSidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50
          flex h-screen w-[270px]
          flex-col
          border-r border-slate-200
          bg-white
          transition-transform duration-300
          lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-lg shadow-blue-600/20">
              SK
            </div>

            <div>
              <h1 className="text-[15px] font-bold tracking-tight text-slate-900">
                SKILLED LINK
              </h1>

              <p className="text-[10px] font-medium text-slate-400">
                Connect · Work · Grow
              </p>
            </div>
          </div>

          <button
            onClick={onMobileClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-4">
          <div className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search size={16} className="text-slate-400" />

            <input
              placeholder="Search menu..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            <span className="hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[9px] text-slate-400 sm:block">
              SK
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          <NavSection title="">
            {navigation.map((item) => (
              <SidebarLink key={item.path} {...item} onClick={onMobileClose} />
            ))}
          </NavSection>

          <NavSection title="MODERATION">
            {moderation.map((item) => (
              <SidebarLink key={item.path} {...item} onClick={onMobileClose} />
            ))}
          </NavSection>

          <NavSection title="SYSTEM">
            {system.map((item) => (
              <SidebarLink key={item.path} {...item} onClick={onMobileClose} />
            ))}
          </NavSection>
        </nav>

        {/* Admin profile */}
        <div className="border-t border-slate-100 p-4">
          <div className="flex cursor-pointer items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                AD
              </div>

              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">
                Administrator
              </p>

              <p className="text-[11px] text-slate-400">Super Admin</p>
            </div>

            <ChevronRight size={15} className="text-slate-400" />
          </div>
        </div>
      </aside>
    </>
  );
}

function NavSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {title && (
        <p className="mb-2 px-3 text-[10px] font-semibold tracking-wider text-slate-400">
          {title}
        </p>
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
}: {
  label: string;
  path: string;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <NavLink
      to={path}
      end={path === "/admin"}
      onClick={onClick}
      className={({ isActive }) =>
        `
        group relative flex h-11 items-center gap-3 rounded-lg px-3
        text-sm font-medium transition-all duration-200
        ${
          isActive
            ? "bg-blue-50 text-blue-600"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
        }
        `
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span className="absolute left-0 h-6 w-0.5 rounded-r-full bg-blue-600" />
          )}

          <Icon
            size={18}
            strokeWidth={isActive ? 2.4 : 2}
            className={
              isActive
                ? "text-blue-600"
                : "text-slate-500 group-hover:text-slate-800"
            }
          />

          <span>{label}</span>

          {(label === "Posts" || label === "Jobs" || label === "Reports") && (
            <ChevronRight size={14} className="ml-auto text-slate-300" />
          )}
        </>
      )}
    </NavLink>
  );
}
