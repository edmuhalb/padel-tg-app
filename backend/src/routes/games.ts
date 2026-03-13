import type { FastifyInstance } from 'fastify';
import type { GameStatus, PlayerLevel } from '@prisma/client';
import { telegramAuth } from '../middleware/telegramAuth.js';
import { bot } from '../bot/index.js';
import { sendGameMessage, updateGameMessage, sendTeamReadyNotification } from '../bot/messages.js';
import * as gameService from '../services/game.service.js';

export async function gameRoutes(app: FastifyInstance) {
  app.addHook('preHandler', telegramAuth);

  app.get<{
    Querystring: { status?: GameStatus; limit?: string; offset?: string };
  }>('/api/games', async (request) => {
    const { status, limit, offset } = request.query;
    return gameService.getGames(
      status,
      limit ? parseInt(limit, 10) : undefined,
      offset ? parseInt(offset, 10) : undefined,
    );
  });

  app.post<{
    Body: {
      scheduledAt: string;
      location: string;
      courtCost: number;
      maxPlayers: number;
      duration?: number;
      comment?: string;
      desiredLevel?: PlayerLevel;
    };
  }>('/api/games', async (request, reply) => {
    const user = request.telegramUser;

    let game;
    try {
      game = await gameService.createGame(BigInt(user.id), request.body, user);
    } catch (err: any) {
      reply.code(400);
      return { error: err.message };
    }

    const chatId = process.env.GROUP_CHAT_ID;
    if (chatId && game) {
      try {
        const messageId = await sendGameMessage(bot, chatId, game);
        const { prisma } = await import('../lib/prisma.js');
        await prisma.game.update({
          where: { id: game.id },
          data: { telegramMessageId: String(messageId) },
        });
      } catch (err) {
        request.log.error(err, 'Failed to send game message to group chat');
      }
    }

    reply.code(201);
    return gameService.getGame(game.id);
  });

  app.get<{ Params: { id: string } }>('/api/games/:id', async (request, reply) => {
    const game = await gameService.getGame(parseInt(request.params.id, 10));
    if (!game) {
      reply.code(404);
      return { error: 'Game not found' };
    }
    return game;
  });

  app.patch<{
    Params: { id: string };
    Body: Partial<{ scheduledAt: string; location: string; courtCost: number; maxPlayers: number; status: GameStatus }>;
  }>('/api/games/:id', async (request, reply) => {
    const user = request.telegramUser;
    try {
      const game = await gameService.updateGame(
        parseInt(request.params.id, 10),
        BigInt(user.id),
        request.body,
      );
      await tryUpdateGroupMessage(request, game);
      return game;
    } catch (err: any) {
      reply.code(err.message === 'Only creator can update' ? 403 : 400);
      return { error: err.message };
    }
  });

  app.post<{ Params: { id: string }; Body: { comment?: string } }>('/api/games/:id/join', async (request, reply) => {
    const user = request.telegramUser;
    try {
      const game = await gameService.joinGame(
        parseInt(request.params.id, 10),
        BigInt(user.id),
        user,
        request.body?.comment,
      );
      await tryUpdateGroupMessage(request, game);

      if (game?.status === 'TEAM_READY') {
        const chatId = process.env.GROUP_CHAT_ID;
        if (chatId) {
          try {
            await sendTeamReadyNotification(bot, chatId, game);
          } catch (err) {
            request.log.error(err, 'Failed to send team ready notification');
          }
        }
      }

      return game;
    } catch (err: any) {
      reply.code(400);
      return { error: err.message };
    }
  });

  app.post<{ Params: { id: string } }>('/api/games/:id/leave', async (request, reply) => {
    const user = request.telegramUser;
    try {
      const game = await gameService.leaveGame(
        parseInt(request.params.id, 10),
        BigInt(user.id),
      );
      await tryUpdateGroupMessage(request, game);
      return game;
    } catch (err: any) {
      reply.code(400);
      return { error: err.message };
    }
  });
}

async function tryUpdateGroupMessage(request: any, game: any) {
  const chatId = process.env.GROUP_CHAT_ID;
  if (!chatId || !game?.telegramMessageId) return;
  try {
    await updateGameMessage(bot, chatId, parseInt(game.telegramMessageId, 10), game);
  } catch (err) {
    request.log.error(err, 'Failed to update game message in group chat');
  }
}
