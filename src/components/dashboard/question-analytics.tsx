import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { TranscriptMessage } from '@/lib/types'

interface QuestionData {
  question: string
  responses: { content: string; interviewId: number }[]
}

interface QuestionAnalyticsProps {
  transcripts: (TranscriptMessage[] | null)[]
}

// Extract questions from transcripts (agent messages that contain ?)
function extractQuestionsFromTranscripts(
  transcripts: (TranscriptMessage[] | null)[]
): QuestionData[] {
  const questionMap = new Map<string, QuestionData>()

  transcripts.forEach((transcript, interviewIndex) => {
    if (!transcript) return

    transcript.forEach((msg, msgIndex) => {
      // Find agent questions (messages containing ?)
      if (msg.role === 'agent' && msg.content.includes('?')) {
        const question = msg.content.trim()

        // Get the next user response if exists
        const nextMsg = transcript[msgIndex + 1]
        const response = nextMsg?.role === 'user' ? nextMsg.content : null

        if (!questionMap.has(question)) {
          questionMap.set(question, { question, responses: [] })
        }

        if (response) {
          questionMap.get(question)!.responses.push({
            content: response,
            interviewId: interviewIndex,
          })
        }
      }
    })
  })

  return Array.from(questionMap.values())
    .filter(q => q.responses.length > 0)
    .sort((a, b) => b.responses.length - a.responses.length)
}

export function QuestionAnalytics({ transcripts }: QuestionAnalyticsProps) {
  const questionAnalytics = extractQuestionsFromTranscripts(transcripts)

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Question Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {questionAnalytics.length === 0 ? (
          <p className="text-muted-foreground">No questions analyzed yet.</p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-6">
              {questionAnalytics.map((qa, index) => {
                const avgLength = Math.round(
                  qa.responses.reduce((sum, r) => sum + r.content.length, 0) / qa.responses.length
                )
                const recentResponses = qa.responses.slice(-3)

                return (
                  <div key={index} className="border-b pb-4 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <p className="font-medium text-sm">{qa.question}</p>
                      <div className="flex gap-2 shrink-0">
                        <Badge variant="secondary">
                          {qa.responses.length} responses
                        </Badge>
                        <Badge variant="outline">
                          ~{avgLength} chars avg
                        </Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        Recent Answers
                      </p>
                      {recentResponses.map((response, rIndex) => (
                        <div
                          key={rIndex}
                          className="bg-muted rounded-lg px-3 py-2 text-sm"
                        >
                          {response.content.length > 150
                            ? `${response.content.substring(0, 150)}...`
                            : response.content}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
