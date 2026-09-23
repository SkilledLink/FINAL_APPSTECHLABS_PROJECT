import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Rss,
  Briefcase,
  Users,
  ShieldCheck,
  AlertTriangle,
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
  | 'audit_logs'
  | 'administrators'
  | 'contact_messages';

interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
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
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobile, isMobileOpen]);

  const handleBackToHome = () => {
    if (isMobile && onMobileClose) onMobileClose();
    navigate('/home');
  };

  const content = (
    <>
      <div className={`p-4 border-b border-gray-200 dark:border-slate-800 ${isCollapsed && !isMobile ? 'text-center' : ''}`}>
        {isCollapsed && !isMobile ? (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
              S
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white flex-shrink-0">
              S
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">Servio Admin</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">Control Center</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3">
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
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                    active
                      ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-slate-200'}`}>
                    {item.icon}
                  </span>

                  {(!isCollapsed || isMobile) && (
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  )}

                  {(!isCollapsed || isMobile) && item.badge && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && !isMobile && item.badge && (
                    <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 dark:bg-slate-800">
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative text-gray-700 hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-950/40 dark:hover:text-blue-400"
          title="Back to Home"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-5 h-5 flex-shrink-0" />

          {(!isCollapsed || isMobile) && (
            <span className="flex-1 text-left text-sm font-medium">Back to Home</span>
          )}

          {isCollapsed && !isMobile && (
            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 dark:bg-slate-800">
              Back to Home
            </div>
          )}
        </button>
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
          {(!isCollapsed || isMobile) && (
            <div className="ml-auto flex items-center gap-1">
              {isMobile && (
                <button
                  onClick={onMobileClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
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
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
        <div
          className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col overflow-hidden">{content}</div>
        </div>
      </>
    );
  }

  return (
    <aside
      className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-full dark:bg-slate-900 dark:border-slate-800 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {content}
    </aside>
  );
};

export default AdminSidebar;