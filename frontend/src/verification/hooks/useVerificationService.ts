import { useState, useEffect, useCallback } from 'react';
import { VerificationDocument } from '../types/Verification.types';
import { verificationService } from '../services/VerificationService';

// ...existing code...
export function useVerification() {
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVerification = useCallback(async () => {
    setError(null);
    setIsLoading(true);

    try {
      const data = await verificationService.getVerificationStatus();

      setDocuments(data?.documents ?? []);
      setProgress(data?.progress ?? 0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load verification status');
      setDocuments([]);
      setProgress(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchVerification();
  }, [fetchVerification]);

  const handleUpload = async (documentId: string, file: File) => {
    setError(null);

    try {
      const updated = await verificationService.uploadDocument(documentId, file);

      setDocuments((prev) =>
        prev.map((doc) => (doc.id === documentId ? updated : doc))
      );

      await fetchVerification();
    } catch (err: any) {
      setError(err?.message || 'Upload failed');
    }
  };

  const handleSubmitReview = async () => {
    setError(null);

    try {
      setIsSubmitting(true);
      await verificationService.submitForReview();
      await fetchVerification();
    } catch (err: any) {
      setError(err?.message || 'Submission failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    documents,
    progress,
    isLoading,
    isSubmitting,
    error,
    handleUpload,
    handleSubmitReview,
    refetch: fetchVerification,
  };
}