import { ArrowLeft, Bot, ShieldCheck, Sparkles } from 'lucide-react';
import { Link } from '../../../lib/router';
import { AIAssistant } from '../components/AIAssistant';

export function AIAssistantPage() {
  return (
    <div className="min-h-screen bg-[#f5f8f7]">
      {/* Navigation Header */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-5 lg:px-10">
        <Link to="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to home</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900">Local<span className="text-teal-600">SkillHub</span></span>
        </div>
        <div className="w-28" />
      </header>

      {/* Main Page Content */}
      <main className="max-w-6xl mx-auto px-5 lg:px-8 py-8 lg:py-12">
        <div className="mb-7">
          <div className="flex items-center gap-2 text-teal-600 text-sm font-semibold uppercase tracking-wider mb-3">
            <Bot className="w-4 h-4" />
            SkillHub Assistant
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 mb-2">Your local connection starts here</h1>
          <p className="text-slate-500 max-w-xl">Tell me what you need, and I’ll find the right skilled people or opportunities nearby.</p>
        </div>

        {/* Workspace Layout */}
        <div className="grid lg:grid-cols-[1fr_320px] gap-6 items-start">
          <div className="h-[650px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white">
            <AIAssistant />
          </div>
          
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5">
              <h2 className="font-semibold text-slate-900 mb-4">How it works</h2>
              <div className="space-y-4">
                {[
                  ['01', 'Choose your path', 'Tell us if you need to hire or you’re looking for work.'],
                  ['02', 'Share your details', 'Add your trade and the area you serve or need help in.'],
                  ['03', 'Connect directly', 'Browse verified matches and start a conversation.'],
                ].map(([number, title, description]) => (
                  <div key={number} className="flex gap-3">
                    <span className="w-7 h-7 rounded-lg bg-teal-50 text-teal-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{number}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{title}</p>
                      <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 rounded-2xl p-5 text-white">
              <ShieldCheck className="w-5 h-5 text-teal-400 mb-3" />
              <h2 className="font-semibold mb-1">Built for local trust</h2>
              <p className="text-sm leading-relaxed text-slate-300">Every professional is verified and reviewed by people in your community.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}