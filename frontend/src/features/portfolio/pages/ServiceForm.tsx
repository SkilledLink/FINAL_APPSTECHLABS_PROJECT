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
import type { Service } from '../../../api/portfolioApi';

interface ServiceFormProps {
  service?: Service | null;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
}

export default function ServiceForm({ service, onClose, onSave }: ServiceFormProps) {
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
      /* Top offset (pt-20 sm:pt-24) ensures modal renders comfortably below header navbar */
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start sm:items-center justify-center p-4 pt-20 sm:pt-24 overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 20, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 320 }}
        className="relative my-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Effects */}
        <div className="absolute top-0 left-1/3 -mt-10 w-44 h-44 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-10 -mt-10 w-36 h-36 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl">
              <Wrench size={22} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {service ? 'Edit Service' : 'Add New Service'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {service ? 'Update service pricing & parameters' : 'Define a new offering for your service catalog'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 my-4 relative z-10 custom-scrollbar flex-1">
          {/* Service Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Service Title <span className="text-rose-500">*</span>
            </label>
            <div className="relative flex items-center">
              <Sparkles size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="e.g., Interior Painting & Surface Prep"
              />
            </div>
          </div>

          {/* Category & Pricing Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <div className="relative flex items-center">
                <Tag size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="e.g., Painting"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Pricing Structure
              </label>
              <div className="relative flex items-center">
                <Layers size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <select
                  value={formData.pricing_type}
                  onChange={(e) => setFormData({ ...formData, pricing_type: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
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
              <div className="relative flex items-center">
                <DollarSign size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.starting_price}
                  onChange={(e) => setFormData({ ...formData, starting_price: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Estimated Duration
              </label>
              <div className="relative flex items-center">
                <Clock size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={formData.estimated_duration}
                  onChange={(e) => setFormData({ ...formData, estimated_duration: e.target.value })}
                  placeholder="e.g., 2-3 hours"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Service Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Service Coverage Area
            </label>
            <div className="relative flex items-center">
              <MapPin size={16} className="absolute left-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={formData.service_area}
                onChange={(e) => setFormData({ ...formData, service_area: e.target.value })}
                placeholder="e.g., Yaoundé & surrounding areas"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Service Description
            </label>
            <div className="relative">
              <FileText size={16} className="absolute left-3.5 top-3 text-slate-400 pointer-events-none" />
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 focus:outline-none transition-all"
                placeholder="Detail what is included, materials used, or client preparation required..."
              />
            </div>
          </div>

          {/* Service Flags & Status Toggles Card */}
          <div className="p-3.5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 space-y-3 mt-2">
            {/* Active Service Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${formData.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  <Check size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Active Service</p>
                  <p className="text-[11px] text-slate-400">Visible to prospective clients</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="border-t border-slate-200/40 dark:border-slate-700/40" />

            {/* Emergency Service Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${formData.is_emergency_service ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                  <AlertTriangle size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Emergency / Urgent Support</p>
                  <p className="text-[11px] text-slate-400">High priority dispatch or off-hours service</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={formData.is_emergency_service}
                  onChange={(e) => setFormData({ ...formData, is_emergency_service: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>
        </form>

        {/* Modal Action Footer */}
        <div className="flex gap-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 relative z-10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-blue-500/25 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Saving Service...
              </>
            ) : service ? (
              'Save Changes'
            ) : (
              'Create Service'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}