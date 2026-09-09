// src/features/portfolio/components/PortfolioServiceForm.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  X,
  Tag,
  DollarSign,
  Clock,
  MapPin,
  Layers,
  AlertTriangle,
  Check,
  Loader2,
  Wrench,
  FileText,
  Sparkles,
} from 'lucide-react';
import type { Service } from '../../../types/portfolio';

interface PortfolioServiceFormProps {
  service?: Service | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function PortfolioServiceForm({
  service,
  onClose,
  onSave,
}: PortfolioServiceFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    starting_price: '',
    pricing_type: 'fixed',
    estimated_duration: '',
    service_area: '',
    is_active: true,
    is_emergency_service: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || '',
        description: service.description || '',
        category: service.category || '',
        starting_price: service.starting_price?.toString() || '',
        pricing_type: service.pricing_type || 'fixed',
        estimated_duration: service.estimated_duration || '',
        service_area: service.service_area || '',
        is_active: service.is_active !== undefined ? service.is_active : true,
        is_emergency_service: service.is_emergency_service || false,
      });
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        starting_price: formData.starting_price ? parseFloat(formData.starting_price) : undefined,
      };
      await onSave(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative my-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-cyan-500/20 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hydro Ambient Light Refractions */}
        <div className="absolute top-0 left-1/4 -mt-12 w-48 h-48 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-10 -mt-10 w-36 h-36 bg-blue-500/15 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 text-cyan-600 dark:text-cyan-400 rounded-2xl border border-cyan-500/30">
              <Wrench size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {service ? 'Edit Service' : 'Add New Service'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {service ? 'Update service pricing & parameters' : 'Define a new offering for your service catalog'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all duration-200 active:scale-95"
            title="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 my-4 custom-scrollbar flex-1 relative z-10">
          {/* Title Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Service Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Sparkles size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all duration-200"
                placeholder="e.g., Full-Stack Web App Development"
              />
            </div>
          </div>

          {/* Category & Pricing Structure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative">
                <Tag size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all duration-200"
                  placeholder="e.g., Software Engineering"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Pricing Structure
              </label>
              <div className="relative">
                <Layers size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <select
                  value={formData.pricing_type}
                  onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all duration-200"
                >
                  <option value="fixed">Fixed Rate</option>
                  <option value="starting_from">Starting From</option>
                  <option value="hourly">Hourly Rate</option>
                  <option value="daily">Daily Rate</option>
                  <option value="quote_required">Quote Required</option>
                </select>
              </div>
            </div>
          </div>

          {/* Starting Price & Estimated Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Starting Price
              </label>
              <div className="relative">
                <DollarSign size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all duration-200"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Estimated Duration
              </label>
              <div className="relative">
                <Clock size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                  placeholder="e.g., 2-3 weeks"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Service Coverage Area
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.service_area}
                onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
                placeholder="e.g., Remote / Worldwide"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500 focus:outline-none transition-all duration-200"
                placeholder="Detail deliverables, tech stack, or client requirements..."
              />
            </div>
          </div>

          {/* Toggles Box */}
          <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 space-y-3.5">
            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    formData.is_active
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-200 dark:bg-slate-700/80 text-slate-400'
                  }`}
                >
                  <Check size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Service</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Visible to prospective clients</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="border-t border-slate-200/50 dark:border-slate-700/50" />

            {/* Emergency Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-1.5 rounded-xl transition-colors ${
                    formData.is_emergency_service
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-slate-200 dark:bg-slate-700/80 text-slate-400'
                  }`}
                >
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Emergency / Urgent Support</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">High priority dispatch</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_emergency_service}
                  onChange={(e) => setFormData({ ...formData, is_emergency_service: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-6 bg-slate-200 dark:bg-slate-700/80 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 rounded-2xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving…
                </>
              ) : service ? (
                'Save Changes'
              ) : (
                'Create Service'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}