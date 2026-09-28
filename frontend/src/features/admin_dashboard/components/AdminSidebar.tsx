// src/features/admin/components/AdminSidebar.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Rss,
  Briefcase,
  Users,
  ShieldCheck,
  AlertTriangle,
  Flag,
  Crown,
  Wallet,
  ScrollText,
  UserCog,
  Mail,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowLeft,
} from 'lucide-react';

export type AdminTab =
  | 'overview'
  | 'feeds'
  | 'jobs'
  | 'users'
  | 'professionals'
  | 'moderation'
  | 'reports'
  | 'tiers'
  | 'payments'
  | 'audit_logs'
  | 'administrators'
  | 'contact_messages';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  section?: 'content' | 'monetization' | 'system';
}

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'feeds', label: 'Feeds', icon: <Rss className="w-5 h-5" /> },
  { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'professionals', label: 'Professionals', icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'moderation', label: 'Moderation', icon: <AlertTriangle className="w-5 h-5" />, badge: 27 },
  { id: 'reports', label: 'Reports', icon: <Flag className="w-5 h-5" /> },
  { id: 'tiers', label: 'Subscription tiers', icon: <Crown className="w-5 h-5" /> },
  { id: 'payments', label: 'Payments', icon: <Wallet className="w-5 h-5" /> },
  { id: 'audit_logs', label: 'Audit Logs', icon: <ScrollText className="w-5 h-5" /> },
  { id: 'administrators', label: 'Administrators', icon: <UserCog className="w-5 h-5" /> },
  { id: 'contact_messages', label: 'Contact Messages', icon: <Mail className="w-5 h-5" /> },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
  isMobile = false,
}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) onMobileClose();
    };
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isMobileOpen, onMobileClose]);

  useEffect(() => {
    if (isMobile && isMobileOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileOpen]);

  const handleBackToHome = () => {
    if (isMobile && onMobileClose) onMobileClose();
    navigate('/home');
  };

  const content = (
    <>
      <div
        className={`border-b border-gray-200 p-4 dark:border-slate-800 ${
          isCollapsed && !isMobile ? 'text-center' : ''
        }`}
      >
        {isCollapsed && !isMobile ? (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
              S
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
              S
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-gray-900 dark:text-slate-100">
                Servio Admin
              </p>
              <p className="truncate text-xs text-gray-500 dark:text-slate-400">
                Control Center
              </p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => {
                    onTabChange(item.id);
                    if (isMobile && onMobileClose) onMobileClose();
                  }}
                  className={`group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span
                    className={`flex-shrink-0 ${
                      active
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-gray-500 group-hover:text-gray-700 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                  >
                    {item.icon}
                  </span>

                  {(!isCollapsed || isMobile) && (
                    <span className="flex-1 truncate text-left text-sm font-medium">
                      {item.label}
                    </span>
                  )}

                  {(!isCollapsed || isMobile) && item.badge && (
                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs font-medium text-white">
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && !isMobile && item.badge && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs font-medium text-white">
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && !isMobile && (
                    <div className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-sm text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:bg-slate-800">
                      {item.label}
                      {item.badge ? ` (${item.badge})` : ''}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back to Home */}
      <div className="px-3 pb-3">
        <button
          onClick={handleBackToHome}
          className="group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
          title="Back to Home"
          aria-label="Back to Home"
        >
          <ArrowLeft className="h-5 w-5 flex-shrink-0" />
          {(!isCollapsed || isMobile) && (
            <span className="flex-1 text-left text-sm font-medium">
              Back to Home
            </span>
          )}
          {isCollapsed && !isMobile && (
            <div className="invisible absolute left-full z-50 ml-2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-sm text-white opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100 dark:bg-slate-800">
              Back to Home
            </div>
          )}
        </button>
      </div>

      <div className="border-t border-gray-200 p-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {isCollapsed ? (
                <ChevronRight className="h-5 w-5" />
              ) : (
                <ChevronLeft className="h-5 w-5" />
              )}
            </button>
          )}
          {(!isCollapsed || isMobile) && (
            <div className="ml-auto flex items-center gap-1">
              {isMobile && (
                <button
                  onClick={onMobileClose}
                  className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );

  if (isMobile) {
    return (
      <>
        {isMobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-300"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
        <div
          className={`fixed bottom-0 left-0 top-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-full flex-col overflow-hidden">{content}</div>
        </div>
      </>
    );
  }

  return (
    <aside
      className={`flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-900 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {content}
    </aside>
  );
};

export default AdminSidebar;