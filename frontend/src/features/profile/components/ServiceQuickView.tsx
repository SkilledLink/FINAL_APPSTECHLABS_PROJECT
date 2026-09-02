import React from 'react';
import { Clock, ArrowRight, Zap } from 'lucide-react';
import type { ServiceItem } from '../types/profile.types';

interface ServiceQuickViewProps {
  services: ServiceItem[];
  onRequestService?: () => void;
  onViewAllServices?: () => void;
}

export const ServiceQuickView: React.FC<ServiceQuickViewProps> = ({
  services,
  onRequestService,
  onViewAllServices,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 sm:pb-3">
        <div>
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100">
            Service Quick-View
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            Available services & pricing
          </p>
        </div>
        <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-500/20 shrink-0" />
      </div>

      <div className="space-y-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/50 space-y-1"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {service.name}
              </span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 whitespace-nowrap shrink-0">
                {service.priceLabel}
              </span>
            </div>

            {service.responseNotice && (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-medium text-amber-600 dark:text-amber-400">
                <Clock className="w-3 h-3 shrink-0" />
                <span className="truncate">{service.responseNotice}</span>
              </div>
            )}
          </div>
        ))}
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