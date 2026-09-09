import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export function usePresence(conversationId: string | null, currentUserId: string) {
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`presence:${conversationId}`);

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const userIds = Object.keys(state);
        setOnlineUsers(userIds);
      })
      .subscribe(async status => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: currentUserId,
            online_at: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [conversationId, currentUserId]);

  return { onlineUsers };
}