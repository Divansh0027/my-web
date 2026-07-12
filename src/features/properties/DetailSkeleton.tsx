import React from 'react'

export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-6">
        <div className="space-y-3 w-full max-w-2xl">
          <div className="h-4 bg-outline-variant rounded w-32"></div>
          <div className="h-10 bg-outline-variant rounded w-3/4"></div>
          <div className="h-5 bg-outline-variant rounded w-1/2"></div>
        </div>
        <div className="h-10 bg-outline-variant rounded w-32"></div>
      </div>

      {/* Image Gallery Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 h-[60vh] min-h-[400px]">
        <div className="md:col-span-3 bg-outline-variant rounded-2xl h-full"></div>
        <div className="hidden md:flex flex-col gap-4 h-full">
          <div className="bg-outline-variant rounded-2xl h-1/2"></div>
          <div className="bg-outline-variant rounded-2xl h-1/2"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          {/* Key Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-outline-variant rounded-2xl"></div>
            ))}
          </div>
          {/* Description */}
          <div className="space-y-4">
            <div className="h-8 bg-outline-variant rounded w-48 mb-6"></div>
            <div className="h-4 bg-outline-variant rounded w-full"></div>
            <div className="h-4 bg-outline-variant rounded w-full"></div>
            <div className="h-4 bg-outline-variant rounded w-5/6"></div>
            <div className="h-4 bg-outline-variant rounded w-full"></div>
            <div className="h-4 bg-outline-variant rounded w-4/5"></div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="h-96 bg-outline-variant rounded-2xl"></div>
        </div>
      </div>
    </div>
  )
}
