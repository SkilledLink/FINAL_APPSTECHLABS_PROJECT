// src/features/subscription/components/TierBadge.tsx
import { Sparkles } from 'lucide-react';
import type { TierInfo } from '../types/subscription.types';

interface TierBadgeProps {
  tier: TierInfo;
  size?: 'sm' | 'md';
}

export default function TierBadge({ tier, size = 'md' }: TierBadgeProps) {
  const color = tier.badge_color || '#3B82F6';
  const label = tier.badge_name || tier.name;

  const cls =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px]'
      : 'px-2.5 py-1 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-bold uppercase tracking-wider ${cls}`}
      style={{
        backgroundColor: `${color}20`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <Sparkles className="h-3 w-3" />
      {label}
    </span>
  );
}