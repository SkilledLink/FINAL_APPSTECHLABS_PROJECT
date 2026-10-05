import type { ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

export default function Stagger({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView({ threshold: 0.05 });

  return (
    <div ref={ref} className={`reveal-group ${inView ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}