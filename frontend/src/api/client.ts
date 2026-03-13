import type { Game, GameStatus, Profile, PlayerLevel } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? '';

function getInitData(): string {
  try {
    return window.Telegram?.WebApp?.initData ?? '';
  } catch {
    return '';
  }
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `tma ${getInitData()}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.error || `Request failed: ${res.status}`;
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
  }

  return res.json();
}

export const api = {
  getGames(status?: GameStatus): Promise<Game[]> {
    const params = status ? `?status=${status}` : '';
    return request(`/api/games${params}`);
  },

  getGame(id: number): Promise<Game> {
    return request(`/api/games/${id}`);
  },

  createGame(data: {
    scheduledAt: string;
    location: string;
    courtCost: number;
    maxPlayers: number;
  }): Promise<Game> {
    return request('/api/games', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateGame(
    id: number,
    data: Partial<{
      scheduledAt: string;
      location: string;
      courtCost: number;
      maxPlayers: number;
      status: GameStatus;
    }>,
  ): Promise<Game> {
    return request(`/api/games/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  joinGame(id: number): Promise<Game> {
    return request(`/api/games/${id}/join`, { method: 'POST', body: '{}' });
  },

  leaveGame(id: number): Promise<Game> {
    return request(`/api/games/${id}/leave`, { method: 'POST', body: '{}' });
  },

  getProfile(): Promise<Profile> {
    return request('/api/profile');
  },

  updateProfile(data: { level: PlayerLevel }): Promise<Profile> {
    return request('/api/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};
