import { useState } from 'react';
import { useCreateGame } from '../hooks/useGames';

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

export function CreateGameForm({ onCreated, onCancel }: Props) {
  const createMutation = useCreateGame();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(19, 0, 0, 0);

  const [scheduledAt, setScheduledAt] = useState(
    tomorrow.toISOString().slice(0, 16),
  );
  const [location, setLocation] = useState('');
  const [courtCost, setCourtCost] = useState('');
  const [maxPlayers, setMaxPlayers] = useState<2 | 4>(4);

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

    await createMutation.mutateAsync({
      scheduledAt: selectedDate.toISOString(),
      location: location.trim(),
      courtCost: parseInt(courtCost, 10),
      maxPlayers,
    });
    onCreated();
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
        <h2 className="text-lg font-bold text-tg-text">Новая игра</h2>
        <button
          type="submit"
          disabled={createMutation.isPending || !location.trim() || !courtCost}
          className="text-sm font-semibold text-tg-link disabled:text-tg-hint/40"
        >
          {createMutation.isPending ? '...' : 'Создать'}
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
      </div>

      {createMutation.isError && (
        <p className="text-sm text-tg-destructive text-center mt-4 px-4">
          {createMutation.error.message}
        </p>
      )}
    </form>
  );
}
