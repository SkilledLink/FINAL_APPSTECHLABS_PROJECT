import { Search, Bell, MessageSquare, Sparkles } from "lucide-react";

interface HeaderProps {
  isCollapsed?: boolean;
  toggleSidebar?: () => void;
}

export default function Header({}: HeaderProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="font-bold text-base bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600 shrink-0" />
          <span>Professional Net</span>
        </div>

        <div className="hidden sm:flex items-center max-w-md w-full bg-slate-100/80 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500/40 transition-all border border-slate-200/60 ml-4">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search professionals, jobs, posts..."
            className="bg-transparent border-none outline-none ml-2.5 w-full text-sm text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Messages Icon Button */}
        <button
          className="p-2.5 text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all relative cursor-pointer"
          title="Messages"
        >
          <MessageSquare size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Notification Icon Button */}
        <button
          className="p-2.5 text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all relative cursor-pointer"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}