// src/features/admin/hooks/usePayments.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { paymentsService } from '../services/paymentsService';
import type { ProfessionalPaymentAdmin } from '../types/admin.types';

const BATCH_SIZE = 25;

export const usePayments = () => {
  const [payments, setPayments] = useState<ProfessionalPaymentAdmin[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const runIdRef = useRef(0);

  const load = useCallback(async () => {
    const runId = ++runIdRef.current;
    setLoading(true);
    setLoadingMore(false);
    setError(null);
    setPayments([]);
    setTotal(0);

    let skip = 0;
    let accumulated: ProfessionalPaymentAdmin[] = [];
    let grandTotal: number | null = null;

    try {
      while (true) {
        if (runId !== runIdRef.current) return;
        const { items, total: t } = await paymentsService.getPage(
          skip,
          BATCH_SIZE,
        );
        if (runId !== runIdRef.current) return;

        if (grandTotal === null) grandTotal = t;
        if (items.length === 0) break;

        accumulated = accumulated.concat(items);
        setPayments(accumulated);
        setTotal(grandTotal);

        if (skip === 0) {
          setLoading(false);
          if (grandTotal > accumulated.length) setLoadingMore(true);
        }

        skip += items.length;

        if (
          grandTotal !== null &&
          (accumulated.length >= grandTotal || items.length < BATCH_SIZE)
        ) {
          break;
        }
      }
    } catch (e) {
      if (runId !== runIdRef.current) return;
      setError(e instanceof Error ? e.message : 'Failed to load payments');
    } finally {
      if (runId === runIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refund = useCallback(async (id: string, reason: string) => {
    const updated = await paymentsService.refund(id, reason);
    setPayments((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  return {
    payments,
    total,
    loading,
    loadingMore,
    error,
    refetch: load,
    refund,
  };
};