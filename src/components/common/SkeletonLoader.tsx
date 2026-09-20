import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div
      role="status"
      aria-label="Loading view contents..."
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-pulse"
    >
      {/* Top Banner Skeleton */}
      <div className="h-36 rounded-xl bg-stone-900/60 border border-stone-800/60 p-6 flex flex-col justify-between">
        <div className="space-y-2">
          <div className="h-4 bg-stone-800 rounded w-1/4" />
          <div className="h-3 bg-stone-800/60 rounded w-1/2" />
        </div>
        <div className="h-8 bg-stone-800/40 rounded w-1/3" />
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 rounded-xl bg-stone-900/50 border border-stone-800/60 p-5 space-y-4">
          <div className="h-4 bg-stone-800 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-800/50 rounded w-full" />
            <div className="h-3 bg-stone-800/50 rounded w-4/5" />
            <div className="h-3 bg-stone-800/50 rounded w-2/3" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-stone-900/50 border border-stone-800/60 p-5 space-y-4">
          <div className="h-4 bg-stone-800 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-800/50 rounded w-full" />
            <div className="h-3 bg-stone-800/50 rounded w-3/4" />
          </div>
        </div>
        <div className="h-64 rounded-xl bg-stone-900/50 border border-stone-800/60 p-5 space-y-4">
          <div className="h-4 bg-stone-800 rounded w-1/3" />
          <div className="space-y-2">
            <div className="h-3 bg-stone-800/50 rounded w-full" />
            <div className="h-3 bg-stone-800/50 rounded w-4/5" />
          </div>
        </div>
      </div>
      <span className="sr-only">Loading content...</span>
    </div>
  );
};
