'use client'

import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PanelLoadErrorProps {
  message: string
  onRetry?: () => void
}

export function PanelLoadError({ message, onRetry }: PanelLoadErrorProps) {
  return (
    <div className="mx-6 mt-4 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm">
      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="font-medium text-destructive">Could not load this page</p>
        <p className="text-muted-foreground mt-1">{message}</p>
        {onRetry && (
          <Button variant="outline" size="sm" className="mt-3" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
