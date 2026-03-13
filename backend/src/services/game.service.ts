import { prisma } from '../lib/prisma.js';
import type { GameStatus, PlayerLevel } from '@prisma/client';

interface CreateGameData {
  scheduledAt: string;
  location: string;
  courtCost: number;
  maxPlayers: number;
  duration?: number;
  comment?: string;
  desiredLevel?: PlayerLevel;
}

interface UserData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
}

const gameInclude = {
  participants: {
    include: { user: true },
    orderBy: { joinedAt: 'asc' as const },
  },
  creator: true,
};

export async function createGame(creatorId: bigint, data: CreateGameData, userData: UserData) {
  const scheduledDate = new Date(data.scheduledAt);
  if (scheduledDate <= new Date()) {
    throw new Error('Дата игры должна быть в будущем');
  }

  await prisma.user.upsert({
    where: { telegramId: creatorId },
    update: { firstName: userData.first_name, lastName: userData.last_name ?? null, username: userData.username ?? null },
    create: { telegramId: creatorId, firstName: userData.first_name, lastName: userData.last_name ?? null, username: userData.username ?? null },
  });

  return prisma.game.create({
    data: {
      creatorId,
      scheduledAt: new Date(data.scheduledAt),
      location: data.location,
      courtCost: data.courtCost,
      maxPlayers: data.maxPlayers,
      duration: data.duration ?? 90,
      comment: data.comment ?? null,
      desiredLevel: data.desiredLevel ?? null,
    },
    include: gameInclude,
  });
}

export async function getGames(status?: GameStatus, limit = 20, offset = 0) {
  return prisma.game.findMany({
    where: status ? { status } : undefined,
    include: gameInclude,
    orderBy: { scheduledAt: 'asc' },
    take: limit,
    skip: offset,
  });
}

export async function getGame(id: number) {
  return prisma.game.findUnique({
    where: { id },
    include: gameInclude,
  });
}

export async function updateGame(
  id: number,
  creatorId: bigint,
  data: Partial<Pick<CreateGameData, 'scheduledAt' | 'location' | 'courtCost' | 'maxPlayers'>> & { status?: GameStatus },
) {
  const game = await prisma.game.findUnique({ where: { id } });
  if (!game) throw new Error('Game not found');
  if (game.creatorId !== creatorId) throw new Error('Only creator can update');

  const updateData: Record<string, unknown> = {};
  if (data.scheduledAt) updateData.scheduledAt = new Date(data.scheduledAt);
  if (data.location) updateData.location = data.location;
  if (data.courtCost !== undefined) updateData.courtCost = data.courtCost;
  if (data.maxPlayers !== undefined) updateData.maxPlayers = data.maxPlayers;
  if (data.status) updateData.status = data.status;

  return prisma.game.update({
    where: { id },
    data: updateData,
    include: gameInclude,
  });
}

export async function joinGame(gameId: number, userId: bigint, userData: UserData, comment?: string) {
  return prisma.$transaction(async (tx) => {
    const game = await tx.game.findUnique({ where: { id: gameId } });
    if (!game) throw new Error('Game not found');
    if (game.status !== 'RECRUITING') throw new Error('Game is not recruiting');

    const count = await tx.gameParticipant.count({ where: { gameId } });
    if (count >= game.maxPlayers) throw new Error('Game is full');

    await tx.user.upsert({
      where: { telegramId: userId },
      update: { firstName: userData.first_name, lastName: userData.last_name ?? null, username: userData.username ?? null },
      create: { telegramId: userId, firstName: userData.first_name, lastName: userData.last_name ?? null, username: userData.username ?? null },
    });

    await tx.gameParticipant.create({
      data: { gameId, userId, comment: comment ?? null },
    });

    const newCount = count + 1;
    if (newCount >= game.maxPlayers) {
      await tx.game.update({
        where: { id: gameId },
        data: { status: 'TEAM_READY' },
      });
    }

    return tx.game.findUnique({
      where: { id: gameId },
      include: gameInclude,
    });
  });
}

export async function leaveGame(gameId: number, userId: bigint) {
  const game = await prisma.game.findUnique({ where: { id: gameId } });
  if (!game) throw new Error('Game not found');

  await prisma.gameParticipant.delete({
    where: { gameId_userId: { gameId, userId } },
  });

  if (game.status === 'TEAM_READY') {
    await prisma.game.update({
      where: { id: gameId },
      data: { status: 'RECRUITING' },
    });
  }

  return prisma.game.findUnique({
    where: { id: gameId },
    include: gameInclude,
  });
}
