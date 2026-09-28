import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react';
import { AIBackground } from './components/AIBackground';

interface ChatSource {
  [key: string]: unknown;
}
interface ChatResponse {
  response: string;
  sources: ChatSource[];
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://192.168.68.67:8000';

/* ------------------------------------------------------------------ */
/*  Draggable button helpers                                          */
/* ------------------------------------------------------------------ */
const BUTTON_SIZE = 44; // matches h-11 / w-11
const EDGE_PADDING = 12;

const getDefaultButtonPosition = () => {
  if (typeof window === 'undefined') return { x: 320, y: 520 };
  return {
    x: Math.max(EDGE_PADDING, window.innerWidth - BUTTON_SIZE - 24),
    y: Math.max(EDGE_PADDING, window.innerHeight - BUTTON_SIZE - 140),
  };
};

const clampPosition = (x: number, y: number) => {
  if (typeof window === 'undefined') return { x, y };
  const maxX = Math.max(EDGE_PADDING, window.innerWidth - BUTTON_SIZE - EDGE_PADDING);
  const maxY = Math.max(EDGE_PADDING, window.innerHeight - BUTTON_SIZE - EDGE_PADDING);
  return {
    x: Math.min(Math.max(x, EDGE_PADDING), maxX),
    y: Math.min(Math.max(y, EDGE_PADDING), maxY),
  };
};

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content:
        'Hi! I’m the SkilledLink Assistant. Tell me what you need, and I’ll help you find the right skilled people or opportunities.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /* ---------------- send button position / dragging ---------------- */
  const [buttonPos, setButtonPos] = useState(getDefaultButtonPosition);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragRef = useRef({
    dragging: false,
    moved: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
  });

  // Keep the button inside the viewport when the window is resized
  useEffect(() => {
    const handleResize = () =>
      setButtonPos(prev => clampPosition(prev.x, prev.y));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sendMessage = async () => {
    const message = input.trim();
    if (!message || loading) return;

    setError('');
    const userMessage: Message = { id: Date.now(), role: 'user', content: message };
    setMessages(p => [...p, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('Please log in to use the SkilledLink Assistant.');

      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message }),
      });

      if (response.status === 401)
        throw new Error('Your session has expired. Please log in again.');
      if (response.status === 429)
        throw new Error('You have reached the chat limit. Please wait a moment and try again.');

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || 'Failed to get a response from the SkilledLink Assistant.',
        );
      }

      const data: ChatResponse = await response.json();
      setMessages(p => [
        ...p,
        { id: Date.now() + 1, role: 'assistant', content: data.response, sources: data.sources },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  /* -------------------- drag handlers for the button -------------------- */
  const handleButtonPointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    // Ignore right / middle mouse button
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const drag = dragRef.current;
    drag.dragging = true;
    drag.moved = false;
    drag.pointerId = e.pointerId;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    drag.originX = rect.left;
    drag.originY = rect.top;

    buttonRef.current?.setPointerCapture(e.pointerId);
  };

  const handleButtonPointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging || e.pointerId !== drag.pointerId) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;

    // Small threshold so a normal click isn't treated as a drag
    if (!drag.moved && Math.hypot(dx, dy) > 4) drag.moved = true;

    if (drag.moved) {
      setButtonPos(clampPosition(drag.originX + dx, drag.originY + dy));
    }
  };

  const handleButtonPointerUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag.dragging) return;

    drag.dragging = false;

    if (buttonRef.current?.hasPointerCapture(e.pointerId)) {
      buttonRef.current.releasePointerCapture(e.pointerId);
    }

    // Let the trailing `click` event know it should be ignored
    if (drag.moved) {
      window.setTimeout(() => {
        dragRef.current.moved = false;
      }, 250);
    }
  };

  const handleButtonClick = () => {
    // A drag just finished → swallow the click
    if (dragRef.current.moved) return;
    if (loading || !input.trim()) return;
    sendMessage();
  };

  const canSend = Boolean(input.trim()) && !loading;

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f0f4f8] font-sans text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <AIBackground />

      {/* Header */}
      <div className="relative z-40 flex items-center gap-3 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl px-5 py-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/30">
          <Bot className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-slate-900 dark:text-slate-100">SkilledLink Assistant</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Local skills and opportunities
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map(message => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'rounded-br-md bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                  : 'rounded-bl-md bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl text-slate-800 dark:text-slate-200 border border-white/60 dark:border-white/10 shadow-[0_4px_24px_-12px_rgba(15,23,42,0.15)]'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>

              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 border-t border-slate-200/70 dark:border-white/10 pt-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Sources
                  </p>
                  <div className="space-y-1">
                    {message.sources.map((source, i) => (
                      <div key={i} className="text-xs text-slate-500 dark:text-slate-400">
                        {typeof source === 'string' ? source : JSON.stringify(source)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-white/60 dark:border-white/10 px-4 py-3 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
              <span>Thinking…</span>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200/70 dark:border-red-500/30 bg-red-50/80 dark:bg-red-500/10 backdrop-blur p-3 text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="relative z-40 border-t border-slate-200/70 dark:border-slate-800/70 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl p-4">
        <form onSubmit={handleSubmit} className="mx-auto flex max-w-4xl items-end gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
            placeholder="Ask about skilled workers, jobs, or SkilledLink…"
            className="max-h-32 min-h-[44px] w-full flex-1 resize-none rounded-xl border border-slate-200/80 dark:border-white/10 bg-white/90 dark:bg-slate-950/60 px-4 py-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>

        <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
          Press{' '}
          <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
            Enter
          </kbd>{' '}
          to send ·{' '}
          <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
            Shift
          </kbd>{' '}
          +{' '}
          <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
            Enter
          </kbd>{' '}
          for a new line · drag the send button to move it
        </p>
      </div>

      {/* Draggable Send Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        onPointerDown={handleButtonPointerDown}
        onPointerMove={handleButtonPointerMove}
        onPointerUp={handleButtonPointerUp}
        onPointerCancel={handleButtonPointerUp}
        style={{
          left: `${buttonPos.x}px`,
          top: `${buttonPos.y}px`,
          touchAction: 'none',
        }}
        aria-label="Send message (drag to move)"
        title="Click to send · drag to move"
        className={`fixed z-50 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-500/30 transition-[box-shadow,background-color,opacity] duration-200 hover:from-blue-500 hover:to-blue-600 hover:shadow-blue-500/50 active:scale-95 cursor-grab active:cursor-grabbing select-none ${
          canSend ? 'opacity-100' : 'opacity-50'
        }`}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
      </button>
    </div>
  );
}