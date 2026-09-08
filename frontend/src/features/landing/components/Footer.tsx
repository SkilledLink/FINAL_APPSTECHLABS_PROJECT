import React from 'react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-950/80 backdrop-blur-2xl pt-12 pb-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg">
              S
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              Skilled<span className="text-blue-600 dark:text-blue-400">Link</span>
            </span>
          </Link>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            The next-generation marketplace bridging neighborhood local talent with verified master trades and AI-assisted match analysis.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Platform</h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><Link to="/discover" className="hover:text-blue-500">Find Skilled Trades</Link></li>
            <li><Link to="/discover" className="hover:text-blue-500">Post a Job</Link></li>
            <li><a href="#how-it-works" className="hover:text-blue-500">How SkilledLink Works</a></li>
            <li><a href="#features" className="hover:text-blue-500">Safety & Escrow</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Company</h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><a href="#pricing" className="hover:text-blue-500">Pro Membership</a></li>
            <li><a href="#contact" className="hover:text-blue-500">Get Help & Support</a></li>
            <li><a href="#blog" className="hover:text-blue-500">Industry Hub</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-3">Account & Legal</h4>
          <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
            <li><Link to="/login" className="hover:text-blue-500">Client Log In</Link></li>
            <li><Link to="/register-pro" className="hover:text-blue-500">Specialist Sign Up</Link></li>
            <li><a href="#terms" className="hover:text-blue-500">Privacy Policy & Terms</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
        <p>© 2026 SkilledLink Inc. All rights reserved. Licensed trades directory platform.</p>
        <p className="font-medium">Privacy • Terms • Cookies • Trust & Security</p>
      </div>
    </footer>
  );
};