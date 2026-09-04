// verification/pages/VerificationPage.tsx

import React, { useState } from 'react';
import { useVerification } from '../hooks/useVerification';
import { VerificationForm } from '../components/VerificationForm';

export const VerificationPage: React.FC = () => {
  const { credentials, isLoading, progress, handleFileUpload } = useVerification();
  
  // Interactive state
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Handlers for interactive actions with loading/feedback states
  const handleSaveDraft = async () => {
    try {
      setIsSaving(true);
      setSaveMessage(null);
      // Simulate API call to save progress
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSaveMessage('Draft saved successfully!');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      setSaveMessage('Failed to save draft. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);
      // Simulate submission checks
      if (progress < 100) {
        throw new Error('Please complete all verification requirements before submitting.');
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert('Documents submitted successfully for review!');
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please check your uploads.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-sm animate-pulse">
        Loading credentials center...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
        
        {/* Header Section */}
        <div className="text-center max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900">
            Verification & Credentials Center
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Submit your documents to get verified and unlock premium features.
          </p>
        </div>

        {/* Global Feedback Banners */}
        {saveMessage && (
          <div className="max-w-md mx-auto w-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm text-center transition-all shadow-sm">
            {saveMessage}
          </div>
        )}

        {submitError && (
          <div className="max-w-md mx-auto w-full bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm text-center transition-all shadow-sm">
            {submitError}
          </div>
        )}

        {/* Form Container */}
        <div className="w-full">
          <VerificationForm credentials={credentials} onUpload={handleFileUpload} />
        </div>

        {/* Responsive Interactive Control Panel / Footer Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-6 transition-all hover:shadow-md">
          
          {/* Progress Indicator */}
          <div className="w-full lg:max-w-sm">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Verification Progress
              </span>
              <span className="text-sm font-bold text-slate-900">{progress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Interactive Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <button
              onClick={handleSaveDraft}
              disabled={isSaving}
              className="w-full sm:w-auto px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-700" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save & Continue Later'
              )}
            </button>

            <button
              onClick={handleSubmitForReview}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit for Review'
              )}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
};