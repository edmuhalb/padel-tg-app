import { useProfile, useUpdateProfile } from '../hooks/useGames';
import { LEVEL_LABELS, type PlayerLevel } from '../types';

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
        <div className="animate-spin w-8 h-8 border-2 border-tg-button border-t-transparent rounded-full" />
      </div>
    );
  }

  function handleLevelChange(level: PlayerLevel) {
    updateMutation.mutate({ level });
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
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-tg-button/15 flex items-center justify-center text-2xl font-bold text-tg-button">
            {profile.firstName[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-tg-text">
              {profile.firstName} {profile.lastName ?? ''}
            </h2>
            {profile.username && (
              <p className="text-sm text-tg-hint">@{profile.username}</p>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-tg-hint uppercase tracking-wide mb-3">
            Статистика
          </h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-tg-secondary-bg rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-tg-text">{profile.stats.gamesPlayed}</p>
              <p className="text-xs text-tg-hint mt-1">Сыграно</p>
            </div>
            <div className="bg-tg-secondary-bg rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-tg-text">{profile.stats.gamesCreated}</p>
              <p className="text-xs text-tg-hint mt-1">Создано</p>
            </div>
            <div className="bg-tg-secondary-bg rounded-xl p-3 text-center">
              <p className="text-2xl font-bold text-tg-text">{profile.stats.gamesActive}</p>
              <p className="text-xs text-tg-hint mt-1">Активных</p>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-tg-hint uppercase tracking-wide mb-3">
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
                    ? 'bg-tg-button/15 ring-2 ring-tg-button'
                    : 'bg-tg-secondary-bg'
                }`}
              >
                <span className="text-lg">{LEVEL_ICONS[level]}</span>
                <span className={`text-sm font-medium ${
                  profile.level === level ? 'text-tg-button' : 'text-tg-text'
                }`}>
                  {LEVEL_LABELS[level]}
                </span>
                {profile.level === level && (
                  <span className="ml-auto text-tg-button text-sm">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
