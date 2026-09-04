import React, { useEffect } from 'react';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Activity, 
  Sparkles, 
  BarChart3, 
  Settings, 
  Users, 
  Briefcase,
  Star,
  Wallet,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Bell,
  X,
} from 'lucide-react';

export type DashboardTab = 
  | 'overview'
  | 'requests'
  | 'activity'
  | 'insights'
  | 'analytics'
  | 'clients'
  | 'jobs'
  | 'reviews'
  | 'earnings'
  | 'settings';

interface DashboardSidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  isMobile?: boolean;
  userName?: string;
  userProfession?: string;
  userAvatar?: string;
}

interface NavItem {
  id: DashboardTab;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
  isMobile = false,
  userName = 'Jean-Pierre Mbock',
  userProfession = 'Electrician',
  userAvatar = 'https://ui-avatars.com/api/?name=Jean-Pierre+Mbock&size=128&background=0D9488&color=fff'
}) => {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'requests', label: 'Requests', icon: <ClipboardList className="w-5 h-5" />, badge: 3 },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-5 h-5" /> },
    { id: 'insights', label: 'AI Insights', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="w-5 h-5" /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase className="w-5 h-5" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { id: 'earnings', label: 'Earnings', icon: <Wallet className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen, onMobileClose]);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, isMobileOpen]);

  const sidebarContent = (
    <>
      {/* User Profile Section */}
      <div className={`p-4 border-b border-gray-200 ${isCollapsed && !isMobile ? 'text-center' : ''}`}>
        {isCollapsed && !isMobile ? (
          <div className="flex flex-col items-center">
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
            />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <img
              src={userAvatar}
              alt={userName}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-100 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{userName}</p>
              <p className="text-sm text-gray-600 truncate">{userProfession}</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  onTabChange(item.id);
                  if (isMobile && onMobileClose) {
                    onMobileClose();
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className={`flex-shrink-0 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}`}>
                  {item.icon}
                </span>
                
                {(!isCollapsed || isMobile) && (
                  <span className="flex-1 text-left text-sm font-medium">
                    {item.label}
                  </span>
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

                {/* Tooltip for collapsed desktop mode */}
                {isCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.label}
                    {item.badge && ` (${item.badge})`}
                  </div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom Section */}
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
            <div className="flex items-center gap-1 ml-auto">
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
                <MessageSquare className="w-5 h-5" />
              </button>
              {isMobile && (
                <button
                  onClick={onMobileClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700 ml-1"
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

  // Mobile: Slide-in sidebar with overlay
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isMobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
        
        {/* Mobile Sidebar */}
        <div
          className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="h-full flex flex-col overflow-hidden">
            {sidebarContent}
          </div>
        </div>
      </>
    );
  }

  // Desktop: Static sidebar with collapse (overlay style)
  return (
    <aside 
      className={`fixed left-0 top-0 bottom-0 z-40 bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {sidebarContent}
    </aside>
  );
};