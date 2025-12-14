import { Badge } from '@/components/ui/badge'

interface StatusBadgeProps {
  status: string
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'completed': return 'default'
    case 'pending': return 'secondary'
    default: return 'outline'
  }
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={getStatusVariant(status)} className="w-fit">
      {status}
    </Badge>
  )
}
