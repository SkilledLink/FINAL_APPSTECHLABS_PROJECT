import { useState } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
} from "lucide-react";

import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboard() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 transition-colors duration-500 dark:bg-slate-950 dark:text-white">

      {/* SIDEBAR */}
      <AdminSidebar
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* MAIN */}
      <div className="lg:pl-[270px]">

        {/* HEADER */}
        <header
          className="
            sticky top-0 z-30
            flex h-[76px]
            items-center justify-between
            border-b
            border-slate-200
            bg-white/95
            px-4
            backdrop-blur-md
            transition-all duration-500

            dark:border-slate-800
            dark:bg-slate-900/95

            sm:px-6
            lg:px-8
          "
        >

          {/* LEFT SIDE */}
          <div className="flex items-center gap-4">

            {/* MOBILE MENU */}
            <button
              onClick={() => setMobileOpen(true)}
              className="
                rounded-lg
                p-2
                text-slate-600
                transition-all duration-300
                hover:bg-slate-100

                dark:text-slate-300
                dark:hover:bg-slate-800

                lg:hidden
              "
            >
              <Menu size={21} />
            </button>

            {/* SEARCH */}
            <div
              className="
                hidden
                h-10
                w-[380px]
                items-center
                gap-2
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                px-3
                transition-all duration-500

                dark:border-slate-700
                dark:bg-slate-800

                md:flex
              "
            >
              <Search
                size={17}
                className="text-slate-400 dark:text-slate-500"
              />

              <input
                placeholder="Search users, jobs, posts, or anything..."
                className="
                  w-full
                  bg-transparent
                  text-sm
                  text-slate-800
                  outline-none
                  placeholder:text-slate-400

                  dark:text-white
                  dark:placeholder:text-slate-500
                "
              />
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* NOTIFICATION */}
            <button
              className="
                relative
                rounded-lg
                p-2
                text-slate-500
                transition-all duration-300
                hover:bg-slate-100
                hover:text-slate-900

                dark:text-slate-400
                dark:hover:bg-slate-800
                dark:hover:text-white
              "
            >
              <Bell size={19} />

              <span
                className="
                  absolute
                  right-1
                  top-1
                  flex
                  h-4
                  min-w-4
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[8px]
                  font-bold
                  text-white
                "
              >
                3
              </span>
            </button>

            {/* DIVIDER */}
            <div
              className="
                h-7
                w-px
                bg-slate-200
                transition-colors duration-500
                dark:bg-slate-700
              "
            />

            {/* ADMIN PROFILE */}
            <button className="flex items-center gap-3">

              {/* Avatar */}
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-blue-600
                  text-[11px]
                  font-bold
                  text-white
                "
              >
                AD
              </div>

              {/* Name */}
              <div className="hidden text-left sm:block">

                <p
                  className="
                    text-sm
                    font-semibold
                    text-slate-800
                    transition-colors duration-500
                    dark:text-white
                  "
                >
                  Administrator
                </p>

                <p
                  className="
                    text-[10px]
                    text-slate-400
                    dark:text-slate-500
                  "
                >
                  Super Admin
                </p>

              </div>

              <ChevronDown
                size={15}
                className="
                  hidden
                  text-slate-400
                  dark:text-slate-500
                  sm:block
                "
              />

            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main
          className="
            mx-auto
            min-h-[calc(100vh-76px)]
            max-w-[1700px]
            bg-[#f8fafc]
            p-4
            transition-colors duration-500

            dark:bg-slate-950

            sm:p-6
            lg:p-8
          "
        >
          <Outlet />
        </main>

      </div>
    </div>
  );
}