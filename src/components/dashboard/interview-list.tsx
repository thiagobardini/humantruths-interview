'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { FilterButtons, type FilterOption } from '@/components/ui/filter-buttons'
import { CopyButton } from '@/components/ui/copy-button'
import type { Interview } from '@/lib/types'

interface InterviewListProps {
  interviews: Interview[]
}

type FilterType = 'all' | 'woman' | 'not-woman'

const FILTER_OPTIONS: FilterOption<FilterType>[] = [
  { value: 'all', label: 'All' },
  { value: 'woman', label: 'Woman' },
  { value: 'not-woman', label: 'Not woman' },
]

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function InterviewList({ interviews }: InterviewListProps) {
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredInterviews = interviews.filter((interview) => {
    if (filter === 'all') return true
    const isWoman = interview.extractedVariables?.is_woman
    if (filter === 'woman') return isWoman === true
    if (filter === 'not-woman') return isWoman === false
    return true
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Interviews</CardTitle>
        <FilterButtons options={FILTER_OPTIONS} value={filter} onChange={setFilter} />
      </CardHeader>
      <CardContent>
        {filteredInterviews.length === 0 ? (
          <p className="text-muted-foreground">
            {filter === 'all' ? 'No interviews yet.' : 'No interviews match this filter.'}
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {filteredInterviews.map((interview) => {
                const vars = interview.extractedVariables
                const isWoman = vars?.is_woman
                const favoriteFood = vars?.favorite_food
                const foodReason = vars?.food_reason

                return (
                  <Link
                    key={interview.id}
                    href={`/interview/${interview.callId}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                      {/* Left side */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {/* Participant ID & Date */}
                        <div className="min-w-[110px]" title={`Participant: ${interview.participantId || 'Unknown'}`}>
                          <p className="font-medium text-sm">
                            {interview.participantId || 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground" title={`Date: ${formatDate(interview.createdAt)}`}>
                            {formatDate(interview.createdAt)}
                          </p>
                        </div>

                        {/* Woman badge */}
                        {isWoman !== undefined && (
                          <Badge
                            variant={isWoman ? 'default' : 'secondary'}
                            className="shrink-0"
                            title={`Are you a woman? ${isWoman ? 'Yes' : 'No'}`}
                          >
                            {isWoman ? 'Woman' : 'Not woman'}
                          </Badge>
                        )}

                        {/* Favorite food & reason */}
                        {favoriteFood && (
                          <div className="min-w-0 flex-1">
                            <p
                              className="text-sm capitalize truncate"
                              title={`Favorite food: ${favoriteFood}`}
                            >
                              {favoriteFood}
                            </p>
                            {foodReason && (
                              <p
                                className="text-xs text-muted-foreground truncate"
                                title={`Why: ${foodReason}`}
                              >
                                {foodReason}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Right side */}
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span
                          className="text-xs text-muted-foreground"
                          title={`Duration: ${Math.round(interview.duration / 1000)} seconds`}
                        >
                          {Math.round(interview.duration / 1000)}s
                        </span>
                        <CopyButton text={interview.callId} label="Call ID" />
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
