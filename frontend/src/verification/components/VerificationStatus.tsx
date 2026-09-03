import React from 'react';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { VerificationStatusType } from '../types/verification.types';

interface VerificationStatusProps {
  status: VerificationStatusType;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ status }) => {
  switch (status) {
    case 'pending':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-semibold border border-amber-200">
          <Clock size={14} className="text-amber-600 animate-pulse" />
          <span>Pending</span>
        </div>
      );
    case 'approved':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold border border-emerald-200">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>Approved</span>
        </div>
      );
    case 'requires_action':
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-semibold border border-rose-200">
          <AlertCircle size={14} className="text-rose-600" />
          <span>Requires Action</span>
        </div>
      );
    default:
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold border border-slate-200">
          <span>Unsubmitted</span>
        </div>
      );
  }
};