import 'dotenv/config';
import './lib/prisma.js';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import { bot } from './bot/index.js';
import { gameRoutes } from './routes/games.js';
import { startScheduler } from './services/scheduler.js';
import { webhookCallback } from 'grammy';

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });
await app.register(gameRoutes);

app.post('/bot', webhookCallback(bot, 'fastify'));

startScheduler();

const port = parseInt(process.env.PORT || '3000', 10);

try {
  const address = await app.listen({ port, host: '0.0.0.0' });
  app.log.info(`Server listening at ${address}`);

  const webhookUrl = process.env.WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await bot.api.setWebhook(`${webhookUrl}/bot`);
      app.log.info(`Webhook set to ${webhookUrl}/bot`);
    } catch (e) {
      app.log.error(e, 'Failed to set webhook');
    }
  }
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export { bot };
