# HumanTruths Interview Platform

Voice interview analytics dashboard with Retell AI integration.

## Tech Stack

- Next.js 15 (App Router)
- Drizzle ORM + Vercel Postgres
- shadcn/ui + Tailwind CSS
- Zod validation
- Retell AI SDK

## Setup

```bash
npm install
cp .env.example .env.local
```

Add your credentials to `.env.local`:
- `POSTGRES_URL` - Vercel Postgres connection string
- `RETELL_API_KEY` - Your Retell AI API key

## Development

```bash
npm run dev
```

## Database

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

## Retell Webhook

Configure in Retell dashboard:
```
POST https://your-domain.vercel.app/api/webhooks/retell
```

## Features

- Webhook receiver for Retell AI call events
- Interview analytics dashboard
- Interview detail with transcript view
