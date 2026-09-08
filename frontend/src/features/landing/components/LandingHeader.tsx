import React, { useState } from 'react';
import { Search, Bell, X, Sun, Moon, Menu, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface LandingHeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ isDark, toggleTheme }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/discover?q=${encodeURIComponent(searchQuery)}`;
    }
    setIsSearchOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 h-20 w-full bg-white/60 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/60 dark:border-blue-500/20 flex items-center justify-between px-4 sm:px-8 z-40 transition-colors duration-300">
        {/* Subtle Thunder Light SVG Background Overlay */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <svg
            className="w-full h-full opacity-30 dark:opacity-40"
            viewBox="0 0 1200 80"
            preserveAspectRatio="none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="thunder-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="thunder-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.2" />
              </linearGradient>
            </defs>
            <motion.path
              d="M -50 15 L 120 45 L 180 25 L 290 60 L 350 35 L 480 65 L 560 20 L 710 55 L 830 25 L 940 60 L 1050 30 L 1250 50"
              stroke="url(#thunder-grad)"
              strokeWidth="1.2"
              strokeLinecap="round"
              filter="url(#thunder-glow)"
              initial={{ opacity: 0.3 }}
              animate={{
                opacity: [0.2, 0.7, 0.3, 0.8, 0.25],
                strokeWidth: [1, 1.4, 1, 1.5, 1.1],
              }}
              transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
            />
          </svg>
          <div className="absolute -top-10 left-1/3 w-96 h-28 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-10 z-10 relative">
          <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white select-none">
            Skilled<span className="text-blue-600 dark:text-blue-400">Link</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-wider font-bold text-slate-600 dark:text-slate-300">
            <a href="#showcase" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Directory</a>
            <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Features</a>
            <a href="#stats" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Why Us</a>
            <a href="#contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Contact</a>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 z-10 relative">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-slate-200/50 dark:border-slate-800/80"
            aria-label="Search"
          >
            <Search size={18} />
          </button>

          <button
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all relative border border-slate-200/50 dark:border-slate-800/80"
            aria-label="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl transition-all border border-slate-200/50 dark:border-slate-800/80"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-700" />}
          </button>

          <div className="hidden sm:flex items-center gap-3 ml-2">
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
          >
            <Menu size={20} />
          </button>
        </div>
      </header>

      {/* Search Glass Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-2xl flex items-start justify-center pt-20 px-4"
          >
            <div className="w-full max-w-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Search SkilledLink Network</h2>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} className="text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search electricians, plumbers, jobs, or businesses..."
                  className="w-full pl-5 pr-12 py-3.5 text-sm bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500"
                >
                  <Search size={16} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden z-30 bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 backdrop-blur-xl px-6 py-6 space-y-4"
          >
            <a
              href="#showcase"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Directory
            </a>
            <a
              href="#features"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Features
            </a>
            <a
              href="#stats"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Why Us
            </a>
            <a
              href="#contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Contact
            </a>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="w-full py-2.5 text-center text-xs font-bold rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30"
              >
                Get Started
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};