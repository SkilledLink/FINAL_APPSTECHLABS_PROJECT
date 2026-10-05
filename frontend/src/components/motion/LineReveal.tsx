import { useEffect, useState, type CSSProperties } from 'react';
import { useInView } from '../../hooks/useInView';

export default function LineReveal({
  lines,
  className = '',
  trigger = 'inview',
  delay = 0,
}: {
  lines: string[];
  className?: string;
  trigger?: 'inview' | 'mount';
  delay?: number;
}) {
  const { ref, inView } = useInView({ threshold: 0.05 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (trigger !== 'mount') return;
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [trigger]);

  const show = trigger === 'mount' ? mounted : inView;

  return (
    <span
      ref={ref}
      className={`reveal-lines ${show ? 'is-visible' : ''} ${className}`}
    >
      {lines.map((line, i) => (
        <span key={i} className="reveal-line-wrapper">
          <span
            className="reveal-line"
            style={{ '--reveal-delay': `${delay * 1000 + i * 110}ms` } as CSSProperties}
          >
            {line}
          </span>
        </span>
      ))}
    </span>
  );
}