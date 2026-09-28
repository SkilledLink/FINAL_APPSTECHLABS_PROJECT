// src/features/subscription/components/VerifiedBadge.tsx
import { useId } from 'react';
import type { TierInfo } from '../types/subscription.types';

interface VerifiedBadgeProps {
  tier: TierInfo;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  /** Accessible label / native tooltip. Defaults to "Verified". */
  title?: string;
}

const SIZE_CLASSES: Record<NonNullable<VerifiedBadgeProps['size']>, string> = {
  sm: 'h-[18px] w-[18px]',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
  xl: 'h-9 w-9',
};

/** Shift a hex color lighter (+) or darker (−). Range roughly −100..100. */
function shiftHex(hex: string, amount: number): string {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const num = parseInt(full, 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount));
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Build a scalloped seal path — alternating outer/inner radius around a circle. */
function buildSealPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  lobes: number,
): string {
  const total = lobes * 2;
  const pts: string[] = [];
  for (let i = 0; i < total; i++) {
    const angle = (i * Math.PI * 2) / total - Math.PI / 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${i === 0 ? 'M' : 'L'}${x.toFixed(3)} ${y.toFixed(3)}`);
  }
  return pts.join(' ') + ' Z';
}

export default function VerifiedBadge({
  tier,
  size = 'sm',
  className = '',
  title,
}: VerifiedBadgeProps) {
  const uid = useId();
  const baseColor = tier.badge_color || '#3B82F6';
  const lightColor = shiftHex(baseColor, 45);
  const darkColor = shiftHex(baseColor, -35);
  const label = title ?? 'Verified';

  const outerSeal = buildSealPath(12, 12, 11.35, 9.4, 12);
  const innerRim = buildSealPath(12, 12, 9.55, 8.15, 12);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center align-middle ${className}`}
      title={label}
      aria-label={label}
      role="img"
    >
      <svg
        viewBox="0 0 24 24"
        className={SIZE_CLASSES[size]}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vertical gradient: light → base → dark */}
          <linearGradient
            id={`vb-grad-${uid}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={lightColor} />
            <stop offset="42%" stopColor={baseColor} />
            <stop offset="100%" stopColor={darkColor} />
          </linearGradient>

          {/* Diagonal gloss for a metallic sheen */}
          <linearGradient
            id={`vb-sheen-${uid}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.18" />
          </linearGradient>

          {/* Soft colored drop shadow */}
          <filter
            id={`vb-shadow-${uid}`}
            x="-35%"
            y="-35%"
            width="170%"
            height="170%"
          >
            <feDropShadow
              dx="0"
              dy="0.9"
              stdDeviation="1.1"
              floodColor={darkColor}
              floodOpacity="0.5"
            />
          </filter>
        </defs>

        {/* Shadow layer */}
        <path
          d={outerSeal}
          fill={baseColor}
          filter={`url(#vb-shadow-${uid})`}
        />

        {/* Main gradient seal */}
        <path d={outerSeal} fill={`url(#vb-grad-${uid})`} />

        {/* Metallic sheen overlay */}
        <path d={outerSeal} fill={`url(#vb-sheen-${uid})`} />

        {/* Inner rim — adds depth at larger sizes */}
        <path
          d={innerRim}
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.32"
          strokeWidth="0.55"
        />

        {/* Crisp white checkmark with subtle drop shadow */}
        <path
          d="M7.4 12.35l3.15 3.15 6.15-6.5"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0.4px 0.4px rgba(0,0,0,0.25))' }}
        />
      </svg>
    </span>
  );
}