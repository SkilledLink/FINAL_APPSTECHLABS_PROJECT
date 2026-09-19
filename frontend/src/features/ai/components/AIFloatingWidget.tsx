import { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Sparkles } from 'lucide-react';
import { AIChat } from './AIChat';
import { AIBackground } from './AIBackground';
import { useAIChat } from '../hooks/useAIChat';

export function AIFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chat = useAIChat();

  useEffect(() => {
    const popupTimer = setTimeout(() => {
      setShowTooltip(true);
      const fadeTimer = setTimeout(() => setShowTooltip(false), 20000);
      return () => clearTimeout(fadeTimer);
    }, 180000);

    return () => clearTimeout(popupTimer);
  }, []);

  const handleOpen = () => {
    setShowTooltip(false);
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-50 flex flex-col w-screen h-screen overflow-hidden transition-colors bg-[#f0f4f8] dark:bg-slate-950">

          <AIBackground />

          <header className="relative z-40 px-4 py-3 shrink-0 shadow-sm bg-white/70 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/70 dark:bg-slate-950/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="p-2 rounded-full text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    AI Assistant
                  </h2>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    SkilledLink Concierge
                  </p>
                </div>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-500/10 ring-1 ring-blue-500/20 px-2 py-1 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse" />
              Online
            </span>
          </header>

          <main className="relative z-10 flex-1 min-h-0">
            <AIChat chat={chat} />
          </main>
        </div>
      ) : (
        <div className="fixed bottom-36 md:bottom-6 right-6 z-40 flex flex-col items-end gap-2">

          {showTooltip && (
            <div className="relative text-xs font-medium text-white px-4 py-2.5 rounded-2xl rounded-br-md shadow-2xl animate-in fade-in slide-in-from-bottom-1 duration-300 bg-slate-900/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span>Hello, do you need help?</span>
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-white text-xs ml-1"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={handleOpen}
            className="group relative w-14 h-14 rounded-full flex items-center justify-center text-white transition-all active:scale-95 bg-gradient-to-br from-blue-600 to-cyan-500 shadow-[0_10px_30px_-8px_rgba(37,99,235,0.7)] hover:shadow-[0_14px_40px_-8px_rgba(37,99,235,0.9)] hover:scale-105"
            aria-label="Open AI Assistant"
          >
            <span className="absolute inset-0 rounded-full bg-blue-500/40 animate-ping opacity-75" />
            <MessageSquare className="relative w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}