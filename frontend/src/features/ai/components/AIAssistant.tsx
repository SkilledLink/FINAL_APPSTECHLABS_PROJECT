import { useAIChat } from '../hooks/useAIChat';
import { AIChat } from './AIChat';

export function AIAssistant() {
  const chat = useAIChat();

  return (
    <div className="w-full h-screen max-h-screen flex flex-col">
      <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0">
        <h1 className="text-lg font-bold text-slate-900">SkillHub Assistant</h1>
        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
          Client-Side Active
        </span>
      </header>
      <main className="flex-1 min-h-0">
        <AIChat chat={chat} />
      </main>
    </div>
  );
}