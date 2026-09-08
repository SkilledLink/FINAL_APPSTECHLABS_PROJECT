import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, ArrowRight, Sparkles, Clock, Loader2, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export const ContactCTASection: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Inquiry', message: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitting(true);
      setTimeout(() => {
        setIsSubmitting(false);
        setSubmitted(true);
      }, 1000);
    }
  };

  return (
    <section id="contact" className="relative py-16 px-4 sm:px-8 max-w-7xl mx-auto space-y-12">
      {/* Background Ambient Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[20rem] bg-blue-600/10 dark:bg-blue-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* ====================================================
          1. HERO ONBOARDING CTA BANNER
          ==================================================== */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white p-8 sm:p-12 lg:p-14 shadow-[0_20px_50px_rgba(37,99,235,0.25)] border border-blue-400/30"
      >
        {/* Subtle Decorative Background Pattern & Glowing Orbs */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_50%)] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider backdrop-blur-md border border-white/20">
              <Sparkles size={13} className="text-blue-200" />
              <span>Start Scaling Today</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Ready to experience the future of skilled trade management?
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/90 leading-relaxed font-normal max-w-xl">
              Create an account in less than 2 minutes. Post jobs or offer your services on the premier marketplace with end-to-end escrow security.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch sm:items-center gap-3.5 w-full lg:w-auto shrink-0">
            <Link
              to="/signup"
              className="px-6 py-3.5 rounded-2xl bg-white text-blue-600 font-extrabold text-xs hover:bg-blue-50 shadow-xl shadow-blue-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Create Free Account</span>
              <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/login"
              className="px-6 py-3.5 rounded-2xl bg-blue-800/40 hover:bg-blue-800/60 text-white font-extrabold text-xs border border-white/25 backdrop-blur-md transition-all text-center"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ====================================================
          2. CONTACT & SUPPORT SECTION
          ==================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Get In Touch
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Have Questions? We're Here to Help.
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              Reach out to our enterprise support team for custom onboarding, trade auditing, or platform inquiries.
            </p>
          </div>

          {/* Contact Details List Cards */}
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl flex items-center gap-4 hover:border-blue-500/40 transition-colors shadow-sm">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Mail size={18} />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Email Us</p>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">support@skilledlink.com</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl flex items-center gap-4 hover:border-blue-500/40 transition-colors shadow-sm">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <Phone size={18} />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Call Toll-Free</p>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">+1 (800) 555-SKILL</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl flex items-center gap-4 hover:border-blue-500/40 transition-colors shadow-sm">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
                <MapPin size={18} />
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-400 uppercase text-[10px] tracking-wider">Headquarters</p>
                <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">Austin, TX • Tech Ridge Plaza</p>
              </div>
            </div>
          </div>

          {/* Response Time SLA Badge */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 flex items-center gap-3 text-slate-600 dark:text-slate-300 text-xs">
            <Clock size={16} className="text-blue-500 shrink-0" />
            <span>Average support response time: <strong className="text-slate-900 dark:text-white">&lt; 15 minutes</strong></span>
          </div>
        </div>

        {/* Interactive Contact Form Panel */}
        <div className="lg:col-span-7">
          <div className="backdrop-blur-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xl shadow-slate-900/5 relative overflow-hidden">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="text-center py-12 space-y-4"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
                    <CheckCircle2 size={36} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xl font-extrabold text-slate-900 dark:text-white">Message Received!</h4>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                      Thank you for reaching out. Our support team will review your inquiry and get back to you within 2 business hours.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                    }}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@company.com"
                        className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Inquiry Topic</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Enterprise Onboarding">Enterprise Onboarding</option>
                      <option value="Contractor Verification">Contractor Verification</option>
                      <option value="Escrow & Billing">Escrow & Billing Support</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Message</label>
                    <textarea
                      rows={4}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us about your project or trade requirements..."
                      className="w-full px-4 py-3 rounded-xl text-xs bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        <span>Send Message</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-2 pt-2 text-[11px] text-slate-400">
                    <ShieldCheck size={14} className="text-blue-500" />
                    <span>Your info is protected under our Privacy Policy.</span>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};