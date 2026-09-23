import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, ArrowLeft } from 'lucide-react';
import { AdminSidebar, type AdminTab } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  title: string;
  subtitle?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  title,
  subtitle,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100">
      {/* Desktop sidebar — lg and up */}
      <div className="hidden lg:flex">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
      </div>

      {/* Mobile drawer — below lg */}
      <div className="lg:hidden">
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
          isMobile
          isMobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex flex-shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-3 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-5 sm:py-4">
          {/* Hamburger — mobile only */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ml-1 rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Back to Home */}
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:border-blue-500/40 hover:text-blue-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-500/40 dark:hover:text-blue-400 sm:px-3 sm:text-sm"
            title="Back to Home"
            aria-label="Back to Home"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </button>

          {/* Title / subtitle */}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-gray-900 dark:text-slate-100 sm:text-lg lg:text-xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-slate-400 sm:text-sm">
                {subtitle}
              </p>
            )}
          </div>
        </header>

        {/* Scrollable content */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-3 sm:p-5 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;