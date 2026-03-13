import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameList } from './components/GameList';
import { GameDetail } from './components/GameDetail';
import { CreateGameForm } from './components/CreateGameForm';
import { Profile } from './components/Profile';
import type { Game } from './types';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if ((error as any)?.status === 401) return false;
        return failureCount < 1;
      },
    },
  },
});

type View = 'list' | 'detail' | 'create' | 'profile';

function getCurrentUserId(): number | null {
  try {
    const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
    return user?.id ?? null;
  } catch {
    return null;
  }
}

function AuthError() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <span className="text-4xl mb-4">🔒</span>
      <h2 className="text-lg font-bold text-tg-text mb-2">Нет доступа</h2>
      <p className="text-sm text-tg-hint">
        Откройте приложение через Telegram, чтобы авторизоваться.
      </p>
    </div>
  );
}

function AppContent() {
  const [view, setView] = useState<View>('list');
  const [selectedGameId, setSelectedGameId] = useState<number | null>(null);
  const currentUserId = getCurrentUserId();

  const isTelegram = Boolean(window.Telegram?.WebApp?.initData);
  if (!isTelegram) {
    return <AuthError />;
  }

  function handleSelect(game: Game) {
    setSelectedGameId(game.id);
    setView('detail');
  }

  if (view === 'profile') {
    return <Profile onBack={() => setView('list')} />;
  }

  if (view === 'create') {
    return (
      <CreateGameForm
        onCreated={() => setView('list')}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'detail' && selectedGameId != null) {
    return (
      <GameDetail
        gameId={selectedGameId}
        currentUserId={currentUserId}
        onBack={() => setView('list')}
      />
    );
  }

  return (
    <div className="pb-24">
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-tg-text">Падел 🎾</h1>
          <p className="text-sm text-tg-hint mt-1">Найди команду для игры</p>
        </div>
        <button
          onClick={() => setView('profile')}
          className="w-10 h-10 rounded-full bg-tg-button/15 flex items-center justify-center text-tg-button active:opacity-70 transition-opacity"
          aria-label="Профиль"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
          </svg>
        </button>
      </div>

      <GameList onSelect={handleSelect} currentUserId={currentUserId} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-tg-bg/80 backdrop-blur-sm border-t border-tg-hint/10">
        <button
          onClick={() => setView('create')}
          className="w-full py-3 bg-tg-button text-tg-button-text font-semibold rounded-xl active:opacity-80 transition-opacity"
        >
          Создать игру
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
