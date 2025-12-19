# Claude Agent - Voice AI Analytics

## Projeto
Voice AI webhook receiver com analytics dashboard. Usa Next.js e Retell AI para receber webhooks, armazenar dados de conversas e exibir analytics no Supabase PostgreSQL.

## Tech Stack
- Next.js 16 (App Router, Server Components)
- React 19, TypeScript strict
- Drizzle ORM, Supabase PostgreSQL
- Zod validation
- Retell AI SDK
- Tailwind CSS v4, shadcn/ui

## Estrutura de Arquivos Principais

```
src/
├── app/
│   ├── api/webhooks/retell/route.ts   # Webhook handler (128 linhas)
│   ├── dashboard/page.tsx              # Dashboard Server Component
│   └── interview/[callId]/page.tsx     # Detalhe da chamada
├── db/
│   ├── index.ts                        # Conexão Drizzle
│   └── schema.ts                       # Schema: interviews table
├── lib/
│   ├── validations/retell.ts           # Zod schemas
│   └── types.ts                        # Re-exports de tipos
└── components/
    ├── dashboard/                      # Componentes do dashboard
    └── interview/                      # Componentes de chamada
```

## Arquivos Chave com Linhas

| Arquivo | Linhas Importantes |
|---------|-------------------|
| `src/app/api/webhooks/retell/route.ts` | :27-35 HMAC validation, :52 Zod parse, :92-116 upsert, :121 revalidatePath |
| `src/db/schema.ts` | :4-11 ExtractedVariables type, :13-22 pgTable, :17-18 JSON columns, :24-25 $inferSelect/$inferInsert |
| `src/lib/validations/retell.ts` | :15 transform boolean, :14-20 ExtractedVariablesSchema, :43-46 RetellWebhookSchema |
| `src/app/dashboard/page.tsx` | :11 force-dynamic, :14 query, :16-23 métricas |
| `src/app/interview/[callId]/page.tsx` | :13 force-dynamic, :22-26 query, :28-30 notFound |

## Fluxo de Dados

```
Voice Call → Retell AI → Webhook POST → Zod Validation → Drizzle Upsert → Dashboard
```

1. Usuário faz chamada de voz
2. Retell AI conduz conversa e extrai variáveis
3. Retell envia webhook (call_started, call_ended, call_analyzed)
4. Webhook valida HMAC signature com `Retell.verify()`
5. Zod valida e transforma payload (is_woman: "true" → boolean)
6. Drizzle faz upsert no PostgreSQL
7. `revalidatePath('/dashboard')` invalida cache
8. Dashboard exibe dados atualizados

## Database Schema

```typescript
// src/db/schema.ts
interviews: {
  id: text (UUID)
  callId: text (unique)
  participantId: text
  transcript: json (array de mensagens)
  extractedVariables: json (is_woman, favorite_food, food_reason)
  duration: integer (milliseconds)
  completionStatus: text
  createdAt: timestamp
}
```

## Tipos Importantes

```typescript
// Interview - para LEITURA (select)
type Interview = typeof interviews.$inferSelect

// NewInterview - para ESCRITA (insert)
type NewInterview = typeof interviews.$inferInsert

// ExtractedVariables - dados extraídos da conversa
type ExtractedVariables = {
  is_woman: boolean
  favorite_food?: string
  food_reason?: string
}
```

## Padrões do Projeto

### Onde Colocar Cada Coisa

| O que | Onde | Exemplo |
|-------|------|---------|
| Schema do banco (Drizzle) | `src/db/schema.ts` | `pgTable`, `$inferSelect`, `$inferInsert` |
| Tipos TypeScript (DB) | `src/db/schema.ts` | `ExtractedVariables`, `Interview`, `NewInterview` |
| Schemas Zod (validação API) | `src/lib/validations/` | `RetellWebhookSchema`, `InterviewSchema` |
| Tipos inferidos do Zod | `src/lib/validations/` | `z.infer<typeof Schema>` junto ao schema |
| Re-exports centralizados | `src/lib/types.ts` | Barrel file para imports |
| API Routes | `src/app/api/` | `route.ts` com handlers POST, GET, etc. |

### Padrão de Organização de Tipos

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ORIGEM DOS TIPOS                        │  BARREL FILE (types.ts)          │
├─────────────────────────────────────────────────────────────────────────────┤
│  src/db/schema.ts                        │                                  │
│  ├── Interview ($inferSelect)            │  export type { Interview,        │
│  ├── NewInterview ($inferInsert)    ────►│    NewInterview,                 │
│  └── ExtractedVariables                  │    ExtractedVariables }          │
│                                          │                                  │
│  src/lib/validations/retell.ts           │                                  │
│  ├── RetellWebhookSchema                 │  export type { RetellWebhookPayload, │
│  │   └── z.infer = RetellWebhookPayload ─┼──► TranscriptMessage,            │
│  ├── InterviewSchema                     │    InterviewInput,               │
│  │   └── z.infer = InterviewInput   ─────┼──► FormData }                    │
│  └── FormDataSchema                      │                                  │
│      └── z.infer = FormData         ─────┘                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Regras:**
1. Schemas Zod **ficam** em `src/lib/validations/` (onde validação acontece)
2. Tipos `z.infer<>` são exportados **junto ao schema** no mesmo arquivo
3. `src/lib/types.ts` é apenas um **barrel file** que re-exporta para imports centralizados
4. **NUNCA** mover schemas Zod para `types.ts` - apenas os tipos inferidos são re-exportados

**Como importar:**
```typescript
// Opção 1: Import centralizado (recomendado)
import { Interview, InterviewInput } from '@/lib/types'

// Opção 2: Import direto (quando precisa do schema)
import { InterviewSchema } from '@/lib/validations/retell'
```

### Drizzle vs Zod - Quando Usar Cada Um

```
┌─────────────────────────────────────────────────────────────────┐
│  DRIZZLE (src/db/schema.ts)          │  ZOD (src/lib/validations/)  │
├─────────────────────────────────────────────────────────────────┤
│  - Define estrutura do BANCO         │  - Valida dados da API       │
│  - Tipos para SELECT/INSERT          │  - Transforma dados          │
│  - $inferSelect = tipo de leitura    │  - Runtime validation        │
│  - $inferInsert = tipo de escrita    │  - safeParse/parse           │
│  - NÃO valida em runtime             │  - .transform(), .optional() │
└─────────────────────────────────────────────────────────────────┘
```

**Regra:** Para APIs que recebem dados externos, SEMPRE use Zod para validar em runtime.
O tipo `NewInterview` do Drizzle só valida em compile time (TypeScript).

### Padrão para Criar Nova API Route

**Step 1:** Criar schema Zod em `src/lib/validations/[nome].ts`
```typescript
// src/lib/validations/interview.ts
import { z } from 'zod'

export const CreateInterviewSchema = z.object({
  callId: z.string().min(1),
  participantId: z.string().optional(),
  duration: z.number().default(0),
  // ... campos
})

export type CreateInterviewInput = z.infer<typeof CreateInterviewSchema>
```

**Step 2:** Usar no route handler
```typescript
// src/app/api/interviews/route.ts
import { CreateInterviewSchema } from '@/lib/validations/interview'
import { type NewInterview } from '@/db/schema'

export async function POST(request: Request) {
  const body = await request.json()

  // Zod valida em RUNTIME (dados externos)
  const result = CreateInterviewSchema.safeParse(body)
  if (!result.success) return NextResponse.json({ error: 'Invalid' }, { status: 400 })

  // NewInterview garante tipo correto em COMPILE TIME
  const data: NewInterview = {
    callId: result.data.callId,
    // ...
  }

  await db.insert(interviews).values(data)
}
```

### Webhook Handler
- Validação HMAC real (não mock) em `route.ts:27-35`
- Zod safeParse para validação em `route.ts:52`
- Upsert pattern (idempotente) em `route.ts:92-116`
- revalidatePath para cache em `route.ts:121`

### Server Components
- `export const dynamic = 'force-dynamic'`
- Query direto no banco com Drizzle
- Sem API routes para leitura (Server Component faz query direto)

### Validação
- Zod para runtime validation (dados externos)
- `.transform()` para conversão de tipos (ex: "true" → boolean)
- `.passthrough()` para campos extras dinâmicos
- `.safeParse()` retorna `{ success, data, error }` sem throw

## Retell AI - Integração Completa

### O que é Retell AI
Plataforma de Voice AI que permite criar agentes de voz. Neste projeto:
- Agente conduz conversas por voz
- Extrai variáveis estruturadas da conversa
- Envia dados via webhook quando chamada termina

### SDK e Pacotes

```bash
# Backend - criar chamadas, verificar webhook
npm install retell-sdk

# Frontend - iniciar chamada no browser
npm install retell-client-js-sdk
```

### Inicialização do SDK

```typescript
import Retell from 'retell-sdk'

const retell = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
})
```

### Métodos Principais do SDK

| Método | O que faz | Retorna |
|--------|-----------|---------|
| `retell.call.createWebCall({ agent_id })` | Cria chamada para browser | `{ access_token, call_id }` |
| `retell.call.createPhoneCall({ from_number, to_number, agent_id })` | Faz ligação telefônica | `{ call_id, call_status }` |
| `retell.call.retrieve(callId)` | Busca detalhes da chamada | Call details + transcript |
| `retell.call.list({ limit, agent_id })` | Lista chamadas | Array de calls |
| `Retell.verify(body, apiKey, signature)` | Valida webhook HMAC | `boolean` |

### Webhook - Eventos e Payload

**Eventos:**
- `call_started` - Chamada iniciou (só acknowledge)
- `call_ended` - Chamada terminou (tem transcript)
- `call_analyzed` - Análise concluída (tem extracted variables)

**Payload importante:**
```typescript
{
  event: 'call_ended' | 'call_analyzed',
  call: {
    call_id: string,
    start_timestamp: number,
    end_timestamp: number,
    transcript_object: Array<{ role: 'agent' | 'user', content: string }>,
    collected_dynamic_variables: {  // ← Variáveis extraídas pelo Conversation Flow
      is_woman: 'true' | 'false',   // ⚠️ É STRING, não boolean!
      favorite_food: string,
      food_reason: string,
    }
  }
}
```

### Conversation Flow vs Single Prompt

Este projeto usa **Conversation Flow** (configurado no Retell Dashboard):
- Nodes = blocos de conversa
- Transitions = caminhos condicionais
- Extract Variables = captura dados em pontos específicos

**Por que Conversation Flow:**
- Extração estruturada de dados
- Branching baseado em respostas
- Dados previsíveis (não precisa fazer parsing de texto livre)

### Implementação de Web Call

**Step 1:** API Route - `src/app/api/retell/web-call/route.ts`
```typescript
import Retell from 'retell-sdk'
import { NextResponse } from 'next/server'

const retell = new Retell({ apiKey: process.env.RETELL_API_KEY! })

export async function POST(request: Request) {
  const body = await request.json()

  const response = await retell.call.createWebCall({
    agent_id: process.env.RETELL_AGENT_ID!,
    metadata: { user_id: body.userId },
  })

  return NextResponse.json({
    access_token: response.access_token,
    call_id: response.call_id,
  })
}
```

**Step 2:** Frontend Component
```typescript
'use client'
import { RetellWebClient } from 'retell-client-js-sdk'

const client = new RetellWebClient()

// Buscar token da API
const { access_token } = await fetch('/api/retell/web-call', { method: 'POST' }).then(r => r.json())

// Iniciar chamada
await client.startCall({ accessToken: access_token })

// Eventos
client.on('call_started', () => console.log('Started'))
client.on('call_ended', () => console.log('Ended'))
```

### Implementação de Phone Call

```typescript
// src/app/api/retell/phone-call/route.ts
const response = await retell.call.createPhoneCall({
  from_number: process.env.RETELL_PHONE_NUMBER!, // Registrado no Retell
  to_number: body.toNumber,
  agent_id: process.env.RETELL_AGENT_ID!,
  metadata: { participant_id: body.participantId },
})
```

### Validação do Webhook (já implementado)

```typescript
// src/app/api/webhooks/retell/route.ts:27-35
function validateSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get('x-retell-signature')
  if (!signature) return false

  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) return false

  return Retell.verify(body, apiKey, signature)  // ← HMAC-SHA256
}
```

### Transform do Boolean (importante!)

Retell envia `is_woman` como STRING `"true"` ou `"false"`, não boolean.
O Zod transforma em `src/lib/validations/retell.ts:15`:

```typescript
is_woman: z.enum(['true', 'false']).transform((val) => val === 'true')
// Input: "true" (string) → Output: true (boolean)
```

### Environment Variables para Retell

```env
RETELL_API_KEY="key_xxxxxxxx"
RETELL_AGENT_ID="agent_xxxxxxxx"        # Opcional - para criar chamadas
RETELL_PHONE_NUMBER="+1234567890"       # Opcional - para phone calls
```

### Documentação Oficial

- Webhook: https://docs.retellai.com/features/webhook-overview
- Web Call: https://docs.retellai.com/api-references/create-web-call
- Phone Call: https://docs.retellai.com/api-references/create-phone-call
- SDK GitHub: https://github.com/RetellAI/retell-typescript-sdk

---

## URLs de Produção

- App: https://your-domain.vercel.app/
- Dashboard: https://your-domain.vercel.app/dashboard
- Webhook: https://your-domain.vercel.app/api/webhooks/retell

## Comandos

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema to DB
npm run db:studio    # Open Drizzle Studio
```

## Environment Variables

```
DATABASE_URL
DATABASE_POSTGRES_URL_NON_POOLING
RETELL_API_KEY
```

## Documentação Adicional

Para mais informações sobre configuração do agente Retell AI, consulte:
- [Retell AI Documentation](https://docs.retellai.com/)
- [Conversation Flow Guide](https://docs.retellai.com/build/conversation-flow)
- [Extract Dynamic Variables](https://docs.retellai.com/build/single-multi-prompt/extract-dv)

## Regras para Respostas

1. **SEMPRE** incluir `arquivo:linha` ao mencionar código
2. **SEMPRE** usar steps numerados para implementação
3. Respostas curtas e diretas
4. Termos técnicos em inglês
5. Estrutura: O QUE → COMO → POR QUÊ
