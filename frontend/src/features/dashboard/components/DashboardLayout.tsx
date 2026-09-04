import React from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  Command,
} from 'lucide-react';
import { DashboardSidebar } from './DashboardSidebar';

interface DashboardHeaderProps {
  name: string;
  avatar?: string;
  available: boolean;
  onAvailabilityToggle: (available: boolean) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  name,
  avatar,
  available,
  onAvailabilityToggle,
}) => {
  return (
    <header className="sticky top-0 z-40 flex min-h-16 shrink-0 items-center border-b border-gray-200 bg-white/95 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex w-full items-center justify-between gap-4">

        {/* Left: Page / User Information */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white shadow-sm">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            {/* Online indicator */}
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                available ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />
          </div>

          <div className="hidden min-w-0 sm:block">
            <div className="flex items-center gap-1.5">
              <span className="max-w-[160px] truncate text-sm font-semibold text-gray-900">
                {name}
              </span>

              <ShieldCheck
                size={14}
                strokeWidth={2.5}
                className="shrink-0 text-blue-500"
              />
            </div>

            <p className="text-xs text-gray-500">
              Professional Dashboard
            </p>
          </div>
        </div>

        {/* Center: Search */}
        <div className="hidden flex-1 justify-center px-6 lg:flex">
          <div className="relative w-full max-w-lg">
            <Search
              size={17}
              strokeWidth={2}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search jobs, requests, clients..."
              className="
                h-10 w-full rounded-xl
                border border-gray-200
                bg-gray-50
                pl-10 pr-16
                text-sm text-gray-900
                placeholder:text-gray-400
                outline-none
                transition-all duration-200
                hover:border-gray-300
                hover:bg-white
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />

            <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[10px] font-medium text-gray-400 shadow-sm">
              <Command size={10} />
              <span>K</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">

          {/* Mobile Search */}
          <button
            type="button"
            aria-label="Search"
            className="
              flex h-9 w-9 items-center justify-center
              rounded-xl text-gray-500
              transition-colors
              hover:bg-gray-100 hover:text-gray-900
              lg:hidden
            "
          >
            <Search size={19} />
          </button>

          {/* Availability */}
          <div className="hidden items-center gap-2.5 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 md:flex">
            <button
              type="button"
              role="switch"
              aria-checked={available}
              aria-label="Toggle availability"
              onClick={() => onAvailabilityToggle(!available)}
              className={`
                relative h-5 w-9 shrink-0 rounded-full
                transition-colors duration-200
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500/20
                ${
                  available
                    ? 'bg-blue-500'
                    : 'bg-gray-300'
                }
              `}
            >
              <span
                className={`
                  absolute top-0.5 h-4 w-4
                  rounded-full bg-white
                  shadow-sm
                  transition-transform duration-200
                  ${
                    available
                      ? 'translate-x-4.5'
                      : 'translate-x-0.5'
                  }
                `}
              />
            </button>

            <div className="leading-none">
              <p className="text-xs font-semibold text-gray-800">
                {available ? 'Available' : 'Unavailable'}
              </p>

              <p className="mt-1 text-[10px] text-gray-400">
                {available ? 'Open for work' : 'Not accepting jobs'}
              </p>
            </div>
          </div>

          {/* Mobile Availability */}
          <button
            type="button"
            onClick={() => onAvailabilityToggle(!available)}
            aria-label={`Set status to ${
              available ? 'unavailable' : 'available'
            }`}
            className={`
              flex h-9 items-center gap-2 rounded-xl
              px-2.5 text-xs font-medium
              transition-colors md:hidden
              ${
                available
                  ? 'bg-green-50 text-green-700'
                  : 'bg-gray-100 text-gray-600'
              }
            `}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                available ? 'bg-green-500' : 'bg-gray-400'
              }`}
            />

            <span className="hidden xs:inline">
              {available ? 'Available' : 'Offline'}
            </span>
          </button>

          {/* Divider */}
          <div className="mx-1 hidden h-7 w-px bg-gray-200 sm:block" />

          {/* Messages */}
          <button
            type="button"
            aria-label="Messages"
            className="
              relative flex h-9 w-9
              items-center justify-center
              rounded-xl text-gray-500
              transition-colors
              hover:bg-gray-100 hover:text-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/20
            "
          >
            <MessageSquare
              size={19}
              strokeWidth={1.9}
            />

            <span
              className="
                absolute right-1 top-1
                flex h-3.5 min-w-3.5
                items-center justify-center
                rounded-full
                border-2 border-white
                bg-blue-500
                px-0.5
                text-[8px]
                font-bold
                text-white
              "
            >
              3
            </span>
          </button>

          {/* Notifications */}
          <button
            type="button"
            aria-label="Notifications"
            className="
              relative flex h-9 w-9
              items-center justify-center
              rounded-xl text-gray-500
              transition-colors
              hover:bg-gray-100 hover:text-gray-900
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/20
            "
          >
            <Bell
              size={19}
              strokeWidth={1.9}
            />

            <span
              className="
                absolute right-1.5 top-1.5
                h-2 w-2 rounded-full
                bg-red-500
                ring-2 ring-white
              "
            />
          </button>

          {/* Divider */}
          <div className="mx-1 hidden h-7 w-px bg-gray-200 sm:block" />

          {/* Profile Dropdown */}
          <button
            type="button"
            className="
              group flex items-center gap-2
              rounded-xl p-1
              transition-colors
              hover:bg-gray-50
              focus:outline-none
              focus:ring-2
              focus:ring-blue-500/20
            "
          >
            <div className="relative">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="h-9 w-9 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500 text-sm font-bold text-white">
                  {name.charAt(0).toUpperCase()}
                </div>
              )}

              <span
                className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white ${
                  available
                    ? 'bg-green-500'
                    : 'bg-gray-400'
                }`}
              />
            </div>

            <div className="hidden text-left md:block">
              <p className="max-w-[120px] truncate text-xs font-semibold text-gray-900">
                {name}
              </p>

              <div className="mt-0.5 flex items-center gap-1">
                <ShieldCheck
                  size={11}
                  className="text-blue-500"
                />

                <span className="text-[10px] text-gray-500">
                  Verified
                </span>
              </div>
            </div>

            <ChevronDown
              size={15}
              className="
                hidden text-gray-400
                transition-transform
                group-hover:text-gray-600
                md:block
              "
            />
          </button>
        </div>
      </div>
    </header>
  );
};

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  professionalName: string;
  professionalAvatar?: string;
  available: boolean;
  onAvailabilityToggle: (available: boolean) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  professionalName,
  professionalAvatar,
  available,
  onAvailabilityToggle,
}) => {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50">

      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 shrink-0">
        <DashboardSidebar
          activeTab={activeTab}
          onTabChange={onTabChange}
        />
      </aside>

      {/* ================= MAIN AREA ================= */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* ================= HEADER ================= */}
        <DashboardHeader
          name={professionalName}
          avatar={professionalAvatar}
          available={available}
          onAvailabilityToggle={onAvailabilityToggle}
        />

        {/* ================= PAGE CONTENT ================= */}
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default DashboardLayout;
