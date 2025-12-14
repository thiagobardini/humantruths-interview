import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface BackButtonProps {
  href: string
  label?: string
}

export function BackButton({ href, label = 'Back' }: BackButtonProps) {
  return (
    <Link href={href}>
      <Button variant="ghost" size="sm" className="mb-4 -ml-2">
        ← {label}
      </Button>
    </Link>
  )
}
