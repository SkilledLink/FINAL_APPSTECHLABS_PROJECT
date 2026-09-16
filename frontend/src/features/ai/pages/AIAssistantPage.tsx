import { useState } from 'react';
import { Bot, Send, Loader2, AlertCircle } from 'lucide-react';

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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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

  const sendMessage = async () => {
    const message = input.trim();

    if (!message || loading) {
      return;
    }

    setError('');

    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: message,
    };

    setMessages((previous) => [...previous, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        throw new Error('Please log in to use the SkillHub Assistant.');
      }

      const response = await fetch(`${API_URL}/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (response.status === 401) {
        throw new Error('Your session has expired. Please log in again.');
      }

      if (response.status === 429) {
        throw new Error(
          'You have reached the chat limit. Please wait a moment and try again.'
        );
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.detail ||
            'Failed to get a response from the SkillHub Assistant.'
        );
      }

      const data: ChatResponse = await response.json();

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        sources: data.sources,
      };

      setMessages((previous) => [...previous, assistantMessage]);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.';

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage();
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600">
          <Bot className="h-5 w-5 text-white" />
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">
            SkilledLink Assistant
          </h2>
          <p className="text-xs text-slate-500">
            Local skills and opportunities
          </p>
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-xs text-slate-500">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'rounded-br-md bg-teal-600 text-white'
                  : 'rounded-bl-md bg-slate-100 text-slate-800'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>

              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 border-t border-slate-200 pt-3">
                  <p className="mb-1 text-xs font-semibold text-slate-500">
                    Sources
                  </p>

                  <div className="space-y-1">
                    {message.sources.map((source, index) => (
                      <div
                        key={index}
                        className="text-xs text-slate-500"
                      >
                        {typeof source === 'string'
                          ? source
                          : JSON.stringify(source)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading message */}
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl rounded-bl-md bg-slate-100 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Thinking...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            rows={1}
            placeholder="Ask about skilled workers, jobs, or SkillHub..."
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-100 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>

        <p className="mt-2 text-center text-[11px] text-slate-400">
          Press Enter to send. Shift + Enter for a new line.
        </p>
      </div>
    </div>
  );
}
