import { Bot, InlineKeyboard } from 'grammy';

interface Participant {
  user: {
    telegramId: bigint;
    firstName: string;
    lastName: string | null;
    username: string | null;
  };
}

interface GameWithDetails {
  id: number;
  scheduledAt: Date;
  location: string;
  courtCost: number;
  maxPlayers: number;
  status: string;
  telegramMessageId: string | null;
  participants: Participant[];
  creator: {
    telegramId: bigint;
    firstName: string;
    lastName: string | null;
    username: string | null;
  };
}

const STATUS_LABELS: Record<string, string> = {
  RECRUITING: '🟢 Набор участников',
  TEAM_READY: '✅ Команда собрана',
  COMPLETED: '🏆 Игра состоялась',
  CANCELLED: '❌ Игра не состоялась',
};

export function formatGameMessage(game: GameWithDetails): string {
  const scheduledAt = game.scheduledAt instanceof Date ? game.scheduledAt : new Date(game.scheduledAt);
  const date = scheduledAt.toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  });
  const time = scheduledAt.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const costPerPerson = Math.ceil(game.courtCost / game.maxPlayers);
  const status = STATUS_LABELS[game.status] ?? game.status;

  const participantsList = game.participants
    .map((p, i) => {
      const name = p.user.username ? `@${p.user.username}` : p.user.firstName;
      return `  ${i + 1}. ${name}`;
    })
    .join('\n');

  const lines = [
    `🎾 <b>Падел</b>`,
    ``,
    `📅 ${date}, ${time}`,
    `📍 ${game.location}`,
    `💰 Корт: ${game.courtCost}₽ (${costPerPerson}₽/чел)`,
    `👥 Игроки: ${game.participants.length}/${game.maxPlayers}`,
    participantsList || '  —',
    ``,
    status,
  ];

  return lines.join('\n');
}

function getMiniAppKeyboard(): InlineKeyboard {
  const miniAppUrl = process.env.MINI_APP_URL;
  if (!miniAppUrl) return new InlineKeyboard();
  return new InlineKeyboard().webApp('Открыть', miniAppUrl);
}

export async function sendGameMessage(
  bot: Bot,
  chatId: string,
  game: GameWithDetails,
): Promise<number> {
  const text = formatGameMessage(game);
  const result = await bot.api.sendMessage(chatId, text, {
    parse_mode: 'HTML',
    reply_markup: getMiniAppKeyboard(),
  });
  return result.message_id;
}

export async function updateGameMessage(
  bot: Bot,
  chatId: string,
  messageId: number,
  game: GameWithDetails,
): Promise<void> {
  const text = formatGameMessage(game);
  await bot.api.editMessageText(chatId, messageId, text, {
    parse_mode: 'HTML',
    reply_markup: getMiniAppKeyboard(),
  });
}
