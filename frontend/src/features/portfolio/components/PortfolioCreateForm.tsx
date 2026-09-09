// src/features/portfolio/components/PortfolioCreateForm.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Briefcase, Building2, Clock, MapPin, Phone, FileText, Loader2, ArrowRight } from 'lucide-react';

interface Props {
  onCreate: (data: any) => Promise<void>;
}

export default function PortfolioCreateForm({ onCreate }: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        headline: formData.get('headline') as string,
        bio: formData.get('bio') as string,
        years_experience: parseInt(formData.get('years_experience') as string) || undefined,
        business_name: formData.get('business_name') as string,
        business_description: formData.get('business_description') as string,
        service_area: formData.get('service_area') as string,
        phone: formData.get('phone') as string,
        specialty_ids: [],
      };
      await onCreate(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="max-w-3xl mx-auto py-10 px-4"
    >
      <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl border border-slate-200/80 dark:border-cyan-500/20 p-8 md:p-10 shadow-2xl overflow-hidden">
        {/* Hydro Ambient Light Refractions */}
        <div className="absolute -top-20 -right-20 w-56 h-56 rounded-full bg-cyan-500/10 dark:bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-56 h-56 rounded-full bg-blue-500/10 dark:bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/15 via-blue-500/10 to-indigo-500/15 dark:from-cyan-500/20 dark:to-blue-900/30 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Set Up Your Professional Showcase
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Highlight your expertise, services, and work experience in a sleek showcase profile.
              </p>
            </div>
          </div>

          <hr className="my-6 border-slate-200/60 dark:border-slate-800" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Professional Headline */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Briefcase size={14} className="text-cyan-500" />
                  <span>Professional Headline</span>
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="headline"
                  required
                  placeholder="e.g., Senior Full‑Stack Engineer & Consultant"
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                />
              </div>

              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Building2 size={14} className="text-cyan-500" />
                  <span>Business / Brand Name</span>
                </label>
                <input
                  type="text"
                  name="business_name"
                  placeholder="e.g., Spark Digital Studio"
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                />
              </div>

              {/* Years of Experience */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Clock size={14} className="text-cyan-500" />
                  <span>Years of Experience</span>
                </label>
                <input
                  type="number"
                  name="years_experience"
                  min="0"
                  placeholder="e.g., 5"
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                />
              </div>

              {/* Service Area */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <MapPin size={14} className="text-cyan-500" />
                  <span>Service Area / Location</span>
                </label>
                <input
                  type="text"
                  name="service_area"
                  placeholder="e.g., Yaoundé & Remote"
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                />
              </div>

              {/* Contact Phone */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <Phone size={14} className="text-cyan-500" />
                  <span>Contact Phone</span>
                </label>
                <input
                  type="text"
                  name="phone"
                  placeholder="e.g., +237 699 000 000"
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200"
                />
              </div>

              {/* About / Professional Bio */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                  <FileText size={14} className="text-cyan-500" />
                  <span>About / Professional Bio</span>
                </label>
                <textarea
                  name="bio"
                  rows={4}
                  placeholder="Share a short introduction regarding your expertise, services, and client goals..."
                  className="w-full px-4 py-3 bg-white/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 focus:outline-none text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all duration-200 leading-relaxed resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm rounded-2xl shadow-lg shadow-cyan-500/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Initializing Showcase...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Initialize Portfolio Profile</span>
                  <ArrowRight size={16} className="ml-1" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}