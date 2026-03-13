import { useState } from 'react';
import { useCreateGame } from '../hooks/useGames';
import { LEVEL_LABELS, type PlayerLevel } from '../types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

const DURATION_OPTIONS = [60, 90, 120];
const LEVEL_OPTIONS: (PlayerLevel | null)[] = [null, 'BEGINNER', 'CONFIDENT', 'EXPERIENCED'];

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
  const [duration, setDuration] = useState(90);
  const [comment, setComment] = useState('');
  const [desiredLevel, setDesiredLevel] = useState<PlayerLevel | null>(null);

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
      duration,
      comment: comment.trim() || undefined,
      desiredLevel: desiredLevel ?? undefined,
    });
    onCreated();
  }

  const costPerPerson = courtCost
    ? Math.ceil(parseInt(courtCost, 10) / maxPlayers)
    : 0;

  return (
    <form onSubmit={handleSubmit} className="pb-6">
      <div className="flex items-center justify-between px-4 pt-4 mb-6">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          Отмена
        </Button>
        <h2 className="text-lg font-bold text-foreground">Новая игра</h2>
        <Button
          type="submit"
          variant="ghost"
          size="sm"
          disabled={createMutation.isPending || !location.trim() || !courtCost}
        >
          {createMutation.isPending ? '...' : 'Создать'}
        </Button>
      </div>

      <div className="px-4 space-y-4">
        <div className="space-y-1.5">
          <Label>Дата и время</Label>
          <Input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => { setScheduledAt(e.target.value); setDateError(''); }}
            min={new Date().toISOString().slice(0, 16)}
            required
          />
          {dateError && (
            <p className="text-xs text-destructive mt-1">{dateError}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Площадка</Label>
          <Input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Название или адрес"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label>Стоимость корта (₽)</Label>
          <Input
            type="number"
            value={courtCost}
            onChange={(e) => setCourtCost(e.target.value)}
            placeholder="2000"
            min="0"
            required
          />
          {costPerPerson > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {costPerPerson}₽ с человека
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>Длительность</Label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((d) => (
              <Button
                key={d}
                type="button"
                variant={duration === d ? 'default' : 'secondary'}
                className="flex-1"
                onClick={() => setDuration(d)}
              >
                {d} мин
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Количество игроков</Label>
          <div className="flex gap-3">
            {([2, 4] as const).map((n) => (
              <Button
                key={n}
                type="button"
                variant={maxPlayers === n ? 'default' : 'secondary'}
                className="flex-1"
                onClick={() => setMaxPlayers(n)}
              >
                {n} игрока
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Желаемый уровень</Label>
          <div className="grid grid-cols-2 gap-2">
            {LEVEL_OPTIONS.map((lvl) => (
              <Button
                key={lvl ?? 'any'}
                type="button"
                variant={desiredLevel === lvl ? 'default' : 'secondary'}
                onClick={() => setDesiredLevel(lvl)}
              >
                {lvl ? LEVEL_LABELS[lvl] : 'Любой'}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Комментарий</Label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Доп. информация для участников"
            rows={2}
            maxLength={300}
            className="resize-none"
          />
        </div>
      </div>

      {createMutation.isError && (
        <p className="text-sm text-destructive text-center mt-4 px-4">
          {createMutation.error.message}
        </p>
      )}
    </form>
  );
}
