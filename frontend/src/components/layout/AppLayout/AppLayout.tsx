// src/components/layout/AppLayout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import MobileNavigation from '../MobileNavigation/MobileNavigation';
import { useTheme } from '../../../providers/ThemeProvider';
import { NotificationProvider } from '../../../features/notifications';

export default function AppLayout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <NotificationProvider>
      <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f0f4f8] font-sans text-slate-900 transition-colors duration-300 selection:bg-blue-500 selection:text-white dark:bg-slate-950 dark:text-slate-100">
        {/* ═══════════ BACKGROUND LAYER ═══════════ */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-40 dark:opacity-25">
            <svg
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <linearGradient
                  id="app-poly-grad"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#2563EB" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#1E40AF" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <polygon points="50,20 320,180 180,420 20,310" fill="url(#app-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
              <polygon points="650,80 920,40 980,320 720,480" fill="url(#app-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
              <polygon points="180,620 480,780 120,920" fill="url(#app-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
              <polygon points="820,540 1150,710 980,940" fill="url(#app-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
              <polygon points="400,200 600,120 550,380" fill="url(#app-poly-grad)" stroke="#2563EB" strokeWidth="0.5" />
            </svg>
          </div>

          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-400/30 dark:bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-400/30 dark:bg-indigo-600/20 rounded-full blur-3xl" />
        </div>

        {/* Fixed top header */}
        <header className="relative z-40 w-full shrink-0 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70">
          <Header isDark={isDark} toggleTheme={toggleTheme} />
        </header>

        {/* Body: sidebar + outlet */}
        <div className="relative z-10 flex min-h-0 w-full flex-1 overflow-hidden">
          <aside
            aria-label="Sidebar Navigation"
            className="relative z-20 hidden h-full shrink-0 md:flex"
          >
            <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
          </aside>

          <main
            tabIndex={-1}
            className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-0 scrollbar-hide focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <nav
          aria-label="Mobile Navigation"
          className="relative z-40 shrink-0 border-t border-slate-200/70 bg-white/70 backdrop-blur-xl md:hidden dark:border-slate-800/70 dark:bg-slate-950/70"
        >
          <MobileNavigation isDark={isDark} toggleTheme={toggleTheme} />
        </nav>
      </div>
    </NotificationProvider>
  );
}