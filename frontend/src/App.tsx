import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GameList } from './components/GameList';
import { GameDetail } from './components/GameDetail';
import { CreateGameForm } from './components/CreateGameForm';
import { Profile } from './components/Profile';
import { Button } from '@/components/ui/button';
import { UserIcon } from 'lucide-react';
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
      <h2 className="text-lg font-bold text-foreground mb-2">Нет доступа</h2>
      <p className="text-sm text-muted-foreground">
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
          <h1 className="text-2xl font-bold text-foreground">Падел 🎾</h1>
          <p className="text-sm text-muted-foreground mt-1">Найди команду для игры</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setView('profile')}
          className="rounded-full bg-primary/10 text-primary"
          aria-label="Профиль"
        >
          <UserIcon className="w-5 h-5" />
        </Button>
      </div>

      <GameList onSelect={handleSelect} currentUserId={currentUserId} />

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-sm border-t border-border">
        <Button className="w-full" size="lg" onClick={() => setView('create')}>
          Создать игру
        </Button>
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
