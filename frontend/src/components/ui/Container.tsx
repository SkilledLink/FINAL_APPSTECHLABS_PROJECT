import type { ReactNode } from 'react';

type Width = 'text' | 'normal' | 'wide' | 'full';

const widths: Record<Width, string> = {
  text: 'max-w-[720px]',
  normal: 'max-w-[1200px]',
  wide: 'max-w-[1280px]',
  full: 'max-w-none',
};

export default function Container({
  width = 'wide',
  className = '',
  children,
}: {
  width?: Width;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`mx-auto px-6 sm:px-10 lg:px-16 ${widths[width]} ${className}`}>
      {children}
    </div>
  );
}