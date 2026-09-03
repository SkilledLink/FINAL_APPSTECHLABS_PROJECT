import React from 'react';
import { DocumentUpload } from './DocumentUpload';
import { VerificationDocument } from '../types/verification.types';

interface VerificationFormProps {
  documents: VerificationDocument[];
  onUpload: (id: string, file: File) => void;
}

export const VerificationForm: React.FC<VerificationFormProps> = ({ documents, onUpload }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {documents.map((doc) => (
        <DocumentUpload
          key={doc.id}
          document={doc}
          onUpload={(file) => onUpload(doc.id, file)}
        />
      ))}
    </div>
  );
};