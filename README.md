# Padel TG App

Telegram Mini App для организации игр в падел. Участники группы могут создавать игры, набирать команду и отслеживать статус.

## Стек

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Fastify + Prisma + grammy
- **БД**: PostgreSQL (Supabase)

## Быстрый старт

### Backend

```bash
cd backend
cp .env.example .env
# Заполните .env (BOT_TOKEN, DATABASE_URL, GROUP_CHAT_ID, MINI_APP_URL)
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

## Деплой

- Frontend → Vercel
- Backend → Render
- БД → Supabase (free tier)
