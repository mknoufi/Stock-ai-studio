import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import { useStock } from '../contexts/StockContext';
import { ErrorState } from '../components/UIStates';

const SessionSummary: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { activeSession, getMetrics, endSession, isLoading, error, clearError } = useStock();
    const metrics = getMetrics();

    const handleCommit = async () => {
        try {
            await endSession();
            showToast('Verification data committed to Operational DB', 'success');
            navigate('/staff/dashboard');
        } catch (e) {
            showToast('Failed to commit session', 'error');
        }
    };

    if (!activeSession) return <div>No Active Session</div>;

    return (
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100">
            {/* Header */}
             <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 py-4 flex items-center gap-3">
                 <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-800 dark:hover:text-white">
                     <span className="material-symbols-outlined">close</span>
                 </button>
                 <div>
                     <h1 className="text-lg font-bold dark:text-white">Finish Rack {activeSession.rack}</h1>
                     <p className="text-xs text-slate-500">Session Summary</p>
                 </div>
             </header>

             <main className="flex-1 p-6 space-y-6">
                 {error && (
                    <div className="animate-in fade-in slide-in-from-top-2">
                        <ErrorState message={error} onRetry={() => { clearError(); handleCommit(); }} />
                    </div>
                 )}

                 <div className="text-center py-4">
                     <div className="inline-flex size-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 mb-4">
                         <span className="material-symbols-outlined text-4xl">check_circle</span>
                     </div>
                     <h2 className="text-2xl font-black dark:text-white">Verification Complete</h2>
                     <p className="text-sm text-slate-500 mt-1 max-w-[200px] mx-auto">Review the summary below before syncing to the Verification Database.</p>
                 </div>

                 <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                     <div className="grid grid-cols-2 gap-6 mb-6">
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Items</p>
                             <p className="text-3xl font-black text-slate-800 dark:text-white mt-1">{metrics.scanned}</p>
                         </div>
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Matched</p>
                             <p className="text-3xl font-black text-green-500 mt-1">{metrics.verified}</p>
                         </div>
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Variance</p>
                             <p className="text-3xl font-black text-red-500 mt-1">{metrics.pending}</p>
                         </div>
                         <div>
                             <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Efficiency</p>
                             <p className="text-3xl font-black text-blue-500 mt-1">{metrics.efficiency}%</p>
                         </div>
                     </div>
                     <div className="border-t border-slate-100 dark:border-slate-700 pt-4">
                         <div className="flex justify-between items-center text-sm">
                             <span className="font-semibold text-slate-600 dark:text-slate-400">Time Taken</span>
                             <span className="font-bold dark:text-white">42m 15s</span>
                         </div>
                     </div>
                 </div>

                 <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30 flex gap-3">
                     <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">cloud_upload</span>
                     <div>
                         <p className="text-xs font-bold text-blue-700 dark:text-blue-300">Operational Sync</p>
                         <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5">Verification results will be stored in the separate app database. SQL Server remains Read-Only.</p>
                     </div>
                 </div>
             </main>

             <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-0">
                 <button onClick={handleCommit} disabled={isLoading} className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all">
                     {isLoading ? (
                         <span className="flex items-center gap-2">
                             <span className="size-4 border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900 rounded-full animate-spin"></span>
                             COMMITTING...
                         </span>
                     ) : (
                         <>
                             <span className="material-symbols-outlined text-[18px]">verified</span>
                             COMMIT TO OPERATIONAL DB
                         </>
                     )}
                 </button>
             </div>
        </div>
    );
};

export default SessionSummary;