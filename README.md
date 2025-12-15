# HumanTruths Interview Platform

A mini voice interview platform that receives webhooks from Retell AI, stores interview data, and displays analytics.

**Live Demo:** https://humantruths-interview.vercel.app/

---

## Tech Stack

- **Next.js 16** (App Router, React 19, TypeScript strict mode)
- **Drizzle ORM** + Supabase Postgres - [Documentation](https://orm.drizzle.team/docs/get-started/supabase-new)
- **shadcn/ui** + Tailwind CSS v4
- **Zod** validation - [Documentation](https://zod.dev/?id=objects)
- **Retell AI** SDK with Conversation Flow

---

## Project Structure

```
src/
├── app/
│   ├── api/webhooks/retell/route.ts   → Webhook receiver
│   ├── dashboard/page.tsx              → Analytics dashboard
│   └── interview/[callId]/page.tsx     → Interview detail view
├── components/
│   ├── dashboard/                      → Dashboard components
│   ├── interview/                      → Interview detail components
│   └── ui/                             → Reusable UI components
├── db/
│   ├── schema.ts                       → Drizzle schema + types
│   └── index.ts                        → DB connection
├── lib/
│   ├── types.ts                        → Centralized type exports
│   ├── utils/                          → Utility functions
│   └── validations/retell.ts           → Zod schemas
docs/
├── retell/
│   ├── retell-integration.md           → Retell AI integration docs
│   └── retell-agent-config.json        → Agent configuration
└── ngrok-setup.md                      → ngrok local testing docs
```

---

## Step 1: Setup

```bash
npm install
cp .env.example .env
```

### Environment Variables

```env
# Database (Supabase Postgres)
DATABASE_URL="postgres://..."
DATABASE_POSTGRES_URL_NON_POOLING="postgres://..."

# Retell AI
RETELL_API_KEY="your_retell_api_key"
```

---

## Step 2: Vercel Deployment + Supabase

1. Connect your GitHub repo to Vercel
2. Connect Supabase integration in Vercel:
   - Vercel Dashboard → Your Project → Storage → Connect Database
   - Select Supabase → This auto-populates `DATABASE_POSTGRES_URL`
3. Add remaining environment variable:
   - `RETELL_API_KEY`
4. Deploy

### Supabase Dashboard

View data directly in:
- Supabase Dashboard → Table Editor → `interviews` table

---

## Step 3: Retell Agent Configuration

Create a Retell AI agent using **Conversation Flow** (not Single Prompt mode):

1. Go to [Retell Dashboard](https://dashboard.retellai.com/) → Agents → Create Agent
2. Select **Conversation Flow** as the agent type
3. Configure the interview flow with blocks:
   - **Greeting block** - Welcome message
   - **Question blocks** - Each interview question
   - **Goodbye block** - Thank you message
4. Enable **Extract Dynamic Variables** on each question block to capture responses
5. Register your webhook URL in Agent Settings

See [`docs/retell/retell-integration.md`](./docs/retell/retell-integration.md) for detailed configuration.

---

## Step 4: Database Schema

`src/db/schema.ts`

Simple schema with Drizzle:
- `callId` as unique identifier
- `participantId`
- `transcript` stored as JSON array
- `duration` in milliseconds
- `completionStatus`
- `timestamps`

Drizzle gives us type inference with `$inferSelect` and `$inferInsert` types.

```bash
npm run db:generate   # Generate migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Drizzle Studio
```

---

## Step 5: Zod Validation

`src/lib/validations/retell.ts`

The Zod schema matches Retell's nested structure:
- `event` type at the top level (`call_started`, `call_ended`, `call_analyzed`)
- `call` object with all the interview data
- `transcript_object` as an array of messages

---

## Step 6: Webhook Endpoint

`src/app/api/webhooks/retell/route.ts`

The webhook endpoint does 4 things:

1. **Validates signature** using Retell SDK (`Retell.verify()`) - real validation, not mock
2. **Parses and validates** payload with Zod
3. **Calculates duration** from timestamps (`end_timestamp - start_timestamp`)
4. **Saves to database** with Drizzle (check if exists, then insert or update)

### Retell Documentation References

- [Webhook Overview](https://docs.retellai.com/features/webhook-overview) - Webhook events and payload structure
- [Secure Webhook](https://docs.retellai.com/features/secure-webhook) - Signature validation
- [Register Webhook](https://docs.retellai.com/features/register-webhook) - Configure webhooks in dashboard

---

## Step 7: Dashboard

`src/app/dashboard/page.tsx`

The dashboard shows:
- **Total interviews** count
- **Average duration**
- **Completion rate**
- **Question-by-question analytics** - each question, response count, sample answers
- **Recent interviews list**

---

## Step 8: Interview Detail

`src/app/interview/[callId]/page.tsx`

The detail page shows:
- **Metadata** at the top (call ID, duration, status)
- **Complete transcript** formatted as conversation between agent and user

---

## Step 9: Development

```bash
npm run dev
```

### Local Testing with ngrok

```bash
# Terminal 1: Start Next.js
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Register in Retell dashboard:
# https://abc123.ngrok-free.app/api/webhooks/retell
```

### Production Webhook URL

```
POST https://humantruths-interview.vercel.app/api/webhooks/retell
```

### Vercel Logs

After a webhook is received, check logs in:
- Vercel Dashboard → Your Project → Logs
- Look for: `✅ Interview saved: [call_id]`

---

## Technical Decisions

1. **Drizzle ORM** - SQL-like API with great TypeScript support
2. **Real signature validation** - Using Retell SDK, not mocking
3. **Zod nested schema** - Matches Retell's actual payload structure
4. **Check then insert/update** - Check if exists first, then insert or update
5. **Server Components** - Dashboard and detail pages fetch data directly
6. **Reusable components** - Small, focused components with barrel exports

---

## Trade-offs & Assumptions

### Extract Dynamic Variables vs Transcript Parsing
Instead of parsing transcripts with regex/AI to extract answers, I used Retell's **Extract Dynamic Variables** feature. This gives us structured data (`is_woman`, `favorite_food`, `food_reason`) directly from the conversation flow.

**Why:** More reliable, no parsing errors, works regardless of how the user phrases their answer.

**Trade-off:** Requires using Conversation Flow with Blocks instead of Single Prompt mode.

See: [`docs/retell/retell-integration.md`](./docs/retell/retell-integration.md)

### JSON Column for Extracted Variables
Extracted variables are stored in a JSON column (`extracted_variables`) rather than separate columns.

**Why:** Flexible schema - can add new variables without migrations. Easy to extend for different interview types.

**Trade-off:** Can't query individual fields with SQL WHERE clauses. For production, consider adding a GIN index or separate columns for frequently queried fields.

### Server Components with force-dynamic
Dashboard and interview pages use Server Components with `force-dynamic` to always fetch fresh data.

**Why:** Simpler than client-side state management. No stale data issues.

**Trade-off:** Every page load hits the database. For high traffic, add caching or ISR.

### Manual Refresh vs Auto-Polling
Added a Refresh button instead of automatic polling.

**Why:** Data changes infrequently (when interviews complete). Polling wastes resources.

**Trade-off:** User must click to see new data. Could add Server-Sent Events for real-time updates in production.

### Sequential Participant IDs
Participant IDs are generated as `participant-1`, `participant-2`, etc. using `COUNT(*)`.

**Trade-off:** Theoretical race condition with concurrent requests. Acceptable for MVP.

**Production solution:** Use database sequences or UUID-based IDs.

### Real Signature Validation
The project spec suggested "mock validation," but I implemented **real signature validation** using the Retell SDK (`Retell.verify()`).

**Why:** More secure and production-ready. Same amount of code.

### Next.js 15 + React 19
Used Next.js 15 with React 19 instead of 14+ as specified.

**Why:** Latest stable version with improved performance. App Router API is the same.

---

## Features

- Webhook receiver for Retell AI call events
- Interview analytics dashboard
- Interview detail with transcript view
