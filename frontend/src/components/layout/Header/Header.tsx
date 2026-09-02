import { Menu, Search, Bell, Sparkles } from "lucide-react";

interface HeaderProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={toggleSidebar}
          className="hidden md:flex p-2 hover:bg-purple-50 rounded-xl text-slate-600 transition-colors"
        >
          <Menu size={20} />
        </button>

        <div className="md:hidden font-bold text-base bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight flex items-center gap-2">
          <Sparkles size={18} className="text-purple-600" />
          Professional Net
        </div>

        <div className="hidden sm:flex items-center max-w-md w-full bg-slate-100/80 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-purple-500/40 transition-all border border-slate-200/60">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search professionals, jobs, posts..."
            className="bg-transparent border-none outline-none ml-2.5 w-full text-sm text-slate-700 placeholder:text-slate-400 font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <button className="p-2.5 text-slate-600 hover:bg-purple-50 hover:text-purple-600 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white"></span>
        </button>

        <div className="h-9 w-9 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-600 ml-2 p-0.5 shadow-md shadow-purple-500/20 cursor-pointer overflow-hidden">
          <img
            src="https://ui-avatars.com/api/?name=User&background=6d28d9&color=fff"
            alt="Profile"
            className="rounded-xl w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
