// src/features/verification/pages/VerificationPage.tsx

import { useCallback, useEffect, useState } from 'react';
import {
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { apiClient } from '../../../api/client';

type KYCState =
  | 'not_started'
  | 'pending'
  | 'manual_review'
  | 'approved'
  | 'rejected'
  | 'failed'
  | 'expired'
  | 'manual_approved'
  | 'manual_rejected';

interface KYCStatus {
  status: KYCState;
  attempts: number;
  max_attempts: number;
  can_retry: boolean;
  verified_at: string | null;
  last_attempt_at: string | null;
}

export default function VerificationPage() {
  const [status, setStatus] = useState<KYCStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const { data } = await apiClient.get<KYCStatus>(
        '/professionals/kyc/status'
      );
      setStatus(data);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ?? 'Failed to load verification status'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Poll while a session is in flight so the page updates the moment
  // the webhook flips status.
  useEffect(() => {
    if (!status) return;
    const waiting = ['pending', 'manual_review'].includes(status.status);
    if (!waiting) return;
    const id = window.setInterval(fetchStatus, 5000);
    return () => window.clearInterval(id);
  }, [status, fetchStatus]);

  const handleStart = async () => {
    setStarting(true);
    try {
      const { data } = await apiClient.post<{ url: string }>(
        '/professionals/kyc/start'
      );
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(
        err?.response?.data?.detail ?? 'Could not start verification'
      );
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!status) return null;

  const showRetryButton =
    status.can_retry &&
    (status.status === 'not_started' ||
      status.status === 'rejected' ||
      status.status === 'failed' ||
      status.status === 'expired' ||
      status.status === 'manual_rejected' ||
      status.status === 'pending');

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/60">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              Identity Verification
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify your identity to unlock the verified badge
            </p>
          </div>
        </div>

        <StatusPanel status={status} />

        {showRetryButton && (
          <button
            type="button"
            onClick={handleStart}
            disabled={starting}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-50"
          >
            {starting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ExternalLink className="h-4 w-4" />
            )}
            {status.status === 'not_started'
              ? 'Start verification'
              : 'Try again'}
          </button>
        )}

        <p className="mt-4 text-center text-[11px] text-slate-400">
          Attempts used: {status.attempts} / {status.max_attempts}
        </p>

        <button
          type="button"
          onClick={fetchStatus}
          className="mt-2 inline-flex w-full items-center justify-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh status
        </button>
      </div>
    </div>
  );
}

function StatusPanel({ status }: { status: KYCStatus }) {
  const { status: s, verified_at } = status;

  if (s === 'approved' || s === 'manual_approved') {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span className="text-sm font-semibold">Identity verified</span>
        </div>
        {verified_at && (
          <p className="mt-1 text-xs text-emerald-600/80 dark:text-emerald-400/80">
            Verified on {new Date(verified_at).toLocaleDateString()}
          </p>
        )}
      </div>
    );
  }

  if (s === 'pending') {
    return (
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-semibold">Verification in progress</span>
        </div>
        <p className="mt-1 text-xs text-blue-600/80 dark:text-blue-400/80">
          Complete the flow in the Didit window. This page updates automatically.
        </p>
      </div>
    );
  }

  if (s === 'manual_review') {
    return (
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-semibold">Under review</span>
        </div>
        <p className="mt-1 text-xs text-amber-600/80 dark:text-amber-400/80">
          Our team is reviewing your submission. Usually 24–48 hours.
        </p>
      </div>
    );
  }

  if (s === 'rejected' || s === 'manual_rejected' || s === 'failed') {
    return (
      <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4">
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
          <XCircle className="h-4 w-4" />
          <span className="text-sm font-semibold">
            Verification was not successful
          </span>
        </div>
        <p className="mt-1 text-xs text-rose-600/80 dark:text-rose-400/80">
          You can try again if you have attempts remaining.
        </p>
      </div>
    );
  }

  if (s === 'expired') {
    return (
      <div className="rounded-xl border border-slate-300/60 bg-slate-100/40 p-4 dark:border-slate-700 dark:bg-slate-800/30">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm font-semibold">Verification expired</span>
        </div>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Please start a new verification session.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm font-semibold">Not verified yet</span>
      </div>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
        Takes 2–3 minutes. You'll need a government ID and a selfie.
      </p>
    </div>
  );
}