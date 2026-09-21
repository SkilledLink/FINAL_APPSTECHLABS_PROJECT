import React, { useState } from 'react';
import { AdminSidebar, type AdminTab } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  title: string;
  subtitle?: string;
  unreadContactMessages?: number;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title,
  subtitle,
  unreadContactMessages = 0,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <div className="hidden md:flex">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          unreadContactMessages={unreadContactMessages}
        />
      </div>

      <div className="md:hidden">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isMobile
          isMobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          unreadContactMessages={unreadContactMessages}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;