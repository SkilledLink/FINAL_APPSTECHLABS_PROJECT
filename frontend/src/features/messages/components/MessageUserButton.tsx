// src/features/messages/components/MessageUserButton.tsx

import { forwardRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CheckCircle2, Clock, Loader2, MessageSquare } from 'lucide-react';
import { conversationApi } from '../../../api/conversationApi';
import { useAuth } from '../hooks/useAuth';
import { normalizeId } from '../utils/idUtils';

export interface MessageUserButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onClick' | 'children'
  > {
  userId?: string | null;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onError?: (error: unknown) => void;
  onBeforeOpen?: () => boolean | void;
  onAfterOpen?: (
    conversationId: string,
    status: 'active' | 'pending'
  ) => void;
}

type ButtonState = 'idle' | 'loading' | 'pending' | 'active';

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
    const [state, setState] = useState<ButtonState>('idle');
    const [pendingConvId, setPendingConvId] = useState<string | null>(null);

    const currentUserId = normalizeId(user?.id);
    const targetId = normalizeId(userId);

    const isSelf = !!targetId && !!currentUserId && targetId === currentUserId;
    const isInactive = !targetId || isSelf || disabled;

    const handleClick = useCallback(
      async (event: React.MouseEvent<HTMLButtonElement>) => {
        if (isInactive || state === 'loading') return;

        // Second click while pending → navigate to the pending conversation
        // so the user can see the "waiting for acceptance" state in chat.
        if (state === 'pending' && pendingConvId) {
          event.preventDefault();
          event.stopPropagation();
          navigate(`/home/messages/${pendingConvId}`);
          return;
        }

        if (onBeforeOpen && onBeforeOpen() === false) return;

        event.preventDefault();
        event.stopPropagation();

        setState('loading');
        try {
          const conversation = await conversationApi.getOrCreateDirect(
            targetId
          );

          const status: 'active' | 'pending' =
            conversation.status === 'pending' ? 'pending' : 'active';

          onAfterOpen?.(conversation.id, status);

          if (status === 'active') {
            setState('active');
            navigate(`/home/messages/${conversation.id}`);
          } else {
            setState('pending');
            setPendingConvId(conversation.id);
            toast.success(
              'Message request sent — waiting for them to accept.',
              { autoClose: 3000 }
            );
          }
        } catch (err) {
          onError?.(err);
          setState('idle');
          toast.error('Could not send the request. Please try again.');
        }
      },
      [
        isInactive,
        state,
        pendingConvId,
        onBeforeOpen,
        onAfterOpen,
        onError,
        targetId,
        navigate,
      ]
    );

    const renderContent = () => {
      if (state === 'loading') {
        return (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Opening…</span>
          </>
        );
      }
      if (state === 'pending') {
        return (
          <>
            <Clock className="w-3.5 h-3.5" />
            <span>Request sent · View</span>
          </>
        );
      }
      if (state === 'active') {
        return (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Open</span>
          </>
        );
      }
      return (
        children ?? (
          <>
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Message</span>
          </>
        )
      );
    };

    const disabledForClick = isInactive || state === 'loading';

    return (
      <button
        ref={ref}
        type="button"
        onClick={handleClick}
        disabled={disabledForClick}
        aria-busy={state === 'loading'}
        aria-disabled={disabledForClick}
        className={className}
        {...rest}
      >
        {renderContent()}
      </button>
    );
  }
);

MessageUserButton.displayName = 'MessageUserButton';

export default MessageUserButton;