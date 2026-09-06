import React from 'react';
import {
  Search,
  Bell,
  ShieldCheck,
  MessageSquare,
  ChevronDown,
  Command,
} from 'lucide-react';

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
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/80 bg-white/95 backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[76px] items-center justify-between gap-4">

          {/* Left Section */}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">
                Hello, {name} 👋
              </h1>
            </div>

            <p className="mt-0.5 hidden text-sm text-gray-500 sm:block">
              Here's what's happening with your business today.
            </p>
          </div>

          {/* Center Search */}
          <div className="hidden flex-1 justify-center px-4 lg:flex">
            <div className="relative w-full max-w-md">
              <Search
                size={18}
                strokeWidth={2}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                placeholder="Search jobs, requests, clients..."
                className="
                  h-11 w-full rounded-xl
                  border border-gray-200
                  bg-gray-50/80
                  pl-10 pr-20
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

              <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-gray-200 bg-white px-1.5 py-1 text-[11px] font-medium text-gray-400 shadow-sm">
                <Command size={11} />
                <span>K</span>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Mobile Search */}
            <button
              type="button"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xl border border-gray-200
                bg-white text-gray-600
                transition-colors
                hover:bg-gray-50 hover:text-gray-900
                lg:hidden
              "
              aria-label="Search"
            >
              <Search size={19} />
            </button>

            {/* Availability */}
            <div
              className="
                hidden items-center gap-3
                rounded-xl border border-gray-200
                bg-gray-50 px-3 py-2
                sm:flex
              "
            >
              <button
                type="button"
                role="switch"
                aria-checked={available}
                aria-label="Toggle availability"
                onClick={() => onAvailabilityToggle(!available)}
                className={`
                  relative h-5 w-10 shrink-0 cursor-pointer rounded-full
                  transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500/30
                  ${
                    available
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }
                `}
              >
                <span
                  className={`
                    absolute top-0.5 h-4 w-4 rounded-full
                    bg-white shadow-sm
                    transition-transform duration-200
                    ${
                      available
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    }
                  `}
                />
              </button>

              <div className="flex flex-col leading-none">
                <span className="text-xs font-semibold text-gray-800">
                  {available ? 'Available' : 'Unavailable'}
                </span>
                <span className="mt-1 text-[10px] text-gray-400">
                  {available ? 'Open for work' : 'Not accepting jobs'}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

            {/* Messages */}
            <button
              type="button"
              aria-label="Messages"
              className="
                relative flex h-10 w-10 items-center justify-center
                rounded-xl text-gray-600
                transition-all duration-200
                hover:bg-gray-100 hover:text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              "
            >
              <MessageSquare size={20} strokeWidth={1.9} />

              <span
                className="
                  absolute right-1.5 top-1.5
                  flex h-4 min-w-4 items-center justify-center
                  rounded-full border-2 border-white
                  bg-blue-500 px-1
                  text-[9px] font-bold text-white
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
                relative flex h-10 w-10 items-center justify-center
                rounded-xl text-gray-600
                transition-all duration-200
                hover:bg-gray-100 hover:text-gray-900
                focus:outline-none focus:ring-2 focus:ring-blue-500/20
              "
            >
              <Bell size={20} strokeWidth={1.9} />

              <span
                className="
                  absolute right-2 top-2
                  h-2 w-2 rounded-full
                  bg-red-500
                  ring-2 ring-white
                "
              />
            </button>

            {/* Divider */}
            <div className="hidden h-8 w-px bg-gray-200 sm:block" />

            {/* Profile */}
            <button
              type="button"
              className="
                group flex items-center gap-2 rounded-xl
                p-1.5 pr-2
                transition-colors
                hover:bg-gray-50
                focus:outline-none
                focus:ring-2 focus:ring-blue-500/20
              "
            >
              {/* Avatar */}
              <div
                className="
                  relative h-10 w-10 shrink-0
                  overflow-hidden rounded-xl
                  bg-blue-500
                  shadow-sm
                "
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={`${name}'s profile`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-white">
                    {name.charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Online indicator */}
                <span
                  className="
                    absolute bottom-0.5 right-0.5
                    h-2.5 w-2.5 rounded-full
                    border-2 border-white
                    bg-green-500
                  "
                />
              </div>

              {/* Profile Details */}
              <div className="hidden min-w-0 text-left md:block">
                <p className="max-w-[130px] truncate text-sm font-semibold text-gray-900">
                  {name}
                </p>

                <div className="mt-0.5 flex items-center gap-1">
                  <ShieldCheck
                    size={12}
                    strokeWidth={2.5}
                    className="text-blue-500"
                  />

                  <span className="text-[11px] font-medium text-gray-500">
                    Verified Professional
                  </span>
                </div>
              </div>

              <ChevronDown
                size={16}
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

        {/* Mobile Search */}
        <div className="pb-4 lg:hidden">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search jobs, requests, clients..."
              className="
                h-10 w-full rounded-xl
                border border-gray-200
                bg-gray-50
                pl-10 pr-4
                text-sm text-gray-900
                placeholder:text-gray-400
                outline-none
                transition-all
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
