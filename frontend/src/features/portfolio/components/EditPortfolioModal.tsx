import React from 'react';
import { motion } from 'framer-motion';
import { X, Layers, Loader2, Sparkles } from 'lucide-react';
import type { Portfolio } from '../../../types/portfolio';

interface EditPortfolioModalProps {
  portfolio: Portfolio;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loading?: boolean;
}

export default function EditPortfolioModal({
  portfolio,
  onClose,
  onSave,
  loading = false,
}: EditPortfolioModalProps) {
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      headline: formData.get('headline') as string,
      bio: formData.get('bio') as string,
      years_experience: parseInt(formData.get('years_experience') as string) || undefined,
      business_name: formData.get('business_name') as string,
      business_description: formData.get('business_description') as string,
      service_area: formData.get('service_area') as string,
      phone: formData.get('phone') as string,
      is_public: formData.get('is_public') === 'on',
    };
    await onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Hydro Glass Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal Glass Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/80 dark:border-cyan-500/20 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,150,255,0.25)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] max-w-xl w-full p-6 md:p-8 max-h-[90vh] overflow-y-auto overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Water Light Spheres */}
        <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-blue-500/10 dark:bg-blue-500/10 blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/15 via-sky-500/15 to-blue-600/15 dark:from-cyan-400/20 dark:to-blue-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shadow-inner">
              <Layers size={20} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Edit Portfolio
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update your professional profile and service details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
              Headline
            </label>
            <input
              type="text"
              name="headline"
              defaultValue={portfolio.headline || ''}
              placeholder="e.g. Senior Full Stack Developer & UI Designer"
              className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                Business Name
              </label>
              <input
                type="text"
                name="business_name"
                defaultValue={portfolio.business_name || ''}
                placeholder="e.g. Apex Tech Solutions"
                className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                Years Experience
              </label>
              <input
                type="number"
                name="years_experience"
                min="0"
                defaultValue={portfolio.years_experience || ''}
                placeholder="e.g. 5"
                className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                Service Area
              </label>
              <input
                type="text"
                name="service_area"
                defaultValue={portfolio.service_area || ''}
                placeholder="e.g. Worldwide / Remote"
                className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                defaultValue={portfolio.phone || ''}
                placeholder="+1 (555) 000-0000"
                className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-cyan-200/70 mb-1.5">
              Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              defaultValue={portfolio.bio || ''}
              placeholder="Tell clients about your expertise, passion, and background..."
              className="w-full px-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-cyan-900/30 rounded-xl focus:ring-2 focus:ring-cyan-500/50 dark:focus:ring-cyan-400/50 focus:outline-none text-sm text-slate-800 dark:text-slate-100 transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3 py-2 px-1">
            <input
              type="checkbox"
              id="is_public"
              name="is_public"
              defaultChecked={portfolio.is_public}
              className="w-4 h-4 text-cyan-600 rounded focus:ring-cyan-500 dark:bg-slate-800 dark:border-slate-700 cursor-pointer"
            />
            <label
              htmlFor="is_public"
              className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            >
              Make portfolio publicly visible to prospective clients
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 rounded-xl font-semibold text-sm shadow-md shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl font-semibold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}