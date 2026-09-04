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
import React, { useRef } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { VerificationDocument } from '../types/verification.types';
import { VerificationStatus } from './VerificationStatus';

interface DocumentUploadProps {
  document: VerificationDocument;
  onUpload: (file: File) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ document, onUpload }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-semibold">
              <FileText size={18} />
            </div>
            <h3 className="font-bold text-slate-800 text-base">{document.title}</h3>
          </div>
        </div>

        {/* Dropzone area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-purple-400 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-purple-50/30 transition-all group flex flex-col items-center justify-center min-h-[160px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.jpg,.png"
          />
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-purple-600 group-hover:scale-105 transition-all mb-3">
            <UploadCloud size={20} />
          </div>
          <p className="text-xs text-slate-600 font-medium max-w-[220px]">
            {document.fileName ? (
              <span className="text-purple-700 font-semibold flex items-center justify-center gap-1">
                <CheckCircle size={14} /> {document.fileName}
              </span>
            ) : (
              document.description
            )}
          </p>
        </div>
      </div>

      {/* Status and Action bar */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block mb-1 font-medium">Live status</span>
          <VerificationStatus status={document.status} />
        </div>
        {document.status === 'requires_action' && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 text-xs font-semibold text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors cursor-pointer"
          >
            View Details
          </button>
        )}
      </div>
    </div>
  );
};