import { useState, useEffect } from 'react';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { AIChat } from './AIChat';
import { useAIChat } from '../hooks/useAIChat';

export function AIFloatingWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const chat = useAIChat();

  useEffect(() => {
    // Show prompt after 3 minutes (180,000 ms)
    const popupTimer = setTimeout(() => {
      setShowTooltip(true);

      // Hide prompt after 20 seconds (20,000 ms)
      const fadeTimer = setTimeout(() => {
        setShowTooltip(false);
      }, 20000);

      return () => clearTimeout(fadeTimer);
    }, 180000);

    return () => clearTimeout(popupTimer);
  }, []);

  const handleOpen = () => {
    setShowTooltip(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Fullscreen Overlay Chat Page */}
      {isOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col w-screen h-screen">
          {/* Header with Back Arrow */}
          <header className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h2 className="text-base font-semibold text-slate-900">AI Assistant</h2>
                <p className="text-xs text-slate-500">SkilledLink Local Concierge</p>
              </div>
            </div>
          </header>

          {/* AI Chat Body */}
          <main className="flex-1 min-h-0">
            <AIChat chat={chat} />
          </main>
        </div>
      ) : (
        /* Floating Launcher Button & Speech Popup */
        /* bottom-32 gives ~2 inches (128px) of clearance above the screen bottom (clearing FooterNav + margin) */
        <div className="fixed bottom-36 md:bottom-6 right-6 z-40 flex flex-col items-end gap-2">
          {/* Fading Speech Bubble */}
          {showTooltip && (
            <div className="bg-slate-900 text-white text-xs font-medium px-3.5 py-2 rounded-xl shadow-xl border border-slate-700 animate-fade-in flex items-center gap-2">
              <span>Hello, do you need help?</span>
              <button
                type="button"
                onClick={() => setShowTooltip(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Bouncing Circular Trigger Button */}
          <button
            type="button"
            onClick={handleOpen}
            className="w-14 h-14 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-cyan-500/30 transition-transform active:scale-95 animate-bounce"
            aria-label="Open AI Assistant"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      )}
    </>
  );
}