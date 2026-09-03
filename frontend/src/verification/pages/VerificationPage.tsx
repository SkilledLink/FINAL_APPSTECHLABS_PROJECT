import React from 'react';
import { useVerification } from '../hooks/useVerification';
import { VerificationForm } from '../components/VerificationForm';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function VerificationPage() {
  const { documents, progress, isLoading, isSubmitting, handleUpload, handleSubmitReview } = useVerification();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header section */}
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 mb-4 shadow-sm">
          <ShieldCheck size={26} />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Verification & Credentials Center
        </h1>
        <p className="text-slate-500 text-sm mt-2">
          Submit your documents to get verified and unlock premium features.
        </p>
      </div>

      {/* Form Grid */}
      <VerificationForm documents={documents} onUpload={handleUpload} />

      {/* Bottom Footer Bar */}
      <div className="mt-10 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="w-full md:w-1/3">
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
            <span>Verification Progress</span>
            <span className="text-purple-600">{progress}%</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Save & Continue Later
          </button>
          <button
            type="button"
            onClick={handleSubmitReview}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl shadow-md shadow-purple-500/25 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}