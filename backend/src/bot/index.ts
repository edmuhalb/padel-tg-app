import { Bot, InlineKeyboard } from 'grammy';
import { setBotUsername } from './messages.js';

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN is not set');

export const bot = new Bot(token);

bot.api.getMe().then((me) => {
  setBotUsername(me.username);
}).catch(() => {});

bot.command('start', async (ctx) => {
  const miniAppUrl = process.env.MINI_APP_URL;
  if (!miniAppUrl) {
    await ctx.reply('Mini App URL не настроен.');
    return;
  }

  const keyboard = new InlineKeyboard().webApp('Открыть приложение', miniAppUrl);

  await ctx.reply('Привет! Я бот для организации игр в падел 🏸\nНажми кнопку ниже, чтобы открыть приложение.', {
    reply_markup: keyboard,
  });
});

bot.command('app', async (ctx) => {
  const keyboard = new InlineKeyboard().url(
    '🎾 Открыть Падел',
    `https://t.me/${ctx.me.username}/SberPadelClub`,
  );
  await ctx.reply('Нажмите кнопку, чтобы открыть приложение:', {
    reply_markup: keyboard,
  });
});

bot.command('chatid', async (ctx) => {
  await ctx.reply(`Chat ID: <code>${ctx.chat.id}</code>`, { parse_mode: 'HTML' });
});

bot.command('testmsg', async (ctx) => {
  const chatId = process.env.GROUP_CHAT_ID;
  if (!chatId) {
    await ctx.reply('GROUP_CHAT_ID не задан');
    return;
  }
  try {
    await ctx.api.sendMessage(chatId, '✅ Тестовое сообщение — бот работает!');
    await ctx.reply(`Сообщение отправлено в чат ${chatId}`);
  } catch (err: any) {
    await ctx.reply(`Ошибка: ${err.message}`);
  }
});
