import React, { useState, useEffect } from 'react';
import { Sun, Moon, Menu, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const event = new CustomEvent('themeChange', { detail: isDarkMode });
    window.dispatchEvent(event);
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className={`sticky top-0 z-50 w-full backdrop-blur-2xl border-b transition-colors duration-500 overflow-hidden ${
        isDarkMode 
          ? 'bg-[#070b14]/60 border-white/10 text-white' 
          : 'bg-white/60 border-gray-200 text-gray-900'
      }`}>
        
        {/* Animated Background Color Glow / Gradient Flow */}
        <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-45 overflow-hidden">
          <motion.div 
            animate={{
              x: ['-20%', '20%', '-20%'],
              y: ['-50%', '50%', '-50%'],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute -top-24 left-1/4 w-96 h-32 bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-cyan-400/30 blur-3xl rounded-full"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 h-20 flex items-center justify-between z-10">
          
          {/* Logo (One Word, No Icon Beside It) */}
          <a href="/" className={`text-2xl font-extrabold tracking-tight no-underline ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Skilled<span className="text-blue-500">Link</span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className={`hidden lg:flex items-center gap-7 text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            <a href="#overview" className="hover:text-blue-400 transition-colors">Overview</a>
            <a href="#solutions" className="hover:text-blue-400 transition-colors">Solutions</a>
            <a href="#features" className="hover:text-blue-400 transition-colors">Features</a>
            <a href="#showcase" className="hover:text-blue-400 transition-colors">Showcase</a>
            <a href="#resources" className="hover:text-blue-400 transition-colors">Resources</a>
            <a href="#pricing" className="hover:text-blue-400 transition-colors">Pricing</a>
          </nav>

          {/* Desktop Actions: Toggle Switch, Login & Get Started */}
          <div className="hidden lg:flex items-center gap-5">
            
            {/* Compact Sliding Toggle Switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className={`relative w-16 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-300 flex items-center shadow-inner ${
                isDarkMode ? 'bg-[#1b2234] border border-white/10' : 'bg-gray-200 border border-gray-300'
              }`}
            >
              <motion.div
                className="absolute w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center z-10"
                animate={{ x: isDarkMode ? 2 : 38 }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              >
                {isDarkMode ? (
                  <Moon className="w-2.5 h-2.5 text-gray-700" />
                ) : (
                  <Sun className="w-2.5 h-2.5 text-blue-500" />
                )}
              </motion.div>
            </button>

            <a 
              href="/login" 
              className={`text-sm font-semibold transition-colors ${
                isDarkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </a>

            <a 
              href="/register" 
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-semibold text-sm text-white shadow-lg shadow-blue-600/30 hover:scale-[1.02] active:scale-[0.98] no-underline"
            >
              Get Started
            </a>
          </div>

          {/* Hamburger Menu Trigger Button */}
          <div className="flex lg:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Menu"
              className={`p-2.5 rounded-2xl border transition-all ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' 
                  : 'bg-gray-100 border-gray-200 text-gray-900 hover:bg-gray-200'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>
      </header>

      {/* Apple-Inspired Sliding Sidebar Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            
            {/* Backdrop Blur Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={() => setMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />

            {/* Sliding Sidebar Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className={`relative w-[85%] max-w-sm h-full shadow-2xl flex flex-col justify-between p-7 z-10 backdrop-blur-3xl border-l ${
                isDarkMode 
                  ? 'bg-[#070b14]/90 border-white/10 text-white' 
                  : 'bg-white/95 border-gray-200 text-gray-900'
              }`}
            >
              {/* Top Header Row inside Sidebar */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xl font-bold tracking-tight">
                  Skilled<span className="text-blue-500">Link</span>
                </span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close Menu"
                  className={`p-2 rounded-full border transition-all ${
                    isDarkMode 
                      ? 'bg-white/5 border-white/10 text-gray-300 hover:text-white' 
                      : 'bg-gray-100 border-gray-200 text-gray-700 hover:text-gray-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar Navigation Links with Smooth Border Bottom Dividers */}
              <nav className="flex flex-col my-auto text-base font-medium">
                {[
                  { name: 'Overview', href: '#overview' },
                  { name: 'Solutions', href: '#solutions' },
                  { name: 'Features', href: '#features' },
                  { name: 'Showcase', href: '#showcase' },
                  { name: 'Resources', href: '#resources' },
                  { name: 'Pricing', href: '#pricing' },
                  { name: 'Sign In', href: '/login' },
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3.5 flex items-center justify-between transition-colors group ${
                      isDarkMode 
                        ? 'border-b border-white/10 hover:text-blue-400' 
                        : 'border-b border-gray-100 hover:text-blue-600'
                    }`}
                  >
                    <span>{item.name}</span>
                    <ArrowRight className="w-4 h-4 opacity-40 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-blue-500" />
                  </a>
                ))}
              </nav>

              {/* Bottom Actions: Theme Switcher & Register CTA */}
              <div className="flex flex-col gap-5 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between px-1">
                  <span className="text-sm font-medium text-gray-400">Appearance</span>
                  
                  {/* Compact Sliding Toggle Switch */}
                  <button
                    onClick={toggleTheme}
                    aria-label="Toggle Theme"
                    className={`relative w-16 h-6 rounded-full p-0.5 cursor-pointer transition-colors duration-300 flex items-center shadow-inner ${
                      isDarkMode ? 'bg-[#1b2234] border border-white/10' : 'bg-gray-200 border border-gray-300'
                    }`}
                  >
                    <motion.div
                      className="absolute w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center z-10"
                      animate={{ x: isDarkMode ? 2 : 38 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    >
                      {isDarkMode ? (
                        <Moon className="w-2.5 h-2.5 text-gray-700" />
                      ) : (
                        <Sun className="w-2.5 h-2.5 text-blue-500" />
                      )}
                    </motion.div>
                  </button>
                </div>

                <a
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all font-semibold text-sm text-white shadow-lg shadow-blue-600/30 text-center no-underline block"
                >
                  Get Started
                </a>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}