import { BriefcaseBusiness, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from '@/lib/router';

export function JobMatchingPage() {
  return <div className="min-h-screen bg-[#f5f8f7] flex items-center justify-center px-5"><div className="max-w-xl text-center"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-12"><ArrowLeft className="w-4 h-4" /> Back to home</Link><div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-6"><BriefcaseBusiness className="w-6 h-6" /></div><p className="text-xs uppercase tracking-[0.2em] font-bold text-emerald-600 mb-3">Job Matching</p><h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Better work, closer to home</h1><p className="text-lg text-slate-500 leading-relaxed">Tell us what you do and where you work. We’ll surface open local jobs that fit your trade and experience.</p><Link to="/assistant" className="inline-flex items-center gap-2 mt-8 bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-emerald-700 transition-colors"><Sparkles className="w-4 h-4" /> Find matching work</Link></div></div>;
}
