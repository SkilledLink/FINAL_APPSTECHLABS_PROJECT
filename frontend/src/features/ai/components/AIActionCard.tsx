import type { ActionCard } from '../types/ai.types';

interface AIActionCardProps {
  card: ActionCard;
  onClick: (card: ActionCard) => void;
}

export function AIActionCard({ card, onClick }: AIActionCardProps) {
  return (
    <button
      type="button"
      onClick={() => onClick(card)}
      className="group relative px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 dark:text-blue-300 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl border border-blue-200/80 dark:border-blue-500/30 ring-1 ring-white/40 dark:ring-white/5 shadow-[0_2px_12px_-6px_rgba(37,99,235,0.35)] hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-[0_6px_20px_-6px_rgba(37,99,235,0.55)] hover:-translate-y-0.5 transition-all duration-200 active:scale-[0.97]"
    >
      <span className="relative z-10">{card.label}</span>
    </button>
  );
}