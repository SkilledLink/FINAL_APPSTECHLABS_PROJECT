import type { ReactNode } from 'react';
import { useInView } from '../../hooks/useInView';

type Pattern = 'scale' | 'clip' | 'horizontal' | 'fade' | 'none';

export default function ImageReveal({
  pattern = 'scale',
  className = '',
  children,
}: {
  pattern?: Pattern;
  className?: string;
  children: ReactNode;
}) {
  const { ref, inView } = useInView({ threshold: 0.05 });

  return (
    <div
      ref={ref}
      className={`reveal-image reveal-image-${pattern} ${inView ? 'is-visible' : ''} overflow-hidden ${className}`}
    >
      <div className="reveal-image-inner h-full w-full">
        {children}
      </div>
    </div>
  );
}