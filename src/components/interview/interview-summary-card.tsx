'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'
import type { ExtractedVariables } from '@/lib/types'

interface InterviewSummaryCardProps {
  participantId: string | null
  duration: string
  date: string
  time: string
  callId: string
  extractedVariables: ExtractedVariables | null
}

export function InterviewSummaryCard({
  participantId,
  duration,
  date,
  time,
  callId,
  extractedVariables,
}: InterviewSummaryCardProps) {
  const vars = extractedVariables
  const isWoman = vars?.is_woman
  const favoriteFood = vars?.favorite_food
  const foodReason = vars?.food_reason

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Participant */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Participant</p>
            <p className="text-sm font-medium">{participantId || 'N/A'}</p>
          </div>

          {/* Date & Time */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Date</p>
            <p className="text-sm">
              {date} <span className="text-muted-foreground">{time}</span>
            </p>
          </div>

          {/* Duration */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Duration</p>
            <p className="text-sm font-medium">{duration}</p>
          </div>

          {/* Call ID */}
          <div>
            <p className="text-xs text-muted-foreground mb-1">Call ID</p>
            <div className="flex items-center gap-1">
              <p className="text-sm font-mono truncate max-w-[120px]">{callId}</p>
              <CopyButton text={callId} label="Copy Call ID" />
            </div>
          </div>
        </div>

        {/* Extracted Variables - only show if we have data */}
        {(isWoman !== undefined || favoriteFood) && (
          <>
            <div className="border-t my-4" />
            <div className="flex flex-wrap items-center gap-4">
              {isWoman !== undefined && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Gender:</span>
                  <Badge variant={isWoman ? 'default' : 'secondary'} className="text-xs">
                    {isWoman ? 'Woman' : 'Not woman'}
                  </Badge>
                </div>
              )}

              {favoriteFood && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Favorite food:</span>
                  <span className="text-sm font-medium capitalize">{favoriteFood}</span>
                </div>
              )}

              {foodReason && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Why:</span>
                  <span className="text-sm italic">&quot;{foodReason}&quot;</span>
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
