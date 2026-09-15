import { useEffect, useState, useCallback } from 'react';
import { teamService } from '../services/teamService';
import type { TeamMember } from '../types/moderator.types';

export const useTeam = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setTeam(await teamService.getAll()); }
    catch (e) { setError(e instanceof Error ? e.message : 'Failed to load team'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { team, loading, error, refetch: load };
};