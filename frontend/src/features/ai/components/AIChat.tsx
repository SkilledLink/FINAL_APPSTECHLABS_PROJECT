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
    <div className="flex flex-col h-full w-full overflow-hidden transition-colors">

      {/* Messages scroller */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5 scroll-smooth"
      >
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg: ChatMessage) => (
            <AIMessage key={msg.id} message={msg} onActionClick={handleActionClick} />
          ))}

          {isSearching && (
            <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              </div>
              <div className="rounded-2xl rounded-tl-md bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 px-4 py-3 shadow-sm">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 px-4 sm:px-6 pb-5 pt-2">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-2xl bg-white/75 dark:bg-slate-900/65 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)] p-2 flex items-center gap-2 focus-within:border-blue-500/60 focus-within:ring-4 focus-within:ring-blue-500/15 transition-all">

            <button
              type="button"
              onClick={resetChat}
              className="p-2.5 text-slate-400 hover:text-blue-600 dark:text-slate-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all shrink-0 active:scale-95"
              title="Start over"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isSearching ? 'Searching database…' : 'Type a skill or message…'}
                disabled={isSearching}
                className="flex-1 px-2 py-2.5 bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none disabled:opacity-60"
              />

              <button
                type="submit"
                disabled={!input.trim() || isSearching}
                className="relative p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:from-blue-500 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none transition-all active:scale-95 shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          <p className="mt-2.5 text-center text-[11px] font-medium text-slate-400 dark:text-slate-500">
            The assistant only answers SkilledLink questions.
          </p>
        </div>
      </div>
    </div>
  );
}