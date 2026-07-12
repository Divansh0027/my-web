import React from 'react'

interface TableSkeletonProps {
  columns?: number
  rows?: number
}

export function TableSkeleton({ columns = 5, rows = 10 }: TableSkeletonProps) {
  return (
    <div className="w-full bg-surface-container border border-outline-variant/50 rounded-2xl overflow-hidden animate-pulse">
      <div
        className="h-12 border-b border-outline-variant/50 bg-surface-container-high/30 grid"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="p-3">
            <div className="h-4 bg-outline-variant rounded w-1/2"></div>
          </div>
        ))}
      </div>
      <div className="divide-y divide-outline-variant/50">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-16 grid items-center"
            style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: columns }).map((_, j) => (
              <div key={j} className="p-3">
                <div className="h-4 bg-outline-variant rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
