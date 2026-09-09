import { useState, useCallback } from 'react';
import type { UserRole, MatchRecommendation, ActionCard } from '../types/ai.types';
import {
  searchWorkers,
  searchHirers,
  extractTradeAndLocation,
  formatWorkerMatches,
  formatJobMatches,
} from '../services/aiService';

interface UseAIResult {
  role: UserRole;
  setRole: (role: UserRole) => void;
  isSearching: boolean;
  performSearch: (role: UserRole, query: string) => Promise<{
    content: string;
    recommendations: MatchRecommendation[];
    actionCards: ActionCard[];
  }>;
}

export function useAI(): UseAIResult {
  const [role, setRole] = useState<UserRole>(null);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (searchRole: UserRole, query: string) => {
    setIsSearching(true);
    try {
      const { trade, location } = extractTradeAndLocation(query);

      if (searchRole === 'hirer') {
        const matches = await searchWorkers(trade, location);
        return {
          content: formatWorkerMatches(matches),
          recommendations: matches,
          actionCards: [] as ActionCard[],
        };
      } else {
        const matches = await searchHirers(trade, location);
        return {
          content: formatJobMatches(matches),
          recommendations: matches,
          actionCards: [] as ActionCard[],
        };
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { role, setRole, isSearching, performSearch };
}