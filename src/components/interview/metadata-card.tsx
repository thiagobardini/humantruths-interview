import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MetadataItem {
  label: string
  value: string | React.ReactNode
}

interface MetadataCardProps {
  items: MetadataItem[]
}

export function MetadataCard({ items }: MetadataCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Metadata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {item.label}
              </p>
              <div className="text-sm">{item.value}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
