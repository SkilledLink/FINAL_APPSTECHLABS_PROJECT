import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export default function ArrowLink({
  to,
  href,
  children,
  tone = 'dark',
  className = '',
}: {
  to?: string;
  href?: string;
  children: ReactNode;
  tone?: 'dark' | 'light';
  className?: string;
}) {
  const base =
    tone === 'light'
      ? 'text-white border-white/40 hover:border-[#4F8EFF] hover:text-[#4F8EFF]'
      : 'text-[#06142e] border-[#06142e]/30 hover:border-[#2563EB] hover:text-[#2563EB] dark:text-white dark:border-white/30 dark:hover:border-[#4F8EFF] dark:hover:text-[#4F8EFF]';

  const cls = `group inline-flex items-center gap-3 text-[12px] font-semibold uppercase tracking-[0.22em] border-b pb-1 transition-colors duration-300 ${base} ${className}`;

  const inner = (
    <>
      <span>{children}</span>
      <span
        aria-hidden
        className="inline-block transition-transform duration-300 group-hover:translate-x-1.5"
        style={{ transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      >
        →
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} className={cls}>
        {inner}
      </a>
    );
  }

  return (
    <Link to={to ?? '/'} className={cls}>
      {inner}
    </Link>
  );
} 