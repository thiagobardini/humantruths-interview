import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { Retell } from 'retell-sdk'
import { eq, count } from 'drizzle-orm'
import { db } from '@/db'
import { interviews } from '@/db/schema'
import { RetellWebhookSchema } from '@/lib/validations/retell'

/**
 * Retell AI Webhook Endpoint
 *
 * This endpoint receives webhook events from Retell AI after voice calls.
 * It processes 3 event types: call_started, call_ended, call_analyzed
 *
 * Security: Uses HMAC signature validation via Retell SDK
 * Docs: https://docs.retellai.com/features/webhook-overview
 */

/**
 * Validates the webhook signature using Retell SDK
 * This ensures the request is from Retell and hasn't been tampered with
 *
 * @param request - The incoming request with x-retell-signature header
 * @param body - The raw request body string
 * @returns boolean - True if signature is valid
 */
function validateSignature(request: NextRequest, body: string): boolean {
  const signature = request.headers.get('x-retell-signature')
  if (!signature) return false

  const apiKey = process.env.RETELL_API_KEY
  if (!apiKey) return false

  return Retell.verify(body, apiKey, signature)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    console.log('📥 Webhook received')

    // 1. Validate signature using Retell SDK
    const isValid = validateSignature(request, body)
    console.log('🔐 Signature valid:', isValid)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    // 2. Parse and validate payload with Zod
    const json = JSON.parse(body)
    const result = RetellWebhookSchema.safeParse(json)
    console.log('📋 Zod validation:', result.success)

    if (!result.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { event, call } = result.data

    // Only process call_ended and call_analyzed events
    if (event === 'call_started') {
      return NextResponse.json({ message: 'Received' }, { status: 200 })
    }

    // 3. Calculate duration from timestamps
    const duration =
      call.start_timestamp && call.end_timestamp
        ? call.end_timestamp - call.start_timestamp
        : call.duration_ms ?? 0

    // 4. Save to database with Drizzle (check then insert/update)
    const existing = await db
      .select()
      .from(interviews)
      .where(eq(interviews.callId, call.call_id))
      .limit(1)

    const transcript = call.transcript_object?.map((msg) => ({
      role: msg.role,
      content: msg.content,
    })) ?? []

    const completionStatus = call.call_analysis?.call_successful
      ? 'completed'
      : call.disconnection_reason ?? 'ended'

    if (existing.length > 0) {
      await db
        .update(interviews)
        .set({
          transcript,
          duration,
          completionStatus,
        })
        .where(eq(interviews.callId, call.call_id))
    } else {
      // Generate sequential participant ID if not provided
      // In production, this would come from user authentication
      const [{ value }] = await db.select({ value: count() }).from(interviews)
      const generatedId = `participant-${value + 1}`

      await db.insert(interviews).values({
        callId: call.call_id,
        participantId: (call.metadata?.participant_id as string) ?? generatedId,
        transcript,
        duration,
        completionStatus,
      })
    }

    console.log(`✅ Interview saved: ${call.call_id}`)

    // Revalidate dashboard to show fresh data
    revalidatePath('/dashboard')

    return NextResponse.json({ message: 'Success' }, { status: 200 })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
