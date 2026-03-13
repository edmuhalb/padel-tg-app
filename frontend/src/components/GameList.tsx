import { useState } from 'react';
import { useGames } from '../hooks/useGames';
import { GameCard } from './GameCard';
import type { Game, GameStatus } from '../types';

interface Props {
  onSelect: (game: Game) => void;
  currentUserId?: number | null;
}

type TabKey = 'active' | 'my' | 'completed' | 'cancelled';

const TABS: { key: TabKey; label: string; status?: GameStatus }[] = [
  { key: 'active', label: 'Активные' },
  { key: 'my', label: 'Мои' },
  { key: 'completed', label: 'Завершённые', status: 'COMPLETED' },
  { key: 'cancelled', label: 'Отменённые', status: 'CANCELLED' },
];

export function GameList({ onSelect, currentUserId }: Props) {
  const [tabIndex, setTabIndex] = useState(0);
  const currentTab = TABS[tabIndex];

  const queryStatus = currentTab.status ?? (currentTab.key === 'active' || currentTab.key === 'my' ? undefined : currentTab.status);
  const { data: games, isLoading, isError } = useGames(queryStatus);

  const filteredGames = (() => {
    if (!games) return games;
    if (currentTab.key === 'active') {
      return games.filter((g) => g.status === 'RECRUITING' || g.status === 'TEAM_READY');
    }
    if (currentTab.key === 'my' && currentUserId != null) {
      const uid = String(currentUserId);
      return games.filter(
        (g) =>
          (g.status === 'RECRUITING' || g.status === 'TEAM_READY') &&
          (g.creatorId === uid || g.participants.some((p) => p.userId === uid)),
      );
    }
    return games;
  })();

  return (
    <div>
      <div className="flex gap-1 p-1 bg-tg-secondary-bg rounded-xl mx-4 mb-4">
        {TABS.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setTabIndex(i)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              tabIndex === i
                ? 'bg-tg-section-bg text-tg-text shadow-sm'
                : 'text-tg-hint'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="px-4 space-y-3">
        {isLoading && (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-6 h-6 border-2 border-tg-button border-t-transparent rounded-full" />
          </div>
        )}

        {isError && (
          <p className="text-sm text-tg-destructive text-center py-8">
            Не удалось загрузить игры
          </p>
        )}

        {filteredGames?.length === 0 && !isLoading && (
          <p className="text-sm text-tg-hint text-center py-8">
            {currentTab.key === 'my' ? 'Вы пока не участвуете ни в одной игре' : 'Игр пока нет'}
          </p>
        )}

        {filteredGames?.map((game) => (
          <GameCard key={game.id} game={game} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}
