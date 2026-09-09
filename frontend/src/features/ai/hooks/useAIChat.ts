import { useState } from 'react';
import type { ChatMessage, UserRole } from '../types/ai.types';
import { useAI } from './useAI';

export function useAIChat() {
  const { role, setRole, isSearching, performSearch } = useAI();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      content: 'Welcome to SkillHub! Are you looking to hire skilled workers or searching for job postings near you?',
      actionCards: [
        { label: '🏗️ I want to Hire', action: 'select_role', payload: { role: 'hirer' } },
        { label: '🔧 I am a Worker', action: 'select_role', payload: { role: 'worker' } },
      ],
    },
  ]);

  const handleRoleSelection = (selectedRole: Exclude<UserRole, null>) => {
    setRole(selectedRole);
    const roleText = selectedRole === 'hirer' ? 'I am looking to hire' : 'I am a skilled worker looking for jobs';

    setMessages((prev) => [
      ...prev,
      { id: `usr-${Date.now()}`, sender: 'user', content: roleText },
      {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content:
          selectedRole === 'hirer'
            ? 'Great! What trade skill keyword are you searching for? (e.g. **Electrician**, **Plumber**, **Carpenter**)'
            : 'Welcome! What trade skill specialty do you offer? (e.g. **Electrician**, **Plumber**, **Carpenter**)',
      },
    ]);
  };

  const handleUserMessage = async (text: string) => {
    const userMsg: ChatMessage = { id: `usr-${Date.now()}`, sender: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    const activeRole = role || 'hirer';
    const result = await performSearch(activeRole, text);

    setMessages((prev) => [
      ...prev,
      {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        content: result.content,
        recommendations: result.recommendations,
        actionCards: result.actionCards,
      },
    ]);
  };

  const resetChat = () => {
    setRole(null);
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        content: 'Welcome to SkillHub! Are you looking to hire skilled workers or searching for job postings near you?',
        actionCards: [
          { label: ' I want to Hire', action: 'select_role', payload: { role: 'hirer' } },
          { label: ' I am a Worker', action: 'select_role', payload: { role: 'worker' } },
        ],
      },
    ]);
  };

  return { messages, isSearching, handleUserMessage, handleRoleSelection, resetChat };
}