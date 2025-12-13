import { pgTable, text, integer, timestamp, json } from 'drizzle-orm/pg-core'

export const interviews = pgTable('interviews', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  callId: text('call_id').notNull().unique(),
  participantId: text('participant_id'),
  transcript: json('transcript').$type<{ role: string; content: string }[]>().default([]),
  duration: integer('duration').notNull().default(0), // milliseconds
  completionStatus: text('completion_status').notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export type Interview = typeof interviews.$inferSelect
export type NewInterview = typeof interviews.$inferInsert