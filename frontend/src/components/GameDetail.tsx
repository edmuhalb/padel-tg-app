import { useState } from 'react';
import { useGame, useJoinGame, useLeaveGame, useUpdateGame } from '../hooks/useGames';
import { StatusBadge } from './StatusBadge';
import { EditGameForm } from './EditGameForm';
import { LEVEL_LABELS, type GameStatus } from '../types';
import { Button } from '@/components/ui/button';

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
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
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
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="mb-4 mx-4 mt-4"
      >
        ← Назад
      </Button>

      <div className="px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground">Падел</h2>
          <div className="flex items-center gap-2">
            {canEdit && (
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Изменить
              </Button>
            )}
            <StatusBadge status={game.status} />
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-sm font-medium text-foreground">{dateStr}</p>
              <p className="text-sm text-muted-foreground">{timeStr}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">📍</span>
            <p className="text-sm text-foreground">{game.location}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">💰</span>
            <div>
              <p className="text-sm font-medium text-foreground">{game.courtCost}₽ за корт</p>
              <p className="text-sm text-muted-foreground">{costPerPerson}₽ с человека</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xl">⏱</span>
            <p className="text-sm text-foreground">{game.duration} мин</p>
          </div>

          {game.desiredLevel && (
            <div className="flex items-center gap-3">
              <span className="text-xl">🎯</span>
              <p className="text-sm text-foreground">Уровень: {LEVEL_LABELS[game.desiredLevel]}</p>
            </div>
          )}

          {game.comment && (
            <div className="flex items-start gap-3">
              <span className="text-xl">💬</span>
              <p className="text-sm text-foreground whitespace-pre-wrap">{game.comment}</p>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Игроки ({game.participants.length}/{game.maxPlayers})
          </h3>
          <div className="space-y-2">
            {game.participants.map((p) => (
              <div
                key={p.userId}
                className="bg-secondary rounded-xl px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    {p.user.firstName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {p.user.firstName} {p.user.lastName ?? ''}
                    </p>
                    {p.user.username && (
                      <p className="text-xs text-muted-foreground">@{p.user.username}</p>
                    )}
                  </div>
                  {p.userId === game.creatorId && (
                    <span className="text-xs text-muted-foreground shrink-0">автор</span>
                  )}
                </div>
                {p.comment && (
                  <p className="text-xs text-muted-foreground mt-1.5 ml-11 italic">«{p.comment}»</p>
                )}
              </div>
            ))}
            {game.participants.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Пока никто не присоединился
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          {canJoin && !showJoinForm && (
            <Button className="w-full" onClick={() => setShowJoinForm(true)}>
              Присоединиться
            </Button>
          )}

          {canJoin && showJoinForm && (
            <div className="space-y-2">
              <textarea
                value={joinComment}
                onChange={(e) => setJoinComment(e.target.value)}
                placeholder="Комментарий (необязательно)"
                rows={2}
                maxLength={200}
                className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm shadow-black/5 transition-shadow placeholder:text-muted-foreground/70 focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20 resize-none"
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => { setShowJoinForm(false); setJoinComment(''); }}
                >
                  Отмена
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => joinMutation.mutate({ id: game.id, comment: joinComment.trim() || undefined })}
                  disabled={joinMutation.isPending}
                >
                  {joinMutation.isPending ? '...' : 'Вступить'}
                </Button>
              </div>
            </div>
          )}

          {canLeave && (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => leaveMutation.mutate(game.id)}
              disabled={leaveMutation.isPending}
            >
              {leaveMutation.isPending ? 'Выхожу...' : 'Покинуть игру'}
            </Button>
          )}

          {canComplete && (
            <Button
              className="w-full bg-green-500 hover:bg-green-600 text-white"
              onClick={() => handleStatusChange('COMPLETED')}
              disabled={updateMutation.isPending}
            >
              Игра состоялась
            </Button>
          )}

          {canCancel && !confirmCancel && (
            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setConfirmCancel(true)}
              disabled={updateMutation.isPending}
            >
              Отменить игру
            </Button>
          )}

          {canCancel && confirmCancel && (
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmCancel(false)}
              >
                Нет
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleStatusChange('CANCELLED')}
                disabled={updateMutation.isPending}
              >
                Да, отменить
              </Button>
            </div>
          )}
        </div>

        {(joinMutation.isError || leaveMutation.isError || updateMutation.isError) && (
          <p className="text-sm text-destructive text-center mt-3">
            {(joinMutation.error || leaveMutation.error || updateMutation.error)?.message}
          </p>
        )}
      </div>
    </div>
  );
}
