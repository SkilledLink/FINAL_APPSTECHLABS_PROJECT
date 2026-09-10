import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavigation from "../MobileNavigation/MobileNavigation";

export default function AppLayout() {
  const [isDark, setIsDark] = useState(() => 
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextTheme = !prev;
      document.documentElement.classList.toggle("dark", nextTheme);
      return nextTheme;
    });
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f0f4f8] dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 overflow-hidden">
      
      {/* Ambient Background Glows */}
      <div className="fixed top-1/4 -left-32 w-[30rem] h-[30rem] bg-blue-400/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed bottom-1/4 -right-32 w-[30rem] h-[30rem] bg-sky-400/10 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none z-0" />

      {/* 1. FIXED TOP HEADER (Never scrolls) */}
      <header className="z-40 w-full shrink-0">
        <Header isDark={isDark} toggleTheme={toggleTheme} />
      </header>

      {/* 2. MAIN BODY WRAPPER */}
      <div className="relative z-10 flex flex-1 w-full min-h-0 overflow-hidden">
        
        {/* FIXED LEFT SIDEBAR (Never scrolls with page, has independent scroll if long) */}
        <aside className="hidden md:flex flex-col shrink-0 h-full overflow-y-auto z-20 border-r border-slate-200/50 dark:border-slate-800/50">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
        </aside>

        {/* SCROLLABLE PAGE CONTENT CONTAINER */}
        <main className="flex-1 h-full overflow-y-auto overflow-x-hidden min-w-0 pb-20 md:pb-6">
          <div className="w-full min-h-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* 3. MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden z-40 shrink-0">
        <MobileNavigation isDark={isDark} toggleTheme={toggleTheme} />
      </div>
    </div>
  );
}