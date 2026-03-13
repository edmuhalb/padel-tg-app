import { useGame, useJoinGame, useLeaveGame, useUpdateGame } from '../hooks/useGames';
import { StatusBadge } from './StatusBadge';
import type { GameStatus } from '../types';

interface Props {
  gameId: number;
  currentUserId: number | null;
  onBack: () => void;
}

export function GameDetail({ gameId, currentUserId, onBack }: Props) {
  const { data: game, isLoading } = useGame(gameId);
  const joinMutation = useJoinGame();
  const leaveMutation = useLeaveGame();
  const updateMutation = useUpdateGame();

  if (isLoading || !game) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const isCreator = currentUserId != null && game.creatorId === String(currentUserId);
  const isParticipant = currentUserId != null && game.participants.some(
    (p) => p.userId === String(currentUserId),
  );
  const isFull = game.participants.length >= game.maxPlayers;

  const date = new Date(game.scheduledAt);
  const dateStr = date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const timeStr = date.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const costPerPerson = Math.ceil(game.courtCost / game.maxPlayers);

  const canJoin = game.status === 'RECRUITING' && !isParticipant && !isFull;
  const canLeave = (game.status === 'RECRUITING' || game.status === 'TEAM_READY') && isParticipant;
  const canComplete = isCreator && game.status === 'TEAM_READY';
  const canCancel = isCreator && (game.status === 'RECRUITING' || game.status === 'TEAM_READY');

  function handleStatusChange(status: GameStatus) {
    if (status === 'CANCELLED') {
      const confirmed = window.confirm('Вы уверены, что хотите отменить игру?');
      if (!confirmed) return;
    }
    updateMutation.mutate({ id: game!.id, status });
  }

  return (
    <div className="pb-6">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-tg-link mb-4 px-4 pt-4"
      >
        ← Назад
      </button>

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-tg-text">Падел</h2>
          <StatusBadge status={game.status} />
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm font-medium text-tg-text">{dateStr}</p>
              <p className="text-sm text-tg-hint">{timeStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">📍</span>
            <p className="text-sm text-tg-text">{game.location}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <div>
              <p className="text-sm font-medium text-tg-text">{game.courtCost}₽ за корт</p>
              <p className="text-sm text-tg-hint">{costPerPerson}₽ с человека</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-tg-hint uppercase tracking-wide mb-3">
            Игроки ({game.participants.length}/{game.maxPlayers})
          </h3>
          <div className="space-y-2">
            {game.participants.map((p) => (
              <div
                key={p.userId}
                className="flex items-center gap-3 bg-tg-secondary-bg rounded-xl px-3 py-2.5"
              >
                <div className="w-8 h-8 rounded-full bg-tg-button/15 flex items-center justify-center text-sm font-medium text-tg-button">
                  {p.user.firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-tg-text">
                    {p.user.firstName} {p.user.lastName ?? ''}
                  </p>
                  {p.user.username && (
                    <p className="text-xs text-tg-hint">@{p.user.username}</p>
                  )}
                </div>
                {p.userId === game.creatorId && (
                  <span className="ml-auto text-xs text-tg-hint">автор</span>
                )}
              </div>
            ))}
            {game.participants.length === 0 && (
              <p className="text-sm text-tg-hint text-center py-4">
                Пока никто не присоединился
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {canJoin && (
            <button
              onClick={() => joinMutation.mutate(game.id)}
              disabled={joinMutation.isPending}
              className="w-full py-3 bg-tg-button text-tg-button-text font-medium rounded-xl active:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {joinMutation.isPending ? 'Присоединяюсь...' : 'Присоединиться'}
            </button>
          )}

          {canLeave && (
            <button
              onClick={() => leaveMutation.mutate(game.id)}
              disabled={leaveMutation.isPending}
              className="w-full py-3 bg-tg-secondary-bg text-tg-text font-medium rounded-xl active:opacity-80 disabled:opacity-50 transition-opacity"
            >
              {leaveMutation.isPending ? 'Выхожу...' : 'Покинуть игру'}
            </button>
          )}

          {canComplete && (
            <button
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={updateMutation.isPending}
              className="w-full py-3 bg-green-500 text-white font-medium rounded-xl active:bg-green-600 disabled:opacity-50"
            >
              Игра состоялась
            </button>
          )}

          {canCancel && (
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={updateMutation.isPending}
              className="w-full py-3 bg-tg-destructive/10 text-tg-destructive font-medium rounded-xl active:opacity-80 disabled:opacity-50 transition-opacity"
            >
              Отменить игру
            </button>
          )}
        </div>

        {(joinMutation.isError || leaveMutation.isError || updateMutation.isError) && (
          <p className="text-sm text-tg-destructive text-center mt-3">
            {(joinMutation.error || leaveMutation.error || updateMutation.error)?.message}
          </p>
        )}

        {/* DEBUG — удалить после отладки */}
        <p className="text-xs text-tg-hint mt-4 text-center opacity-50">
          me={currentUserId} creator={game.creatorId} match={String(isCreator)}
        </p>
      </div>
    </div>
  );
}
