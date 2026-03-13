import { useState } from 'react';
import { useUpdateGame } from '../hooks/useGames';
import { LEVEL_LABELS, type Game, type PlayerLevel } from '../types';

const DURATION_OPTIONS = [60, 90, 120];
const LEVEL_OPTIONS: (PlayerLevel | null)[] = [null, 'BEGINNER', 'CONFIDENT', 'EXPERIENCED'];

interface Props {
  game: Game;
  onSaved: () => void;
  onCancel: () => void;
}

function toLocalDatetime(iso: string): string {
  const d = new Date(iso);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

export function EditGameForm({ game, onSaved, onCancel }: Props) {
  const updateMutation = useUpdateGame();

  const [scheduledAt, setScheduledAt] = useState(toLocalDatetime(game.scheduledAt));
  const [location, setLocation] = useState(game.location);
  const [courtCost, setCourtCost] = useState(String(game.courtCost));
  const [maxPlayers, setMaxPlayers] = useState<2 | 4>(game.maxPlayers as 2 | 4);
  const [duration, setDuration] = useState(game.duration);
  const [comment, setComment] = useState(game.comment ?? '');
  const [desiredLevel, setDesiredLevel] = useState<PlayerLevel | null>(game.desiredLevel);

  const [dateError, setDateError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!location.trim() || !courtCost) return;

    const selectedDate = new Date(scheduledAt);
    if (selectedDate <= new Date()) {
      setDateError('Дата игры должна быть в будущем');
      return;
    }
    setDateError('');

    await updateMutation.mutateAsync({
      id: game.id,
      scheduledAt: selectedDate.toISOString(),
      location: location.trim(),
      courtCost: parseInt(courtCost, 10),
      maxPlayers,
      duration,
      comment: comment.trim() || '',
      desiredLevel: desiredLevel ?? undefined,
    });
    onSaved();
  }

  const costPerPerson = courtCost
    ? Math.ceil(parseInt(courtCost, 10) / maxPlayers)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="pb-6">
      <div className="flex items-center justify-between px-4 pt-4 mb-6">
        <button type="button" onClick={onCancel} className="text-sm text-tg-link">
          Отмена
        </button>
        <h2 className="text-lg font-bold text-tg-text">Редактировать</h2>
        <button
          type="submit"
          disabled={updateMutation.isPending || !location.trim() || !courtCost}
          className="text-sm font-semibold text-tg-link disabled:text-tg-hint/40"
        >
          {updateMutation.isPending ? '...' : 'Сохранить'}
        </button>
      </div>

      <div className="px-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-tg-text mb-1">
            Дата и время
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => { setScheduledAt(e.target.value); setDateError(''); }}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2.5 border border-tg-hint/20 rounded-xl text-sm bg-tg-secondary-bg text-tg-text focus:outline-none focus:ring-2 focus:ring-tg-button/30"
            required
          />
          {dateError && (
            <p className="text-xs text-tg-destructive mt-1">{dateError}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-tg-text mb-1">
            Площадка
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Название или адрес"
            className="w-full px-3 py-2.5 border border-tg-hint/20 rounded-xl text-sm bg-tg-secondary-bg text-tg-text placeholder:text-tg-hint focus:outline-none focus:ring-2 focus:ring-tg-button/30"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tg-text mb-1">
            Стоимость корта (₽)
          </label>
          <input
            type="number"
            value={courtCost}
            onChange={(e) => setCourtCost(e.target.value)}
            placeholder="2000"
            min="0"
            className="w-full px-3 py-2.5 border border-tg-hint/20 rounded-xl text-sm bg-tg-secondary-bg text-tg-text placeholder:text-tg-hint focus:outline-none focus:ring-2 focus:ring-tg-button/30"
            required
          />
          {costPerPerson > 0 && (
            <p className="text-xs text-tg-hint mt-1">
              {costPerPerson}₽ с человека
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-tg-text mb-2">
            Длительность
          </label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  duration === d
                    ? 'bg-tg-button text-tg-button-text'
                    : 'bg-tg-secondary-bg text-tg-hint'
                }`}
              >
                {d} мин
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-tg-text mb-2">
            Количество игроков
          </label>
          <div className="flex gap-3">
            {([2, 4] as const).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setMaxPlayers(n)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  maxPlayers === n
                    ? 'bg-tg-button text-tg-button-text'
                    : 'bg-tg-secondary-bg text-tg-hint'
                }`}
              >
                {n} игрока
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-tg-text mb-2">
            Желаемый уровень
          </label>
          <div className="grid grid-cols-2 gap-2">
            {LEVEL_OPTIONS.map((lvl) => (
              <button
                key={lvl ?? 'any'}
                type="button"
                onClick={() => setDesiredLevel(lvl)}
                className={`py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  desiredLevel === lvl
                    ? 'bg-tg-button text-tg-button-text'
                    : 'bg-tg-secondary-bg text-tg-hint'
                }`}
              >
                {lvl ? LEVEL_LABELS[lvl] : 'Любой'}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-tg-text mb-1">
            Комментарий
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Доп. информация для участников"
            rows={2}
            maxLength={300}
            className="w-full px-3 py-2.5 border border-tg-hint/20 rounded-xl text-sm bg-tg-secondary-bg text-tg-text placeholder:text-tg-hint focus:outline-none focus:ring-2 focus:ring-tg-button/30 resize-none"
          />
        </div>
      </div>

      {updateMutation.isError && (
        <p className="text-sm text-tg-destructive text-center mt-4 px-4">
          {updateMutation.error.message}
        </p>
      )}
    </form>
  );
}
