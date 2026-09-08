import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import MobileNavigation from "../MobileNavigation/MobileNavigation";

export default function AppLayout() {
  const [isDark, setIsDark] = useState(() => {
    return document.documentElement.classList.contains("dark");
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const nextTheme = !prev;
      if (nextTheme) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return nextTheme;
    });
  };

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    }
  }, [isDark]);

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#f0f4f8] dark:bg-[#0b1329] text-slate-800 dark:text-slate-100 overflow-hidden font-sans transition-colors duration-300 relative">
      {/* AMBIENT BACKGROUND GLOWS */}
      <div className="absolute top-1/4 -left-32 w-[30rem] h-[30rem] bg-blue-400/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-1/4 -right-32 w-[30rem] h-[30rem] bg-sky-400/10 dark:bg-blue-900/20 rounded-full blur-3xl pointer-events-none z-0" />

      {/* TOP HEADER */}
      <Header isDark={isDark} toggleTheme={toggleTheme} />

      {/* MAIN LAYOUT BODY */}
      <div className="flex flex-1 w-full overflow-hidden relative z-10 gap-4 md:gap-6 pl-0 pr-4 md:pr-6">
        {/* ✅ Pass isDark and toggleTheme to Sidebar */}
        <Sidebar isDark={isDark} toggleTheme={toggleTheme} />

        {/* Removed transition-all duration-300 to stop competing with Framer Motion */}
        <main className="flex-1 overflow-y-auto py-4 pb-24 md:pb-6 w-full min-w-0">
          <div className="w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ✅ Pass isDark and toggleTheme to MobileNavigation */}
      <MobileNavigation isDark={isDark} toggleTheme={toggleTheme} />
    </div>
  );
}