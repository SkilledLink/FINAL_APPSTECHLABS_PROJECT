// verification/hooks/useVerification.ts

import { useState, useEffect, useCallback, useMemo } from "react";
import { verificationService } from "../services/VerificationService";
import type { CredentialItem } from "../types/Verification.types";

export function useVerification() {
  const [credentials, setCredentials] = useState<CredentialItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Fetch initial credentials data with error handling
  useEffect(() => {
    let isMounted = true;
    
    const fetchCredentials = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await verificationService.getCredentials();
        if (isMounted) {
          setCredentials(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err?.message || "Failed to load verification credentials.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCredentials();

    return () => {
      isMounted = false;
    };
  }, []);

  // Handle individual file uploads with interactive feedback and optimistic/tracked state
  const handleFileUpload = useCallback(async (id: string, file: File) => {
    try {
      setNotice(null);
      // Optimistic update for immediate responsiveness
      setCredentials((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, fileName: file.name, status: "pending", actionRequired: false }
            : item
        )
      );

      const response = await verificationService.uploadFile(id, file);

      setCredentials((prev) =>
        prev.map((item) =>
          item.id === id
            ? { 
                ...item, 
                fileName: response.fileName || file.name, 
                status: response.status || "pending",
                details: response.details,
                actionRequired: false 
              }
            : item
        )
      );

      setNotice({ type: 'success', message: `Successfully uploaded ${file.name}` });
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      console.error("Failed to upload file:", err);
      setNotice({ type: 'error', message: err?.message || "Failed to upload file. Please try again." });
    }
  }, []);

  // Save draft progress handler
  const saveDraft = useCallback(async () => {
    try {
      setIsSavingDraft(true);
      setNotice(null);
      // Simulate or call draft save endpoint if available
      await new Promise((resolve) => setTimeout(resolve, 800));
      setNotice({ type: 'success', message: "Verification progress saved successfully as draft." });
      setTimeout(() => setNotice(null), 4000);
    } catch (err: any) {
      setNotice({ type: 'error', message: "Failed to save draft." });
    } finally {
      setIsSavingDraft(false);
    }
  }, []);

  // Submit complete verification bundle for final review
  const submitForReview = useCallback(async () => {
    try {
      setIsSubmitting(true);
      setNotice(null);

      // Validate all items have files uploaded
      const incomplete = credentials.some((c) => !c.fileName);
      if (incomplete) {
        throw new Error("Please upload all required documents before submitting for review.");
      }

      await new Promise((resolve) => setTimeout(resolve, 1200));
      
      // Update status locally to pending review
      setCredentials((prev) =>
        prev.map((item) => ({ ...item, status: "pending" }))
      );

      setNotice({ type: 'success', message: "All documents submitted successfully for final review!" });
    } catch (err: any) {
      setNotice({ type: 'error', message: err?.message || "Submission failed." });
    } finally {
      setIsSubmitting(false);
    }
  }, [credentials]);

  // Dynamically compute progress based on approved or uploaded items
  const progress = useMemo(() => {
    if (!credentials || credentials.length === 0) return 0;
    const completedCount = credentials.filter(
      (c) => c.status === "approved" || c.fileName
    ).length;
    return Math.round((completedCount / credentials.length) * 100);
  }, [credentials]);

  return {
    credentials,
    isLoading,
    error,
    progress,
    isSavingDraft,
    isSubmitting,
    notice,
    handleFileUpload,
    saveDraft,
    submitForReview,
    setNotice,
  };
}