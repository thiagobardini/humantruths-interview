import { desc } from 'drizzle-orm'
import { db } from '@/db'
import { interviews } from '@/db/schema'
import {
  MetricCard,
  QuestionAnalytics,
  InterviewList,
  RefreshButton,
} from '@/components/dashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const allInterviews = await db.select().from(interviews).orderBy(desc(interviews.createdAt))

  const totalInterviews = allInterviews.length
  const avgDuration = totalInterviews > 0
    ? Math.round(allInterviews.reduce((sum, i) => sum + i.duration, 0) / totalInterviews / 1000)
    : 0
  const completedCount = allInterviews.filter(i => i.completionStatus === 'completed').length
  const completionRate = totalInterviews > 0
    ? Math.round((completedCount / totalInterviews) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <RefreshButton />
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          <MetricCard title="Total Calls" value={totalInterviews} />
          <MetricCard title="Avg Duration" value={avgDuration} suffix="s" />
          <MetricCard title="Completion Rate" value={completionRate} suffix="%" />
        </div>

        {/* Question Analytics */}
        <QuestionAnalytics extractedVariables={allInterviews.map(i => i.extractedVariables)} />

        {/* Recent Calls */}
        <InterviewList interviews={allInterviews} />
      </div>
    </div>
  )
}
