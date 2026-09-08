// src/features/profile/components/ServiceQuickView.tsx

import React from 'react';
import { ArrowRight, Zap } from 'lucide-react';
import type { UserProfile } from '../types/profile.types';

interface ServiceQuickViewProps {
  profile: UserProfile;
  onRequestService?: () => void;
  onViewAllServices?: () => void;
}

export const ServiceQuickView: React.FC<ServiceQuickViewProps> = ({
  profile,
  onRequestService,
  onViewAllServices,
}) => {
  const services = profile.professional?.services || [];

  if (!profile.professional) return null;

  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
            Services
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            What I offer
          </p>
        </div>
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500/20 shrink-0" />
      </div>

      <div className="space-y-2">
        {services.map((service, idx) => (
          <div
            key={idx}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50"
          >
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {service}
            </span>
          </div>
        ))}
        {services.length === 0 && (
          <p className="text-sm text-slate-400 dark:text-slate-500">No services listed.</p>
        )}
      </div>

      <div className="pt-1 sm:pt-2 space-y-2">
        <button
          onClick={onRequestService}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl sm:rounded-2xl shadow-xs transition active:scale-[0.98]"
        >
          Request Service Quote
        </button>

        <button
          onClick={onViewAllServices}
          className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline py-1"
        >
          <span>View All Services</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};