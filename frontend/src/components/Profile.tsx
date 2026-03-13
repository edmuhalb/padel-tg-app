import { useProfile, useUpdateProfile } from '../hooks/useGames';
import { LEVEL_LABELS, type PlayerLevel } from '../types';
import { Button } from '@/components/ui/button';
import { NumberFlow } from '@/components/ui/number-flow';

const LEVELS: PlayerLevel[] = ['NONE', 'BEGINNER', 'CONFIDENT', 'EXPERIENCED'];

const LEVEL_ICONS: Record<PlayerLevel, string> = {
  NONE: '⚪',
  BEGINNER: '🟢',
  CONFIDENT: '🔵',
  EXPERIENCED: '🟣',
};

interface Props {
  onBack: () => void;
}

export function Profile({ onBack }: Props) {
  const { data: profile, isLoading } = useProfile();
  const updateMutation = useUpdateProfile();

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  function handleLevelChange(level: PlayerLevel) {
    updateMutation.mutate({ level });
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
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center text-2xl font-bold text-primary">
            {profile.firstName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {profile.firstName} {profile.lastName ?? ''}
            </h2>
            {profile.username && (
              <p className="text-sm text-muted-foreground">@{profile.username}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Статистика
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground font-tabular-nums">
                <NumberFlow value={profile.stats.gamesPlayed} trend={false} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Сыграно</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground font-tabular-nums">
                <NumberFlow value={profile.stats.gamesCreated} trend={false} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Создано</p>
            </div>
            <div className="bg-secondary rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-foreground font-tabular-nums">
                <NumberFlow value={profile.stats.gamesActive} trend={false} />
              </p>
              <p className="text-xs text-muted-foreground mt-1">Активных</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Уровень игры
          </h3>
          <div className="space-y-2">
            {LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => handleLevelChange(level)}
                disabled={updateMutation.isPending}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  profile.level === level
                    ? 'bg-primary/15 ring-2 ring-primary'
                    : 'bg-secondary'
                }`}
              >
                <span className="text-lg">{LEVEL_ICONS[level]}</span>
                <span className={`text-sm font-medium ${
                  profile.level === level ? 'text-primary' : 'text-foreground'
                }`}>
                  {LEVEL_LABELS[level]}
                </span>
                {profile.level === level && (
                  <span className="ml-auto text-primary text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
