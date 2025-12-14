import { db } from '@/db'
import { interviews } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import {
  BackButton,
  StatusBadge,
  TranscriptView,
  InterviewSummaryCard,
} from '@/components/interview'
import { formatDuration, formatDate, formatTime } from '@/lib/utils/format'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ callId: string }>
}

export default async function InterviewDetailPage({ params }: PageProps) {
  const { callId } = await params

  const [interview] = await db
    .select()
    .from(interviews)
    .where(eq(interviews.callId, callId))
    .limit(1)

  if (!interview) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <BackButton href="/dashboard" label="Back to Dashboard" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Interview Details</h1>
            <StatusBadge status={interview.completionStatus} />
          </div>
        </div>

        {/* Summary Card - Metadata + Extracted Variables */}
        <InterviewSummaryCard
          participantId={interview.participantId}
          duration={formatDuration(interview.duration)}
          date={formatDate(interview.createdAt)}
          time={formatTime(interview.createdAt)}
          callId={interview.callId}
          extractedVariables={interview.extractedVariables}
        />

        {/* Transcript */}
        <TranscriptView messages={interview.transcript} />
      </div>
    </div>
  )
}
