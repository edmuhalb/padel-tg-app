export type PlayerLevel = 'NONE' | 'BEGINNER' | 'CONFIDENT' | 'EXPERIENCED';

export interface User {
  telegramId: string;
  firstName: string;
  lastName: string | null;
  username: string | null;
  level: PlayerLevel;
}

export interface Profile extends User {
  stats: {
    gamesPlayed: number;
    gamesCreated: number;
    gamesActive: number;
  };
}

export const LEVEL_LABELS: Record<PlayerLevel, string> = {
  NONE: 'Не указан',
  BEGINNER: 'Начинающий',
  CONFIDENT: 'Играю уверенно',
  EXPERIENCED: 'Опытный',
};

export interface GameParticipant {
  gameId: number;
  userId: string;
  joinedAt: string;
  user: User;
}

export type GameStatus = 'RECRUITING' | 'TEAM_READY' | 'COMPLETED' | 'CANCELLED';

export interface Game {
  id: number;
  creatorId: string;
  scheduledAt: string;
  location: string;
  courtCost: number;
  maxPlayers: number;
  status: GameStatus;
  telegramMessageId: string | null;
  createdAt: string;
  updatedAt: string;
  participants: GameParticipant[];
  creator: User;
}

export const STATUS_LABELS: Record<GameStatus, string> = {
  RECRUITING: 'Набор участников',
  TEAM_READY: 'Команда собрана',
  COMPLETED: 'Игра состоялась',
  CANCELLED: 'Игра не состоялась',
};

export const STATUS_COLORS: Record<GameStatus, string> = {
  RECRUITING: 'bg-green-100 text-green-800',
  TEAM_READY: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-gray-100 text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};
