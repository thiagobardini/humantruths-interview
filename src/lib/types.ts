/**
 * Centralized type definitions
 */

// Re-export database types
export type { Interview, NewInterview } from '@/db/schema'

// Re-export Zod-inferred types
export type { TranscriptMessage, RetellWebhookPayload } from '@/lib/validations/retell'
