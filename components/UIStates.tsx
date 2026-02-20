import React from 'react';

export const LoadingSkeleton: React.FC = () => (
  <div className="w-full animate-pulse space-y-4 p-4">
    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded"></div>
      <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
    </div>
  </div>
);

export const EmptyState: React.FC<{ message: string; icon?: string }> = ({ message, icon = 'inbox' }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center opacity-60">
    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
      <span className="material-symbols-outlined text-3xl text-slate-400">{icon}</span>
    </div>
    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">{message}</p>
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl flex items-center gap-3">
    <span className="material-symbols-outlined text-red-500">error</span>
    <div className="flex-1">
      <p className="text-sm font-bold text-red-600 dark:text-red-400">{message}</p>
    </div>
    {onRetry && (
      <button onClick={onRetry} className="text-xs font-bold uppercase text-red-700 hover:underline">
        Retry
      </button>
    )}
  </div>
);