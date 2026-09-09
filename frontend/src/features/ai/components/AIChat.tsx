import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, RotateCcw } from 'lucide-react';
import type { ChatMessage, ActionCard } from '../types/ai.types';
import { AIMessage } from './AIMessage';
import { useAIChat } from '../hooks/useAIChat';

interface AIChatProps {
  chat: ReturnType<typeof useAIChat>;
}

export function AIChat({ chat }: AIChatProps) {
  const { messages, isSearching, handleUserMessage, handleRoleSelection, resetChat } = chat;
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSearching]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSearching) return;
    handleUserMessage(input.trim());
    setInput('');
  };

  const handleActionClick = (card: ActionCard) => {
    if (card.action === 'select_role' && card.payload?.role) {
      handleRoleSelection(card.payload.role as 'hirer' | 'worker');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 w-full overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg: ChatMessage) => (
          <AIMessage key={msg.id} message={msg} onActionClick={handleActionClick} />
        ))}
        {isSearching && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 shrink-0">
        <div className="flex items-center gap-2 max-w-4xl mx-auto">
          <button
            type="button"
            onClick={resetChat}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
            title="Start over"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isSearching ? 'Searching database...' : 'Type a skill or message...'}
              disabled={isSearching}
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSearching}
              className="p-2.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}