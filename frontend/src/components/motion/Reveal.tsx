import type { CSSProperties, ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

export default function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();

  return (
    <div
      ref={ref}
      className={`reveal ${inView ? 'is-visible' : ''} ${className}`}
      style={{ '--reveal-delay': `${delay * 1000}ms` } as CSSProperties}
    >
      {children}
    </div>
  );
}