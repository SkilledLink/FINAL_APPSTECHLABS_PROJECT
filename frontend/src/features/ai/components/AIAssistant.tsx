import { Sparkles } from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';
import { AIChat } from './AIChat';
import { AIBackground } from './AIBackground';

export function AIAssistant() {
  const chat = useAIChat();

  return (
    <div className="relative w-full h-screen max-h-screen flex flex-col overflow-hidden bg-[#f0f4f8] font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      <AIBackground />

      <header className="relative z-40 px-6 py-4 shrink-0 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800/70 dark:bg-slate-950/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
              SkilledLink Assistant
            </h1>
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Local concierge · always on
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-500/10 ring-1 ring-blue-500/20 px-2.5 py-1 rounded-full backdrop-blur">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          </span>
          Client-Side Active
        </span>
      </header>

      <main className="relative z-10 flex-1 min-h-0">
        <AIChat chat={chat} />
      </main>
    </div>
  );
}