import React from 'react';
import { useStock } from '../contexts/StockContext';

interface HealthStripProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export const HealthStrip: React.FC<HealthStripProps> = ({ className = '', variant = 'full' }) => {
  const { queue, isOffline, toggleConnectivity, activeSession, conflicts } = useStock();
  const queueLength = queue.length;
  const hasError = queue.some(m => m.status === 'failed');

  // Truncate hash for UI
  const displayHash = activeSession?.snapshotHash 
    ? `${activeSession.snapshotHash.substring(0, 8)}...` 
    : 'NO_HASH';

  return (
    <div className={`flex gap-2 overflow-x-auto hide-scrollbar py-1 ${className}`}>
      {/* Normalized Connectivity Status */}
      <button 
        onClick={toggleConnectivity} 
        className={`flex flex-1 min-w-[90px] items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 border transition-all active:scale-95 ${
          isOffline 
            ? 'bg-slate-800 text-slate-200 border-slate-700' 
            : 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-100 dark:border-green-500/30'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">{isOffline ? 'cloud_off' : 'hub'}</span>
        <div className="flex flex-col leading-none text-left">
          <span className="text-[8px] font-bold opacity-70 uppercase tracking-widest">Link</span>
          <span className="text-[10px] font-bold">{isOffline ? 'OFFLINE' : 'TUNNEL'}</span>
        </div>
      </button>

      {/* Conflict Alert Badge */}
      {conflicts.length > 0 && (
        <div className="flex flex-1 min-w-[90px] items-center justify-center gap-1.5 rounded-lg bg-red-600 text-white py-1.5 px-2 border border-red-700 animate-pulse shadow-lg shadow-red-500/30">
          <span className="material-symbols-outlined text-[16px]">warning</span>
          <div className="flex flex-col leading-none">
            <span className="text-[8px] font-bold opacity-80 uppercase tracking-widest">Conflict</span>
            <span className="text-[10px] font-black">{conflicts.length} Items</span>
          </div>
        </div>
      )}

      {/* SQL Governance (ERP Truth) */}
      <div className="flex flex-1 min-w-[90px] items-center justify-center gap-1.5 rounded-lg bg-primary/5 dark:bg-slate-800/50 py-1.5 px-2 border border-primary/10 dark:border-slate-700/50">
        <span className="material-symbols-outlined text-[16px] text-primary dark:text-blue-400">gavel</span>
        <div className="flex flex-col leading-none">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SQL Mode</span>
          <span className="text-[10px] font-bold text-slate-900 dark:text-white">{isOffline ? 'CACHED' : 'LIVE'}</span>
        </div>
      </div>

      {/* Audit: Snapshot Hash Visibility */}
      <div className="flex flex-1 min-w-[110px] items-center justify-center gap-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/50 py-1.5 px-2 border border-slate-200 dark:border-slate-700/50">
        <span className="material-symbols-outlined text-[16px] text-slate-500">fingerprint</span>
        <div className="flex flex-col leading-none">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Snap-Hash</span>
          <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">{displayHash}</span>
        </div>
      </div>

      {/* Sync Queue */}
      <div className={`flex flex-1 min-w-[90px] items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 border transition-colors ${
        queueLength > 0 
          ? (hasError ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20') 
          : 'bg-primary/5 dark:bg-slate-800/50 border-primary/10 dark:border-slate-700/50'
      }`}>
        <span className="material-symbols-outlined text-[16px] text-slate-500 dark:text-slate-400">
            {hasError ? 'sync_problem' : (queueLength > 0 ? 'sync_alt' : 'cloud_done')}
        </span>
        <div className="flex flex-col leading-none">
          <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Queue</span>
          <span className={`text-[10px] font-bold ${queueLength > 0 ? (hasError ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400') : 'text-slate-900 dark:text-white'}`}>
            {queueLength} {variant === 'full' ? 'Items' : ''}
          </span>
        </div>
      </div>
    </div>
  );
};