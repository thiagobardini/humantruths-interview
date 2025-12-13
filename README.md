# HumanTruths Interview Platform

Voice interview analytics dashboard with Retell AI integration.

## Tech Stack

- **Next.js 16** (App Router)
- **Drizzle ORM** + Supabase Postgres
- **shadcn/ui** + Tailwind CSS
- **Zod** validation
- **Retell AI** SDK

## Setup

```bash
npm install
cp .env.example .env
```

## Environment Variables

```env
DATABASE_POSTGRES_URL=postgresql://...
RETELL_API_KEY=your_retell_api_key
```

## Development

```bash
npm run dev
```

## Database

```bash
npm run db:generate   # Generate migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Drizzle Studio
```

## Retell Webhook

Configure in Retell dashboard:
```
POST https://humantruths-interview.vercel.app/api/webhooks/retell
```

## Features

- Webhook receiver for Retell AI call events
- Interview analytics dashboard
- Interview detail with transcript view
