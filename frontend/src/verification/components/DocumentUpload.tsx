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