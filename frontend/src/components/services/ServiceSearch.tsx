import { Search } from "lucide-react";

interface ServiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: () => void;
}

export default function ServiceSearch({
  value,
  onChange,
  onSearch,
}: ServiceSearchProps) {
  return (
    <div className="relative flex-1 flex items-center">
      <Search size={18} className="absolute left-4 text-gray-400" />
      <input
        type="text"
        placeholder="Search professionals, skills, or keywords..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-gray-300 rounded-l-xl pl-11 pr-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none focus:border-blue-600"
      />
      <button
        onClick={onSearch}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-r-xl text-sm font-semibold transition-colors border border-blue-600"
      >
        Search
      </button>
    </div>
  );
}
