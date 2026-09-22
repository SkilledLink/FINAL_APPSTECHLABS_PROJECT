// src/features/messages/components/MessageUserButton.tsx

import { forwardRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, MessageSquare } from 'lucide-react';
import { conversationApi } from '../../../api/conversationApi';
import { useAuth } from '../hooks/useAuth';
import { normalizeId } from '../utils/idUtils';

export interface MessageUserButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick' | 'children'
  > {
  /** Target user's id. If falsy, or if it matches the current user, the button is disabled. */
  userId?: string | null;

  /** Optional custom content. Defaults to a MessageSquare icon + "Message". */
  children?: React.ReactNode;

  className?: string;

  /** Force-disable (e.g. viewer can't message this user). */
  disabled?: boolean;

  /** Called when the direct-conversation lookup fails. */
  onError?: (error: unknown) => void;

  /** Veto hook — return `false` to cancel opening the conversation. */
  onBeforeOpen?: () => boolean | void;

  /** Fired after a conversation id has been resolved, before navigation. */
  onAfterOpen?: (conversationId: string) => void;
}

/**
 * Renders a button that opens (or creates) a direct conversation with `userId`
 * and navigates to `/home/messages/:conversationId`.
 *
 * Reusable anywhere you have a user id: profile headers, comment lists,
 * job cards, follower lists, etc.
 *
 * Behaviour:
 *   - Disabled when `userId` is missing, equals the current user, or
 *     `disabled` is true.
 *   - Shows a spinner + "Opening…" while the backend resolves the conversation.
 *   - Errors surface via `onError`; the button returns to idle so the user
 *     can retry.
 */
export const MessageUserButton = forwardRef<
  HTMLButtonElement,
  MessageUserButtonProps
>(
  (
    {
      userId,
      children,
      className,
      disabled = false,
      onError,
      onBeforeOpen,
      onAfterOpen,
      ...rest
    },
    ref
  ) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const currentUserId = normalizeId(user?.id);
    const targetId = normalizeId(userId);

    const isSelf = !!targetId && !!currentUserId && targetId === currentUserId;
    const isInactive = !targetId || isSelf || disabled;

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isInactive || loading) return;

        if (onBeforeOpen && onBeforeOpen() === false) return;

        event.preventDefault();
        event.stopPropagation();

        setLoading(true);
        try {
          const conversation = await conversationApi.getOrCreateDirect(targetId);
          onAfterOpen?.(conversation.id);

          // Route lives under AppLayout at /home/messages/:conversationId
          navigate(`/home/messages/${conversation.id}`);

          // Note: we don't reset `loading` on success — the component unmounts
          // as soon as navigation commits, and resetting would cause a flash.
        } catch (err) {
          onError?.(err);
          setLoading(false);
        }
      },
      [
        isInactive,
        loading,
        onBeforeOpen,
        onAfterOpen,
        onError,
        targetId,
        navigate,
      ]
    );

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={isInactive || loading}
        aria-busy={loading}
        aria-disabled={isInactive || loading}
        className={className}
        {...rest}
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Opening…</span>
          </>
        ) : (
          children ?? (
            <>
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Message</span>
            </>
          )
        )}
      </button>
    );
  }
);

MessageUserButton.displayName = 'MessageUserButton';

export default MessageUserButton;