import { createHmac } from 'crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    telegramUser: TelegramUser;
  }
}

function validateInitData(initData: string, botToken: string): TelegramUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash) return null;

  params.delete('hash');

  const entries = Array.from(params.entries());
  entries.sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (computedHash !== hash) return null;

  const userRaw = params.get('user');
  if (!userRaw) return null;

  try {
    return JSON.parse(userRaw) as TelegramUser;
  } catch {
    return null;
  }
}

export async function telegramAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('tma ')) {
    reply.code(401).send({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const initData = authHeader.slice(4);
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    reply.code(500).send({ error: 'BOT_TOKEN is not configured' });
    return;
  }

  const user = validateInitData(initData, botToken);
  if (!user) {
    reply.code(401).send({ error: 'Invalid Telegram initData' });
    return;
  }

  request.telegramUser = user;
}
