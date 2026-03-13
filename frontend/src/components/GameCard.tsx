import type { Game } from '../types';
import { StatusBadge } from './StatusBadge';

interface Props {
  game: Game;
  onSelect: (game: Game) => void;
}

export function GameCard({ game, onSelect }: Props) {
  const date = new Date(game.scheduledAt);
  const dateStr = date.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const timeStr = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const costPerPerson = Math.ceil(game.courtCost / game.maxPlayers);

  return (
    <button
      onClick={() => onSelect(game)}
      className="w-full text-left bg-tg-section-bg rounded-2xl shadow-sm border border-tg-hint/10 p-4 active:scale-[0.98] transition-transform"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-sm font-semibold text-tg-text">
            {dateStr}, {timeStr}
          </p>
          <p className="text-sm text-tg-hint mt-0.5">{game.location}</p>
        </div>
        <StatusBadge status={game.status} />
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-tg-hint/10">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">👥</span>
          <span className="text-sm font-medium text-tg-text">
            {game.participants.length}/{game.maxPlayers}
          </span>
        </div>
        <p className="text-sm text-tg-hint">
          {costPerPerson}₽/чел
        </p>
      </div>
    </button>
  );
}
