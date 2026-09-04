// verification/components/VerificationForm.tsx

import React, { useState } from "react";
import { UploadCloud, FileText, X, AlertCircle } from "lucide-react";
import type { CredentialItem } from "../types/Verification.types";
import { DocumentUpload } from "./DocumentUpload";
import { VerificationStatus } from "./VerificationStatus";

interface VerificationFormProps {
  credentials: CredentialItem[];
  onUpload: (id: string, file: File) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({
  credentials,
  onUpload,
}) => {
  const [selectedCredential, setSelectedCredential] = useState<CredentialItem | null>(null);

  if (!credentials || credentials.length === 0) {
    return (
      <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-sm mb-10">
        <FileText className="w-8 h-8 mx-auto mb-2 text-slate-400" />
        <p className="text-sm font-medium">No credentials required at this time.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {credentials.map((cred) => (
          <div
            key={cred.id}
            className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-slate-300 group"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-100 transition-colors shrink-0">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                    {cred.title}
                  </h3>
                  {cred.description && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">{cred.description}</p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <DocumentUpload credential={cred} onUpload={onUpload} />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Live status
                </p>
                <VerificationStatus 
                  status={cred.status} 
                  details={cred.details || cred.feedback} 
                />
              </div>

              {cred.actionRequired && (
                <button
                  onClick={() => setSelectedCredential(cred)}
                  className="px-3 py-1.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 text-xs font-medium rounded-xl transition shrink-0 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Credential Detail Modal */}
      {selectedCredential && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-all animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 relative flex flex-col gap-4">
            <button
              onClick={() => setSelectedCredential(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCredential.title}
                </h3>
                <p className="text-xs text-slate-500">Action Required Details</p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-700 space-y-2">
              <p className="font-medium text-slate-900">Feedback from Reviewer:</p>
              <p className="text-slate-600 leading-relaxed">
                {selectedCredential.details || selectedCredential.feedback || "Please re-upload a clear document that matches the listed requirements."}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedCredential(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};