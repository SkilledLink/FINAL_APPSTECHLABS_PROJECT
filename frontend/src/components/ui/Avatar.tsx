// src/components/ui/Avatar.tsx

interface AvatarProps {
  name: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
};

const colorPalette = [
  'bg-brand-500',
  'bg-accent-500',
  'bg-blue-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-teal-500',
  'bg-violet-500',
  'bg-cyan-500',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

export default function Avatar({
  name,
  avatar,
  size = 'md',
  className = '',
}: AvatarProps) {
  const safeName = name?.trim() || 'Unknown';
  const colorClass = colorPalette[hashString(safeName) % colorPalette.length];

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={safeName}
        loading="lazy"
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-bold text-white ring-2 ring-white shrink-0 ${className}`}
      aria-label={safeName}
    >
      {initials(safeName)}
    </div>
  );
}