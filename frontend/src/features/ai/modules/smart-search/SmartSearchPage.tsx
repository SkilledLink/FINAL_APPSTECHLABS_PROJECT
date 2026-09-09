import { Search, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from '@/lib/router';

export function SmartSearchPage() {
  return <div className="min-h-screen bg-[#f5f8f7] flex items-center justify-center px-5"><div className="max-w-xl text-center"><Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-12"><ArrowLeft className="w-4 h-4" /> Back to home</Link><div className="w-14 h-14 rounded-2xl bg-cyan-600 text-white flex items-center justify-center mx-auto mb-6"><Search className="w-6 h-6" /></div><p className="text-xs uppercase tracking-[0.2em] font-bold text-cyan-600 mb-3">Smart Search</p><h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-4">Search like you’re talking to a neighbor</h1><p className="text-lg text-slate-500 leading-relaxed">Skip the filters. Describe the project, area, and timing in your own words and get a useful shortlist.</p><Link to="/assistant" className="inline-flex items-center gap-2 mt-8 bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-cyan-700 transition-colors"><Sparkles className="w-4 h-4" /> Try smart search</Link></div></div>;
}
