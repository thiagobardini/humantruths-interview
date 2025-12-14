'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  label: string
  size?: 'sm' | 'md'
}

export function CopyButton({ text, label, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-muted rounded transition-colors"
      title={`${label}: ${text}`}
    >
      {copied ? (
        <Check className={`${iconSize} text-emerald-500`} />
      ) : (
        <Copy className={`${iconSize} text-muted-foreground hover:text-foreground`} />
      )}
    </button>
  )
}
