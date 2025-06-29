
import React from 'react';
import { Skeleton } from './skeleton';

export const DashboardSkeleton = () => (
  <div className="p-8 space-y-8">
    {/* Header skeleton */}
    <div className="text-center mb-8 space-y-4">
      <Skeleton className="h-8 w-64 mx-auto" />
      <Skeleton className="h-6 w-48 mx-auto" />
      <div className="flex justify-center space-x-2 mt-3">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
    </div>

    {/* Character overview skeleton */}
    <div className="bg-gradient-to-br from-gray-900/80 to-purple-900/40 rounded-2xl p-6 border border-purple-500/30">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex space-x-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
    </div>

    {/* Stats grid skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-900/40 to-gray-800/40 rounded-xl p-6 border border-gray-700/50">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>

    {/* Quests skeleton */}
    <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 rounded-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-64" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-6 w-12" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const QuestBoardSkeleton = () => (
  <div className="p-4 md:p-8 space-y-6">
    <div className="text-center mb-8">
      <Skeleton className="h-8 w-64 mx-auto mb-2" />
      <Skeleton className="h-5 w-48 mx-auto" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-xl p-4 md:p-6 border border-purple-500/30">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16" />
          </div>
          <Skeleton className="h-4 w-full mb-4" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const PomodoroSkeleton = () => (
  <div className="p-8 space-y-8">
    <div className="text-center">
      <Skeleton className="h-8 w-64 mx-auto mb-2" />
      <Skeleton className="h-5 w-48 mx-auto" />
    </div>
    
    <div className="max-w-2xl mx-auto">
      <div className="bg-gradient-to-br from-gray-900/90 to-purple-900/40 rounded-3xl p-12 border border-purple-500/30 text-center">
        <div className="mb-8 space-y-2">
          <Skeleton className="h-8 w-48 mx-auto" />
          <Skeleton className="h-5 w-32 mx-auto" />
        </div>
        
        <div className="w-80 h-80 mx-auto mb-8 rounded-full border-4 border-gray-700" />
        
        <div className="flex justify-center space-x-4">
          <Skeleton className="h-12 w-32" />
          <Skeleton className="h-12 w-24" />
        </div>
      </div>
    </div>
  </div>
);
