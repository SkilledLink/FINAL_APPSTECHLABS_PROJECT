import React from 'react';
import { Menu, Search, Bell, ShieldCheck, LogOut } from 'lucide-react';

interface ModeratorHeaderProps {
  title: string;
  subtitle?: string;
  onOpenMobileSidebar?: () => void;
}

const ModeratorHeader: React.FC<ModeratorHeaderProps> = ({ title, subtitle, onOpenMobileSidebar }) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/95 backdrop-blur-xl">
      <div className="flex min-h-[68px] items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-600 hover:bg-gray-100 md:hidden"
            aria-label="Open sidebar"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-gray-900 sm:text-xl">{title}</h1>
            {subtitle && <p className="truncate text-xs text-gray-500">{subtitle}</p>}
          </div>
        </div>

        <div className="hidden flex-1 justify-center px-4 lg:flex">
          <div className="relative w-full max-w-md">
            <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports, users, content..."
              className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all hover:border-gray-300 hover:bg-white focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10"
            />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button className="hidden h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 sm:flex lg:hidden">
            <Search size={19} />
          </button>

          <button className="relative flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100">
            <Bell size={19} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="hidden h-8 w-px bg-gray-200 sm:block" />

          <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 py-1.5 pl-1.5 pr-3">
            <img
              src="https://i.pravatar.cc/80?img=20"
              alt="Moderator"
              className="h-8 w-8 rounded-lg object-cover"
            />
            <div className="hidden leading-tight md:block">
              <p className="text-xs font-semibold text-gray-900">Marie Moderator</p>
              <div className="flex items-center gap-1">
                <ShieldCheck size={10} className="text-emerald-500" />
                <span className="text-[10px] text-gray-500">Senior Moderator</span>
              </div>
            </div>
          </div>

          <button className="hidden h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 sm:flex">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default ModeratorHeader;