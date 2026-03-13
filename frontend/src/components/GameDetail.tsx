import { useState } from 'react';
import { useGame, useJoinGame, useLeaveGame, useUpdateGame } from '../hooks/useGames';
import { StatusBadge } from './StatusBadge';
import { EditGameForm } from './EditGameForm';
import { LEVEL_LABELS, type GameStatus } from '../types';

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
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [joinComment, setJoinComment] = useState('');
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [editing, setEditing] = useState(false);

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

  const canEdit = isCreator && (game.status === 'RECRUITING' || game.status === 'TEAM_READY');
  const canJoin = game.status === 'RECRUITING' && !isParticipant && !isFull;
  const canLeave = (game.status === 'RECRUITING' || game.status === 'TEAM_READY') && isParticipant;
  const canComplete = isCreator && game.status === 'TEAM_READY';
  const canCancel = isCreator && (game.status === 'RECRUITING' || game.status === 'TEAM_READY');

  function handleStatusChange(status: GameStatus) {
    updateMutation.mutate({ id: game!.id, status });
    setConfirmCancel(false);
  }

  if (editing && game) {
    return (
      <EditGameForm
        game={game}
        onSaved={() => setEditing(false)}
        onCancel={() => setEditing(false)}
      />
    );
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
          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-medium text-tg-link px-3 py-1.5 bg-tg-button/10 rounded-lg active:opacity-70 transition-opacity"
              >
                Изменить
              </button>
            )}
            <StatusBadge status={game.status} />
          </div>
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

          <div className="flex items-center gap-3">
            <span className="text-xl">⏱</span>
            <p className="text-sm text-tg-text">{game.duration} мин</p>
          </div>

          {game.desiredLevel && (
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <p className="text-sm text-tg-text">Уровень: {LEVEL_LABELS[game.desiredLevel]}</p>
            </div>
          )}

          {game.comment && (
            <div className="flex items-start gap-3">
              <span className="text-xl">💬</span>
              <p className="text-sm text-tg-text whitespace-pre-wrap">{game.comment}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-tg-hint uppercase tracking-wide mb-3">
            Игроки ({game.participants.length}/{game.maxPlayers})
          </h3>
          <div className="space-y-2">
            {game.participants.map((p) => (
              <div
                key={p.userId}
                className="bg-tg-secondary-bg rounded-xl px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-tg-button/15 flex items-center justify-center text-sm font-medium text-tg-button shrink-0">
                    {p.user.firstName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-tg-text">
                      {p.user.firstName} {p.user.lastName ?? ''}
                    </p>
                    {p.user.username && (
                      <p className="text-xs text-tg-hint">@{p.user.username}</p>
                    )}
                  </div>
                  {p.userId === game.creatorId && (
                    <span className="text-xs text-tg-hint shrink-0">автор</span>
                  )}
                </div>
                {p.comment && (
                  <p className="text-xs text-tg-hint mt-1.5 ml-11 italic">«{p.comment}»</p>
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
          {canJoin && !showJoinForm && (
            <button
              onClick={() => setShowJoinForm(true)}
              className="w-full py-3 bg-tg-button text-tg-button-text font-medium rounded-xl active:opacity-80 transition-opacity"
            >
              Присоединиться
            </button>
          )}

          {canJoin && showJoinForm && (
            <div className="space-y-2">
              <textarea
                value={joinComment}
                onChange={(e) => setJoinComment(e.target.value)}
                placeholder="Комментарий (необязательно)"
                rows={2}
                maxLength={200}
                className="w-full px-3 py-2.5 border border-tg-hint/20 rounded-xl text-sm bg-tg-secondary-bg text-tg-text placeholder:text-tg-hint focus:outline-none focus:ring-2 focus:ring-tg-button/30 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowJoinForm(false); setJoinComment(''); }}
                  className="flex-1 py-3 bg-tg-secondary-bg text-tg-text font-medium rounded-xl active:opacity-80 transition-opacity"
                >
                  Отмена
                </button>
                <button
                  onClick={() => joinMutation.mutate({ id: game.id, comment: joinComment.trim() || undefined })}
                  disabled={joinMutation.isPending}
                  className="flex-1 py-3 bg-tg-button text-tg-button-text font-medium rounded-xl active:opacity-80 disabled:opacity-50 transition-opacity"
                >
                  {joinMutation.isPending ? '...' : 'Вступить'}
                </button>
              </div>
            </div>
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

          {canCancel && !confirmCancel && (
            <button
              onClick={() => setConfirmCancel(true)}
              disabled={updateMutation.isPending}
              className="w-full py-3 bg-tg-destructive/10 text-tg-destructive font-medium rounded-xl active:opacity-80 disabled:opacity-50 transition-opacity"
            >
              Отменить игру
            </button>
          )}

          {canCancel && confirmCancel && (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmCancel(false)}
                className="flex-1 py-3 bg-tg-secondary-bg text-tg-text font-medium rounded-xl active:opacity-80 transition-opacity"
              >
                Нет
              </button>
              <button
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={updateMutation.isPending}
                className="flex-1 py-3 bg-tg-destructive text-white font-medium rounded-xl active:opacity-80 disabled:opacity-50 transition-opacity"
              >
                Да, отменить
              </button>
            </div>
          )}
        </div>

        {(joinMutation.isError || leaveMutation.isError || updateMutation.isError) && (
          <p className="text-sm text-tg-destructive text-center mt-3">
            {(joinMutation.error || leaveMutation.error || updateMutation.error)?.message}
          </p>
        )}
      </div>
    </div>
  );
}
