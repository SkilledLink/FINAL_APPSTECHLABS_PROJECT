// verification/components/DocumentUpload.tsx

import React, { useState, useRef } from "react";
import { UploadCloud, FileCheck, RefreshCw, X, Eye } from "lucide-react";
import type { CredentialItem } from "../types/Verification.types";

interface DocumentUploadProps {
  credential: CredentialItem;
  onUpload: (id: string, file: File) => void;
  onRemove?: (id: string) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  credential,
  onUpload,
  onRemove,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (file: File) => {
    onUpload(credential.id, file);
    // Create preview for images if applicable
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const hasFile = Boolean(credential.fileName);

  return (
    <>
      <label
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 group w-full ${
          isDragging
            ? "border-blue-500 bg-blue-50/60 scale-[1.01]"
            : hasFile
            ? "border-emerald-200 bg-emerald-50/20 hover:border-grey-600 hover:bg-emerald-50/40"
            : "border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-blue-50/30"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        />

        {hasFile ? (
          <div className="flex flex-col items-center gap-2 w-full">
            <div className="p-3 bg-emerald-100 text-grey-600 rounded-xl transition group-hover:scale-105">
              <FileCheck className="w-6 h-6" />
            </div>
            <div className="w-full">
              <span className="font-semibold text-grey-800 text-xs sm:text-sm block truncate max-w-full px-2">
                {credential.fileName}
              </span>
              <span className="text-[11px] text-grey-600 font-medium block mt-0.5">
                Uploaded successfully • Click or drop to replace
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              {previewUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPreviewModal(true);
                  }}
                  className="px-2.5 py-1 bg-white border border-grey-200 text-grey-700 hover:bg-emerald-50 rounded-lg text-xs font-medium flex items-center gap-1 transition shadow-xs"
                >
                  <Eye className="w-3.5 h-3.5" /> Preview
                </button>
              )}
              <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-medium flex items-center gap-1 transition shadow-xs">
                <RefreshCw className="w-3.5 h-3.5" /> Replace
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="p-3 bg-blue-50 text-grey-600 rounded-xl group-hover:scale-105 transition-transform duration-300">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-slate-700 group-hover:text-grey-700 transition">
                <span className="font-semibold underline">Click to upload</span> or drag and drop
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {credential.description || "PDF, PNG, JPG or DOC up to 10MB"}
              </p>
            </div>
          </div>
        )}
      </label>

      {/* Interactive Document Preview Modal */}
      {showPreviewModal && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-all animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 truncate">
                {credential.fileName}
              </h3>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                aria-label="Close preview"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-80 bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border border-slate-200">
              <img
                src={previewUrl}
                alt={credential.fileName || "Document preview"}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition shadow-sm"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};