import React from 'react';

interface SkeletonBlockProps {
  className?: string;
  style?: React.CSSProperties;
}

export const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className = '',
  style,
}) => (
  <div className={`animate-pulse rounded bg-gray-200 ${className}`} style={style} />
);

export const SkeletonTableRow: React.FC<{ cols?: number }> = ({ cols = 6 }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <SkeletonBlock className="h-3.5 w-3/4" />
      </td>
    ))}
  </tr>
);

export const SkeletonTable: React.FC<{ rows?: number; cols?: number }> = ({
  rows = 6,
  cols = 6,
}) => (
  <div className="divide-y divide-gray-100">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonTableRow key={i} cols={cols} />
    ))}
  </div>
);

export default SkeletonBlock;