import cron from 'node-cron';
import { prisma } from '../lib/prisma.js';
import { bot } from '../bot/index.js';
import { updateGameMessage } from '../bot/messages.js';

export function startScheduler() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const expiredGames = await prisma.game.findMany({
        where: {
          status: 'RECRUITING',
          scheduledAt: { lt: new Date() },
        },
        include: {
          participants: { include: { user: true }, orderBy: { joinedAt: 'asc' } },
          creator: true,
        },
      });

      const chatId = process.env.GROUP_CHAT_ID;

      for (const game of expiredGames) {
        await prisma.game.update({
          where: { id: game.id },
          data: { status: 'CANCELLED' },
        });

        if (chatId && game.telegramMessageId) {
          try {
            await updateGameMessage(
              bot,
              chatId,
              parseInt(game.telegramMessageId, 10),
              { ...game, status: 'CANCELLED' },
            );
          } catch (err) {
            console.error(`Failed to update message for game ${game.id}:`, err);
          }
        }
      }

      if (expiredGames.length > 0) {
        console.log(`Scheduler: cancelled ${expiredGames.length} expired game(s)`);
      }
    } catch (err) {
      console.error('Scheduler error:', err);
    }
  });

  console.log('Scheduler started: checking expired games every 5 minutes');
}
