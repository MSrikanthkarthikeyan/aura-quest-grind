
import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface LoadingWrapperProps {
  isLoading: boolean;
  error?: Error | null;
  timeout?: number;
  onRetry?: () => void;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  error,
  timeout = 5000,
  onRetry,
  fallback,
  children
}) => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowTimeout(false);
      return;
    }

    const timer = setTimeout(() => {
      if (isLoading) {
        setShowTimeout(true);
      }
    }, timeout);

    return () => clearTimeout(timer);
  }, [isLoading, timeout]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
          <h2 className="text-2xl font-bold mb-2 text-red-400">Something went wrong</h2>
          <p className="text-gray-300 mb-6">{error.message || 'An unexpected error occurred'}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <RefreshCw size={20} />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  if (isLoading) {
    if (showTimeout) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center p-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-500 mb-6"></div>
            <h2 className="text-2xl font-bold mb-2 text-yellow-400">Taking longer than expected...</h2>
            <p className="text-gray-300 mb-6">Your dungeon is loading. This might take a moment.</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="bg-gradient-to-r from-yellow-600 to-orange-600 px-6 py-3 rounded-lg font-semibold hover:shadow-lg hover:shadow-yellow-500/25 transition-all duration-300 flex items-center space-x-2 mx-auto"
              >
                <RefreshCw size={20} />
                <span>Retry Loading</span>
              </button>
            )}
          </div>
        </div>
      );
    }

    return fallback || (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-xl text-purple-300">Loading your dungeon...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;
