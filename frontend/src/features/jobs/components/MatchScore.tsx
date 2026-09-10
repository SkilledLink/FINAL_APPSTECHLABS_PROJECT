import { TrendingUp } from 'lucide-react';

interface MatchScoreProps {
  score: number;
  size?: 'sm' | 'md';
}

function scoreColor(score: number): { bg: string; text: string; ring: string; label: string } {
  if (score >= 85) return { bg: 'bg-brand-50', text: 'text-brand-700', ring: 'ring-brand-200', label: 'Excellent' };
  if (score >= 70) return { bg: 'bg-blue-50', text: 'text-blue-700', ring: 'ring-blue-200', label: 'Good' };
  if (score >= 50) return { bg: 'bg-accent-50', text: 'text-accent-700', ring: 'ring-accent-200', label: 'Fair' };
  return { bg: 'bg-ink-100', text: 'text-ink-500', ring: 'ring-ink-200', label: 'Low' };
}

export default function MatchScore({ score, size = 'md' }: MatchScoreProps) {
  if (score <= 0) return null;

  const colors = scoreColor(score);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs gap-1.5';

  return (
    <div
      className={`inline-flex items-center rounded-full ${colors.bg} ${colors.text} ring-1 ${colors.ring} font-semibold ${sizeClasses}`}
      title={`Match score: ${score}% — ${colors.label}`}
    >
      <TrendingUp className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      <span>{score}% match</span>
    </div>
  );
}
