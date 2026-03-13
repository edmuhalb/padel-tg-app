import type { FastifyInstance } from 'fastify';
import type { PlayerLevel } from '@prisma/client';
import { telegramAuth } from '../middleware/telegramAuth.js';
import { prisma } from '../lib/prisma.js';

export async function profileRoutes(app: FastifyInstance) {
  app.addHook('preHandler', telegramAuth);

  app.get('/api/profile', async (request) => {
    const tgUser = request.telegramUser;
    const telegramId = BigInt(tgUser.id);

    const user = await prisma.user.upsert({
      where: { telegramId },
      update: {
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
      },
      create: {
        telegramId,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name ?? null,
        username: tgUser.username ?? null,
      },
    });

    const gamesPlayed = await prisma.gameParticipant.count({
      where: {
        userId: telegramId,
        game: { status: 'COMPLETED' },
      },
    });

    const gamesCreated = await prisma.game.count({
      where: { creatorId: telegramId },
    });

    const gamesActive = await prisma.gameParticipant.count({
      where: {
        userId: telegramId,
        game: { status: { in: ['RECRUITING', 'TEAM_READY'] } },
      },
    });

    return {
      ...user,
      stats: {
        gamesPlayed,
        gamesCreated,
        gamesActive,
      },
    };
  });

  app.patch<{
    Body: { level: PlayerLevel };
  }>('/api/profile', async (request) => {
    const telegramId = BigInt(request.telegramUser.id);
    const { level } = request.body;

    const user = await prisma.user.update({
      where: { telegramId },
      data: { level },
    });

    return user;
  });
}
