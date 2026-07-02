
export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden flex flex-col h-[400px] animate-pulse">
      {/* Image Skeleton */}
      <div className="relative h-56 w-full bg-white/5" />
      
      {/* Content Skeleton */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title */}
        <div className="h-6 bg-white/10 rounded w-3/4 mb-4" />
        
        {/* Locality */}
        <div className="flex items-center space-x-2 mb-4">
          <div className="w-4 h-4 bg-white/10 rounded-full" />
          <div className="h-4 bg-white/10 rounded w-1/2" />
        </div>
        
        <div className="flex-1" />
        
        {/* Bottom Bar: Features and Price */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
          <div className="flex space-x-4">
            <div className="h-4 bg-white/10 rounded w-12" />
            <div className="h-4 bg-white/10 rounded w-12" />
          </div>
          <div className="h-6 bg-white/10 rounded w-20" />
        </div>
      </div>
    </div>
  );
}
