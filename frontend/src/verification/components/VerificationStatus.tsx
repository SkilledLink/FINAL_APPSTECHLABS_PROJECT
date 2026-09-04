// verification/components/VerificationStatus.tsx

import React, { useState } from 'react';
import { CheckCircle2, Clock, AlertTriangle, Info, X } from 'lucide-react';
import type { VerificationStatusType } from '../types/Verification.types';

interface VerificationStatusProps {
  status: VerificationStatusType;
  /** Optional detailed message to display in an interactive tooltip or modal */
  details?: string;
  /** Optional callback when a user clicks the status badge for action */
  onActionClick?: () => void;
}

export const VerificationStatus: React.FC<VerificationStatusProps> = ({ 
  status, 
  details,
  onActionClick 
}) => {
  const [showModal, setShowModal] = useState(false);

  const handleBadgeClick = () => {
    if (onActionClick) {
      onActionClick();
    } else if (details) {
      setShowModal(true);
    }
  };

  const renderBadgeContent = () => {
    switch (status) {
      case 'approved':
        return (
          <span 
            onClick={handleBadgeClick}
            role={details || onActionClick ? 'button' : undefined}
            tabIndex={details || onActionClick ? 0 : undefined}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 transition-all ${
              details || onActionClick ? 'cursor-pointer hover:bg-emerald-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500' : ''
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 
            <span>Approved</span>
            {details && <Info className="w-3 h-3 text-emerald-500 ml-0.5" />}
          </span>
        );
      case 'pending':
        return (
          <span 
            onClick={handleBadgeClick}
            role={details || onActionClick ? 'button' : undefined}
            tabIndex={details || onActionClick ? 0 : undefined}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/60 transition-all ${
              details || onActionClick ? 'cursor-pointer hover:bg-amber-100 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500' : ''
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" /> 
            <span>Pending Review</span>
            {details && <Info className="w-3 h-3 text-amber-500 ml-0.5" />}
          </span>
        );
      case 'requires_action':
        return (
          <span 
            onClick={handleBadgeClick}
            role={details || onActionClick ? 'button' : undefined}
            tabIndex={details || onActionClick ? 0 : undefined}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200/60 transition-all shadow-sm ${
              details || onActionClick ? 'cursor-pointer hover:bg-rose-100 hover:shadow focus:outline-none focus:ring-2 focus:ring-rose-500' : ''
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> 
            <span>Requires Action</span>
            {details && <Info className="w-3 h-3 text-rose-500 ml-0.5" />}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderBadgeContent()}

      {/* Interactive Details Modal / Popover for Mobile & Desktop */}
      {showModal && details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 relative flex flex-col gap-4">
            <button 
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                {status === 'approved' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {status === 'pending' && <Clock className="w-5 h-5 text-amber-600" />}
                {status === 'requires_action' && <AlertTriangle className="w-5 h-5 text-rose-600" />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 capitalize">
                  {status.replace('_', ' ')} Details
                </h3>
                <p className="text-xs text-slate-500">Status Information</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed">
              {details}
            </p>

            <button
              onClick={() => setShowModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};