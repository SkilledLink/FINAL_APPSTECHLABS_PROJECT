import { ArrowLeft, UserRound, CheckCircle2, Sparkles } from 'lucide-react';
import { Link } from '@/lib/router';

export function ProfileAssistantPage() {
  return <ModulePage icon={<UserRound className="w-6 h-6" />} eyebrow="Profile Assistant" title="Make your skills stand out" description="Build a profile that helps the right local opportunities find you." bullets={['Guided profile setup', 'Skill and experience suggestions', 'Tips to earn more trust']} />;
}

function ModulePage({ icon, eyebrow, title, description, bullets }: { icon: React.ReactNode; eyebrow: string; title: string; description: string; bullets: string[] }) {
  return <div className="min-h-screen bg-[#f5f8f7] flex items-center justify-center px-5"><div className="max-w-xl text-center"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-12"><ArrowLeft className="w-4 h-4" /> Back to home</Link><div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-6">{icon}</div><p className="text-xs uppercase tracking-[0.2em] font-bold text-teal-600 mb-3">{eyebrow}</p><h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">{title}</h1><p className="text-lg text-slate-500 leading-relaxed mb-8">{description}</p><div className="bg-white border border-slate-200 rounded-2xl p-5 text-left space-y-3 shadow-sm">{bullets.map((bullet) => <div key={bullet} className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-teal-600" />{bullet}</div>)}</div><Link to="/assistant" className="inline-flex items-center gap-2 mt-8 bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-teal-700 transition-colors"><Sparkles className="w-4 h-4" /> Open assistant</Link></div></div>;
}
