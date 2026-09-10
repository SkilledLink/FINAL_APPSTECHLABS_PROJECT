import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  Moon,
  ChevronDown,
} from "lucide-react";

import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main */}
      <div className="lg:pl-[270px]">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile menu */}
            <button
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={21} />
            </button>

            {/* Search */}
            <div className="hidden h-10 w-[380px] items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 md:flex">
              <Search size={17} className="text-slate-400" />

              <input
                placeholder="Search users, jobs, posts, or anything..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />

              
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification */}
            <button className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
              <Bell size={19} />

              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                3
              </span>
            </button>

            {/* Dark mode */}
            <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block">
              <Moon size={18} />
            </button>

            <div className="h-7 w-px bg-slate-200" />

            {/* Admin */}
            <button className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
                AD
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  Administrator
                </p>

                <p className="text-[10px] text-slate-400">
                  Super Admin
                </p>
              </div>

              <ChevronDown
                size={15}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="mx-auto max-w-[1700px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}