import type { ReactNode } from 'react';

export default function SectionLabel({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`inline-flex items-center text-[11px] font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400 ${className}`}>
      {children}
    </p>
  );
}