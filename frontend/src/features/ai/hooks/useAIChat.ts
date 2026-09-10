import { useCallback, useState } from 'react';
import type {
  ChatMessage,
} from '../types/ai.types';
import { sendChatMessage } from '../services/aiService';

interface UseAIChatResult {
  messages: ChatMessage[];
  isSearching: boolean;
  handleUserMessage: (message: string) => Promise<void>;
  handleRoleSelection: (role: 'hirer' | 'worker') => void;
  resetChat: () => void;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  sender: 'assistant',
  content:
    'Hello! I’m the Skillink AI Assistant. How can I help you today?',
};

export function useAIChat(): UseAIChatResult {
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_MESSAGE,
  ]);

  const [isSearching, setIsSearching] = useState(false);

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((previous) => [...previous, message]);
  }, []);

  const handleUserMessage = useCallback(
    async (message: string) => {
      if (!message.trim() || isSearching) {
        return;
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        content: message,
      };

      addMessage(userMessage);
      setIsSearching(true);

      try {
        const result = await sendChatMessage(message);

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          sender: 'assistant',
          content: result.response,
        };

        addMessage(assistantMessage);
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Something went wrong while contacting the AI Assistant.';

        addMessage({
          id: `error-${Date.now()}`,
          sender: 'assistant',
          content: errorMessage,
        });
      } finally {
        setIsSearching(false);
      }
    },
    [addMessage, isSearching],
  );

  const handleRoleSelection = useCallback(
    (role: 'hirer' | 'worker') => {
      const roleMessage =
        role === 'hirer'
          ? 'I’m looking for a skilled professional.'
          : 'I’m looking for work.';

      void handleUserMessage(roleMessage);
    },
    [handleUserMessage],
  );

  const resetChat = useCallback(() => {
    setMessages([INITIAL_MESSAGE]);
    setIsSearching(false);
  }, []);

  return {
    messages,
    isSearching,
    handleUserMessage,
    handleRoleSelection,
    resetChat,
  };
}