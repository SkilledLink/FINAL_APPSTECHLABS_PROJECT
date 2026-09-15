// src/features/reports/hooks/useReport.ts
import { useCallback, useState } from 'react';
import axios from 'axios';
import { reportApi } from '../../../api/client';
import type { CreateReportInput } from '../types/report.types';

interface UseReportResult {
  submitReport: (input: CreateReportInput) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  /** True when the backend returned 409 (already reported this target) */
  alreadyReported: boolean;
  success: boolean;
  reset: () => void;
}

/**
 * Pull a human message out of whatever axios/FastAPI throws at us.
 *
 * FastAPI shapes we handle:
 *   400 { detail: "You cannot report yourself" }
 *   404 { detail: "User not found" }
 *   409 { detail: "You have already reported this item" }
 *   422 { detail: [{ msg, loc, type }, ...] }
 */
function extractError(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const detail = err.response?.data?.detail;

    // Simple string detail
    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }

    // FastAPI validation array
    if (Array.isArray(detail) && detail.length > 0) {
      const first = detail[0];
      if (typeof first === 'string') return first;
      if (first && typeof first === 'object' && 'msg' in first) {
        return String((first as { msg: unknown }).msg);
      }
    }

    // Fallback by status
    switch (status) {
      case 400: return 'Invalid report. Please check your input.';
      case 401: return 'Please sign in to report.';
      case 403: return "You don't have permission to report this.";
      case 404: return 'The item you tried to report no longer exists.';
      case 409: return 'You have already reported this item.';
      case 429: return 'Too many reports. Please try again later.';
      default:
        if (status && status >= 500) {
          return 'Server error. Please try again later.';
        }
        return err.message || 'Something went wrong. Please try again.';
    }
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong. Please try again.';
}

export function useReport(): UseReportResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyReported, setAlreadyReported] = useState(false);
  const [success, setSuccess] = useState(false);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setAlreadyReported(false);
    setSuccess(false);
  }, []);

  const submitReport = useCallback(
    async (input: CreateReportInput): Promise<boolean> => {
      setLoading(true);
      setError(null);
      setAlreadyReported(false);
      setSuccess(false);

      try {
        await reportApi.create({
          target_id: input.targetId,
          target_type: input.targetType,
          reason: input.reason,
          description: input.description?.trim() || null,
        });
        setSuccess(true);
        return true;
      } catch (err) {
        const message = extractError(err);
        const isDuplicate =
          axios.isAxiosError(err) && err.response?.status === 409;

        setError(message);
        setAlreadyReported(isDuplicate);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submitReport, loading, error, alreadyReported, success, reset };
}