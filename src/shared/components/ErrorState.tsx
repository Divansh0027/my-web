import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorState({
  title = 'Oops! Something went wrong',
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-500/5 border border-red-500/20 rounded-2xl w-full h-full min-h-[300px]">
      <div className="h-16 w-16 mb-4 text-red-600 flex items-center justify-center rounded-full bg-red-500/10">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h2 className="text-lg font-semibold text-on-surface mb-2">{title}</h2>
      <p className="text-sm text-on-surface-variant max-w-sm mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
      )}
    </div>
  )
}
