import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTyping(conversationId: string | null, currentUserId: string) {
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const channelRef = useRef<any>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase.channel(`typing:${conversationId}`);

    channel
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { user_id, typing } = payload;
        if (user_id === currentUserId) return;
        setTypingUsers((prev) => ({ ...prev, [user_id]: typing }));
        if (typing) {
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setTypingUsers((prev) => ({ ...prev, [user_id]: false }));
          }, 3000);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [conversationId, currentUserId]);

  const sendTyping = (isTyping: boolean) => {
    if (!channelRef.current) return;
    channelRef.current.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: currentUserId, typing: isTyping },
    });
  };

  return { typingUsers, sendTyping };
}