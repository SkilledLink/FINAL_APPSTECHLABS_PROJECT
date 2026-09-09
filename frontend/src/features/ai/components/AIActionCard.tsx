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
      className="px-4 py-2.5 bg-white border-2 border-teal-200 text-teal-700 rounded-xl text-sm font-medium hover:bg-teal-50 hover:border-teal-400 transition-all duration-200 active:scale-95 shadow-sm"
    >
      {card.label}
    </button>
  );
}