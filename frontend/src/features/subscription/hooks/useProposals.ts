// src/features/subscription/hooks/useProposals.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import type { AIProposal, DeepAnalysisResponse } from '../types/subscription.types';

export function useProposals(enabled = true) {
  const [proposals, setProposals] = useState<AIProposal[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<DeepAnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchedRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const { items } = await subscriptionService.listProposals('pending');
      setProposals(items);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    refresh();
  }, [enabled, refresh]);

  const generate = useCallback(async () => {
    setGenerating(true);
    setError(null);
    try {
      await subscriptionService.generateProposals();
      await refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Failed to generate proposals');
      // ⬇️ IMPORTANT: re-throw so ProposalReview can detect 429
      //    and start its own cooldown. Without this, the error
      //    never escapes this hook.
      throw err;
    } finally {
      setGenerating(false);
    }
  }, [refresh]);

  const accept = useCallback(async (id: string, finalValue?: string) => {
    try {
      await subscriptionService.acceptProposal(id, finalValue);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to accept');
      throw err;
    }
  }, []);

  const reject = useCallback(async (id: string, reason?: string) => {
    try {
      await subscriptionService.rejectProposal(id, reason);
      setProposals((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      setError(err?.message ?? 'Failed to reject');
      throw err;
    }
  }, []);

  const acceptBatch = useCallback(
    async (ids: string[], finalValues?: Record<string, string>) => {
      const res = await subscriptionService.acceptBatch(ids, finalValues);
      await refresh();
      return res;
    },
    [refresh],
  );

  const rejectBatch = useCallback(
    async (ids: string[], reason?: string) => {
      const res = await subscriptionService.rejectBatch(ids, reason);
      await refresh();
      return res;
    },
    [refresh],
  );

  const runDeepAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await subscriptionService.runDeepAnalysis();
      setAnalysis(res);
      return res;
    } catch (err: any) {
      setError(err?.message ?? 'Deep analysis failed');
      throw err; // already re-throws — keep it that way
    } finally {
      setAnalyzing(false);
    }
  }, []);

  return {
    proposals,
    loading,
    generating,
    analyzing,
    analysis,
    error,
    refresh,
    generate,
    accept,
    reject,
    acceptBatch,
    rejectBatch,
    runDeepAnalysis,
  };
}