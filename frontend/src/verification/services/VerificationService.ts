import { VerificationDocument } from '../types/verification.types';

const MOCK_DOCUMENTS: VerificationDocument[] = [
  {
    id: 'contractor-license',
    title: 'Contractor License',
    description: 'Drag & drop or browse files to upload your valid state or local contractor license',
    status: 'pending',
    fileName: 'license_2026.pdf',
    fileSize: '2.4 MB'
  },
  {
    id: 'insurance-cert',
    title: 'Insurance Certificate',
    description: "Drag & drop or browse files to general liability or workers' compensation certificate",
    status: 'approved',
    fileName: 'liability_ins.pdf',
    fileSize: '1.8 MB'
  },
  {
    id: 'business-reg',
    title: 'Business Registration',
    description: 'Drag & drop or browse files to proof of business entity (e.g., LLC, Corp) and EIN',
    status: 'requires_action',
  }
];

export const verificationService = {
  async getVerificationStatus(): Promise<{ documents: VerificationDocument[]; progress: number }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ documents: MOCK_DOCUMENTS, progress: 66 });
      }, 400);
    });
  },

  async uploadDocument(documentId: string, file: File): Promise<VerificationDocument> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const updatedDoc: VerificationDocument = {
          id: documentId,
          title: documentId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          description: 'Uploaded successfully',
          status: 'pending',
          fileName: file.name,
          fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          updatedAt: new Date().toISOString()
        };
        resolve(updatedDoc);
      }, 600);
    });
  },

  async submitForReview(): Promise<{ success: boolean }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 800);
    });
  }
};