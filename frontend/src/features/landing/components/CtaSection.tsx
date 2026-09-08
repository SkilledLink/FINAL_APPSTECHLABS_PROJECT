import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowRight, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CtaSection: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
      {/* Onboarding Glass Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-8 sm:p-12 shadow-2xl border border-blue-400/30 text-center">
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <span className="px-3.5 py-1.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            PROS & HOMEOWNERS
          </span>
          <h2 className="text-2xl sm:text-4xl font-black">
            Ready to connect with the best local trades?
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 leading-relaxed">
            Join over 14,500 certified professionals and thousands of satisfied homeowners nationwide.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/signup"
              className="px-8 py-4 rounded-2xl bg-white text-blue-600 font-extrabold text-xs hover:bg-slate-100 shadow-lg active:scale-95 transition-all flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              to="/discover"
              className="px-8 py-4 rounded-2xl bg-blue-700/60 hover:bg-blue-700 text-white font-extrabold text-xs border border-white/20 transition-all"
            >
              Explore Marketplace
            </Link>
          </div>
          <p className="text-[10px] text-blue-200 font-medium pt-1">
            ✓ No credit card required • Free for clients
          </p>
        </div>
      </div>

      {/* Enterprise & Support Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Direct Contact
            </span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
              Have Specialized Requirements?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              Our enterprise onboarding team helps commercial builders and large contractor networks integrate seamlessly.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Mail size={16} />
              </div>
              <span>support@skilledlink.com</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Phone size={16} />
              </div>
              <span>+1 (800) 555-SKILL</span>
            </div>
            <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <MapPin size={16} />
              </div>
              <span>Austin, TX • Tech Ridge Plaza</span>
            </div>
          </div>
        </div>

        {/* Form Panel */}
        <div className="lg:col-span-7 backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
          {submitted ? (
            <div className="text-center py-10 space-y-3">
              <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">Message Delivered!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Our team will respond within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@company.com"
                    className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Message</label>
                <textarea
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Tell us about your trade requirements or enterprise needs..."
                  className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Send size={14} />
                <span>Send Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};