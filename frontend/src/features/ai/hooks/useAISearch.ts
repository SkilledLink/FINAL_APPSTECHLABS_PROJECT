// src/features/ai/hooks/useAISearch.ts
import { useCallback, useState } from 'react';
import {
  aiSearchService,
  type AISearchImageAnalysis,
  type AISearchParams,
} from '../services/aiSearchService';
import type { DiscoverProfessional } from '../../location/types/location.types';

export interface UseAISearchResult {
  professionals: DiscoverProfessional[];
  total: number;
  explanation: string | null;
  intent: string | null;
  imageAnalysis: AISearchImageAnalysis | null;
  loading: boolean;
  error: string | null;
  search: (params: AISearchParams) => Promise<void>;
  reset: () => void;
}

export function useAISearch(): UseAISearchResult {
  const [professionals, setProfessionals] = useState<DiscoverProfessional[]>([]);
  const [total, setTotal] = useState(0);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [intent, setIntent] = useState<string | null>(null);
  const [imageAnalysis, setImageAnalysis] = useState<AISearchImageAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (params: AISearchParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await aiSearchService.search(params);
      setProfessionals(res.professionals);
      setTotal(res.total);
      setExplanation(res.explanation ?? null);
      setIntent(res.intent);
      setImageAnalysis(res.imageAnalysis ?? null);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ??
        err?.message ??
        'AI search failed. Please try again.';
      setError(typeof msg === 'string' ? msg : 'AI search failed.');
      setProfessionals([]);
      setTotal(0);
      setExplanation(null);
      setImageAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProfessionals([]);
    setTotal(0);
    setExplanation(null);
    setIntent(null);
    setImageAnalysis(null);
    setError(null);
  }, []);

  return {
    professionals,
    total,
    explanation,
    intent,
    imageAnalysis,
    loading,
    error,
    search,
    reset,
  };
}