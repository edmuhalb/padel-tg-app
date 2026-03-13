import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameList } from './components/GameList';
import { GameDetail } from './components/GameDetail';
import { CreateGameForm } from './components/CreateGameForm';
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

type View = 'list' | 'detail' | 'create';

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
      <div className="px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-tg-text">Падел 🎾</h1>
        <p className="text-sm text-tg-hint mt-1">Найди команду для игры</p>
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
