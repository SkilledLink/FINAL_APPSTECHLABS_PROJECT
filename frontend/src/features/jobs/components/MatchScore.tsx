import { TrendingUp } from 'lucide-react';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

function scoreColor(score: number): { bg: string; text: string; ring: string; label: string } {
  if (score >= 85) {
    return {
      bg: 'bg-emerald-50 dark:bg-emerald-950/50',
      text: 'text-emerald-700 dark:text-emerald-300',
      ring: 'ring-emerald-600/20 dark:ring-emerald-500/30',
      label: 'Excellent match',
    };
  }
  if (score >= 70) {
    return {
      bg: 'bg-blue-50 dark:bg-blue-950/50',
      text: 'text-blue-700 dark:text-blue-300',
      ring: 'ring-blue-600/20 dark:ring-blue-500/30',
      label: 'Good match',
    };
  }
  if (score >= 50) {
    return {
      bg: 'bg-amber-50 dark:bg-amber-950/50',
      text: 'text-amber-700 dark:text-amber-300',
      ring: 'ring-amber-600/20 dark:ring-amber-500/30',
      label: 'Fair match',
    };
  }
  return {
    bg: 'bg-slate-100 dark:bg-slate-800/60',
    text: 'text-slate-600 dark:text-slate-400',
    ring: 'ring-slate-200 dark:ring-slate-700/60',
    label: 'Low match',
  };
}

export default function MatchScore({ score, size = 'md' }: MatchScoreProps) {
  if (score <= 0) return null;

  const colors = scoreColor(score);
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-[11px] gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <div
      className={`inline-flex items-center rounded-full font-semibold select-none transition-colors ${colors.bg} ${colors.text} ring-1 ${colors.ring} ${sizeClasses}`}
      title={`Match score: ${score}% — ${colors.label}`}
    >
      <TrendingUp className={size === 'sm' ? 'w-3 h-3 shrink-0' : 'w-3.5 h-3.5 shrink-0'} />
      <span>{score}% match</span>
    </div>
  );
}