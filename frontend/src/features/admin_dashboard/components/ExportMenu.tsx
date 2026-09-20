// src/components/ExportMenu.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
} from 'lucide-react';

export type ExportFormat = 'pdf' | 'csv' | 'excel';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => void | Promise<void>;
  disabled?: boolean;
}

const ExportMenu: React.FC<ExportMenuProps> = ({ onExport, disabled }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const items: { key: ExportFormat; label: string; icon: React.ReactNode }[] = [
    { key: 'pdf', label: 'Download as PDF', icon: <FileText size={15} /> },
    { key: 'csv', label: 'Download as CSV', icon: <FileSpreadsheet size={15} /> },
    { key: 'excel', label: 'Download as Excel', icon: <FileSpreadsheet size={15} /> },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Download size={16} />
        <span className="hidden sm:inline">Export</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 min-w-[210px] overflow-hidden rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
          {items.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                setOpen(false);
                void onExport(item.key);
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <span className="text-gray-500">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExportMenu;