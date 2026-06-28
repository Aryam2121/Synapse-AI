'use client'

import { cn } from '@/lib/utils'

interface DashboardPanelShellProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  actions?: React.ReactNode
}

/** Consistent layout wrapper for dashboard panels */
export function DashboardPanelShell({
  title,
  description,
  children,
  className,
  actions,
}: DashboardPanelShellProps) {
  return (
    <div className={cn('h-full overflow-auto custom-scrollbar', className)}>
      <div className="max-w-6xl mx-auto p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">{title}</h2>
            {description && (
              <p className="text-sm text-slate-400 mt-1 max-w-xl">{description}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
        {children}
      </div>
    </div>
  )
}
