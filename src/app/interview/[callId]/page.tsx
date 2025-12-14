import { db } from '@/db'
import { interviews } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { BackButton, StatusBadge, MetadataCard, TranscriptView } from '@/components/interview'
import { formatDuration, formatDate, formatTime } from '@/lib/utils/format'

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

  const metadataItems = [
    { label: 'Call ID', value: <span className="font-mono break-all">{interview.callId}</span> },
    { label: 'Participant', value: interview.participantId || 'N/A' },
    { label: 'Duration', value: <span className="font-medium">{formatDuration(interview.duration)}</span> },
    {
      label: 'Date',
      value: (
        <>
          {formatDate(interview.createdAt)}
          <span className="text-muted-foreground ml-2">{formatTime(interview.createdAt)}</span>
        </>
      )
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <BackButton href="/dashboard" label="Back to Dashboard" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-2xl font-bold">Interview Details</h1>
            <StatusBadge status={interview.completionStatus} />
          </div>
        </div>

        <MetadataCard items={metadataItems} />
        <TranscriptView messages={interview.transcript} />
      </div>
    </div>
  )
}
