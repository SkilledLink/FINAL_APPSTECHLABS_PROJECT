import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Rss,
  Briefcase,
  Users,
  ShieldCheck,
  AlertTriangle,
  ScrollText,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

export type ModeratorTab =
  | 'overview'
  | 'moderation'
  | 'feeds'
  | 'users'
  | 'professionals'
  | 'jobs'
  | 'audit_logs';

interface NavItem {
  id: ModeratorTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface ModeratorSidebarProps {
  activeTab: ModeratorTab;
  onTabChange: (tab: ModeratorTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

const navItems: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'moderation', label: 'Moderation', icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 'feeds', label: 'Feeds', icon: <Rss className="w-5 h-5" /> },
  { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
  { id: 'professionals', label: 'Professionals', icon: <ShieldCheck className="w-5 h-5" /> },
  { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5" /> },
  { id: 'audit_logs', label: 'My Activity', icon: <ScrollText className="w-5 h-5" /> },
];

export const ModeratorSidebar: React.FC<ModeratorSidebarProps> = ({
  activeTab, onTabChange, isCollapsed = false, onToggleCollapse,
  isMobileOpen = false, onMobileClose, isMobile = false,
}) => {
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

  const content = (
    <>
      <div className={`p-4 border-b border-gray-200 ${isCollapsed && !isMobile ? 'text-center' : ''}`}>
        {isCollapsed && !isMobile ? (
          <div className="flex justify-center">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white">M</div>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-sm font-bold text-white flex-shrink-0">M</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">Servio Moderator</p>
              <p className="text-xs text-gray-500 truncate">Review Center</p>
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
                    active ? 'bg-emerald-50 text-emerald-600' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`flex-shrink-0 ${active ? 'text-emerald-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                    {item.icon}
                  </span>
                  {(!isCollapsed || isMobile) && (
                    <span className="flex-1 text-left text-sm font-medium">{item.label}</span>
                  )}
                  {isCollapsed && !isMobile && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                      {item.label}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          {!isMobile && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
            >
              {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
          )}
          {(!isCollapsed || isMobile) && (
            <div className="ml-auto flex items-center gap-1">
              {isMobile && (
                <button
                  onClick={onMobileClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700"
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
          <div className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300" onClick={onMobileClose} aria-hidden="true" />
        )}
        <div className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="h-full flex flex-col overflow-hidden">{content}</div>
        </div>
      </>
    );
  }

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 h-full ${
      isCollapsed ? 'w-20' : 'w-64'
    }`}>
      {content}
    </aside>
  );
};

export default ModeratorSidebar;