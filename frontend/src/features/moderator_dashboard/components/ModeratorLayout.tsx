import React, { useState } from 'react';
import ModeratorSidebar from './ModeratorSidebar';

type ModeratorTab = React.ComponentProps<typeof ModeratorSidebar>['activeTab'];

interface ModeratorLayoutProps {
  children: React.ReactNode;
  activeTab: ModeratorTab;
  onTabChange: (tab: ModeratorTab) => void;
  title: string;
  subtitle?: string;
}

const ModeratorLayout: React.FC<ModeratorLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">
      <div className="hidden md:flex">
        <ModeratorSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </div>

      <div className="md:hidden">
        <ModeratorSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isMobile
          isMobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
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

export default ModeratorLayout;