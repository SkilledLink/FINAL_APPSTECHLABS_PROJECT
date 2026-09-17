// src/features/messages/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { normalizeId } from '../utils/idUtils';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');

    // JWT may live at various keys depending on your login flow — check them all.
    const jwt =
      localStorage.getItem('access_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('jwt') ||
      null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const cleanId = normalizeId(parsed.user_id || parsed.id);

        setUser({
          id: cleanId,
          email: parsed.email,
          first_name: parsed.first_name,
          last_name: parsed.last_name,
          account_type: parsed.account_type,
        });
        setToken(parsed.access_token || parsed.token || jwt);
      } catch (err) {
        console.error('❌ Failed to parse user:', err);
        setUser(null);
        setToken(jwt);
      }
    } else {
      setUser(null);
      setToken(jwt);
    }
    setLoading(false);
  }, []);

  return { user, token, loading };
}