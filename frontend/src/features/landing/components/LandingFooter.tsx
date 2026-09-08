import React from 'react';
import { Link } from 'react-router-dom';

export const LandingFooter: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/80 backdrop-blur-2xl pt-12 pb-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-3">
          <Link to="/" className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Skilled<span className="text-blue-600 dark:text-blue-400">Link</span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The next-generation marketplace connecting verified trade talent with commercial & residential opportunities.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Marketplace</h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><Link to="/discover" className="hover:text-blue-500">Electricians</Link></li>
            <li><Link to="/discover" className="hover:text-blue-500">Plumbers</Link></li>
            <li><Link to="/discover" className="hover:text-blue-500">General Contractors</Link></li>
            <li><Link to="/discover" className="hover:text-blue-500">HVAC Technicians</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Account</h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><Link to="/login" className="hover:text-blue-500">Log In</Link></li>
            <li><Link to="/signup" className="hover:text-blue-500">Client Sign Up</Link></li>
            <li><Link to="/register-pro" className="hover:text-blue-500">Register as Specialist</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Company</h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><a href="#features" className="hover:text-blue-500">Platform Features</a></li>
            <li><a href="#contact" className="hover:text-blue-500">Contact & Support</a></li>
            <li><a href="#" className="hover:text-blue-500">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <p>© 2026 SkilledLink Inc. All rights reserved.</p>
        <p className="font-medium">Crafted with precision & high-performance modern web standards.</p>
      </div>
    </footer>
  );
};