// src/features/ai/components/AIAssistant.tsx
import { Sparkles } from 'lucide-react';
import { useAIChat } from '../hooks/useAIChat';
import { AIChat } from './AIChat';
import { AIBackground } from './AIBackground';

export function AIAssistant() {
  const chat = useAIChat();

  return (
    <div
      className="
        relative flex h-full max-h-full w-full flex-col overflow-hidden
        bg-[#eef4fa] dark:bg-[#050b14]
        font-sans text-slate-900 transition-colors duration-300
        dark:text-slate-100
      "
    >
      {/* Full decorative stack — grid, mesh, glows, SVG, grain,
          vignette, particles. Sits above the opaque base color,
          below the header and content. */}
      <AIBackground />

      <header
        className="
          relative z-40 flex shrink-0 items-center justify-between
          border-b border-slate-900/[0.06] dark:border-white/[0.06]
          bg-white/60 dark:bg-[#070b14]/60
          backdrop-blur-xl
          px-6 py-4
        "
      >
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

        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100/70 px-2.5 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-500/20 backdrop-blur dark:bg-blue-500/10 dark:text-blue-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-600" />
          </span>
          Client-Side Active
        </span>
      </header>

      <main className="relative z-10 min-h-0 flex-1">
        <AIChat chat={chat} />
      </main>
    </div>
  );
}