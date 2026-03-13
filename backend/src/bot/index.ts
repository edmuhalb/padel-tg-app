import { Bot, InlineKeyboard } from 'grammy';

const token = process.env.BOT_TOKEN;
if (!token) throw new Error('BOT_TOKEN is not set');

export const bot = new Bot(token);

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

bot.command('chatid', async (ctx) => {
  await ctx.reply(`Chat ID: <code>${ctx.chat.id}</code>`, { parse_mode: 'HTML' });
});
