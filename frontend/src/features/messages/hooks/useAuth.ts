// src/features/messages/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { normalizeId } from '../utils/idUtils';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    console.log('📦 Raw user from localStorage:', stored);

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('📦 Parsed user object:', parsed);

        const rawId = parsed.user_id || parsed.id;
        console.log('🔑 Raw ID from parsed object:', rawId);

        const cleanId = normalizeId(rawId);
        console.log('🧹 Cleaned ID:', cleanId);

        setUser({
          id: cleanId,
          email: parsed.email,
          first_name: parsed.first_name,
          last_name: parsed.last_name,
          account_type: parsed.account_type,
        });
      } catch (err) {
        console.error('❌ Failed to parse user:', err);
        setUser(null);
      }
    } else {
      console.warn('⚠️ No user found in localStorage');
      setUser(null);
    }
    setLoading(false);
  }, []);

  return { user, loading };
}