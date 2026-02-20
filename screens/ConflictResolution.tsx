import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthStrip } from '../components/HealthStrip';
import { useStock } from '../contexts/StockContext';
import { useToast } from '../components/Toast';
import { ErrorState, EmptyState } from '../components/UIStates';

const ConflictResolution: React.FC = () => {
    const navigate = useNavigate();
    const { conflicts, resolveConflict, isLoading, error, clearError } = useStock();
    const { showToast } = useToast();
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (currentIndex >= conflicts.length && conflicts.length > 0) {
            setCurrentIndex(conflicts.length - 1);
        } else if (conflicts.length === 0) {
            setCurrentIndex(0);
        }
    }, [conflicts.length, currentIndex]);

    const currentConflict = conflicts[currentIndex];

    const handleResolve = async (resolution: 'local' | 'server') => {
        if (!currentConflict) return;
        try {
            await resolveConflict(currentConflict.id, resolution);
            showToast(`Resolved using ${resolution} data`, 'success');
            // Index adjustment handled by useEffect
        } catch (e) {
            showToast('Resolution failed', 'error');
        }
    };

    if (!currentConflict && !isLoading && !error) {
         return (
             <div className="min-h-screen bg-background-light dark:bg-dark-bg text-slate-900 dark:text-slate-200 flex flex-col">
                 <header className="flex items-center px-4 pt-4 pb-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold ml-2">Conflicts</h1>
                 </header>
                 <EmptyState message="No conflicts detected" icon="check_circle" />
             </div>
         )
    }

    return (
        <div className="min-h-screen flex flex-col bg-background-light dark:bg-dark-bg text-slate-900 dark:text-slate-200 font-display antialiased">
            {/* Standard Health Strip replacing custom status bar */}
            <div className="bg-primary/5 dark:bg-slate-900 px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                <HealthStrip variant="compact" />
            </div>

            {/* Header */}
            <header className="flex items-center justify-between px-4 pt-4 pb-2 dark:py-4">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 dark:w-10 dark:h-10 dark:flex dark:items-center dark:justify-center dark:rounded-full dark:bg-dark-card dark:border dark:border-dark-border dark:ml-0 dark:active:scale-95 transition-transform">
                    <span className="material-symbols-outlined dark:hidden">arrow_back_ios</span>
                    <span className="material-symbols-outlined hidden dark:block">chevron_left</span>
                </button>
                <div className="flex flex-col items-center">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight dark:tracking-tight">
                        <span className="dark:hidden">Sync Conflicts</span>
                        <span className="hidden dark:inline">Resolve Conflict</span>
                    </h1>
                    <p className="text-[10px] text-slate-500 font-medium dark:uppercase dark:tracking-[0.1em]">Lavanya Emart • <span className="dark:hidden">Inventory</span><span className="hidden dark:inline">Stock-Ops</span></p>
                </div>
                <button className="p-2 -mr-2 text-slate-600 dark:text-blue-400 dark:w-10 dark:h-10 dark:flex dark:items-center dark:justify-center dark:rounded-full dark:bg-dark-card dark:border dark:border-dark-border dark:mr-0">
                    <span className="material-symbols-outlined text-primary dark:text-inherit hidden dark:block">history</span>
                    <span className="material-symbols-outlined text-primary dark:text-inherit dark:hidden">filter_list</span>
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 pb-44 hide-scrollbar">
                
                {error && <div className="mb-4"><ErrorState message={error} onRetry={clearError} /></div>}

                {/* Conflict Alert Banner */}
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg flex items-center gap-3">
                     <span className="material-symbols-outlined text-red-600 dark:text-red-400">sync_problem</span>
                     <div className="flex-1">
                         <p className="text-xs font-bold text-red-700 dark:text-red-300">Data Conflict Detected</p>
                         <p className="text-[10px] text-red-600 dark:text-red-400">Local data differs from server state.</p>
                     </div>
                </div>

                {/* Navigation Controls (If multiple) */}
                {conflicts.length > 1 && (
                    <div className="flex items-center justify-between mb-4 px-1">
                         <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                             Item {currentIndex + 1} of {conflicts.length}
                         </span>
                         <div className="flex gap-2">
                             <button
                                disabled={currentIndex === 0}
                                onClick={() => setCurrentIndex(i => i - 1)}
                                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                             >
                                <span className="material-symbols-outlined text-lg">chevron_left</span>
                             </button>
                             <button
                                disabled={currentIndex === conflicts.length - 1}
                                onClick={() => setCurrentIndex(i => i + 1)}
                                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                             >
                                <span className="material-symbols-outlined text-lg">chevron_right</span>
                             </button>
                         </div>
                    </div>
                )}

                {/* Detail View / Header (Merged for Dark Mode) */}
                <div className="pb-4 dark:mb-6 dark:bg-dark-card/50 dark:border dark:border-dark-border dark:p-4 dark:rounded-2xl">
                    <div className="flex items-start gap-3 dark:gap-4">
                        <div className="size-12 dark:w-14 dark:h-14 rounded-lg dark:rounded-xl bg-primary/10 dark:bg-blue-500/10 flex items-center justify-center text-primary dark:text-blue-400 shrink-0 dark:border dark:border-blue-500/20">
                            <span className="material-symbols-outlined text-3xl">apparel</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h2 className="text-base font-bold text-slate-900 dark:text-white">{currentConflict?.name || 'Item Name'}</h2>
                                <div className="mt-1 dark:mt-0 inline-flex items-center px-2 py-0.5 rounded bg-red-100 dark:bg-red-400/10 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase tracking-tight dark:border dark:border-red-400/20">
                                    <span className="dark:hidden">Quantity Mismatch</span>
                                    <span className="hidden dark:inline">Mismatch</span>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 dark:mt-0.5">SKU: {currentConflict?.sku}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Matrix / Grid */}
                    <div className="grid grid-cols-2 gap-px dark:gap-3 bg-slate-200 dark:bg-transparent rounded-xl dark:rounded-none overflow-hidden border border-slate-200 dark:border-none">
                        
                        {/* LOCAL DEVICE COLUMN */}
                        <div className="dark:bg-dark-card dark:border dark:border-dark-border dark:rounded-2xl dark:overflow-hidden dark:shadow-xl">
                            <div className="bg-slate-50 dark:bg-blue-600/10 p-3 flex flex-col items-center dark:border-b dark:border-dark-border">
                                <span className="material-symbols-outlined text-primary dark:text-blue-400 text-xl dark:text-base mb-1">smartphone</span>
                                <span className="text-[10px] font-bold dark:font-black text-slate-500 dark:text-blue-400 uppercase dark:tracking-wider">Local Device</span>
                            </div>

                            <div className="bg-white dark:bg-transparent p-4 flex flex-col items-center border-r border-slate-100 dark:border-none dark:space-y-4">
                                <div className="text-center">
                                    <span className="text-xs dark:text-[10px] text-slate-400 dark:text-slate-500 mb-1 dark:uppercase dark:font-bold dark:block">Stock Count</span>
                                    <span className="text-2xl dark:text-3xl font-bold dark:font-black text-red-600 dark:text-white">{currentConflict?.localCount}</span>
                                    {/* Dark Mode Badge */}
                                    <div className="mt-2 hidden dark:flex items-center justify-center gap-1 text-[10px] text-emerald-400 bg-emerald-400/10 py-1 px-2 rounded-full">
                                        <span className="material-symbols-outlined text-[12px]">schedule</span>
                                        <span>Latest</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SERVER DATA COLUMN */}
                         <div className="dark:bg-dark-card dark:border dark:border-dark-border dark:rounded-2xl dark:overflow-hidden dark:shadow-xl">
                            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 flex flex-col items-center dark:border-b dark:border-dark-border">
                                <span className="material-symbols-outlined text-slate-400 text-xl dark:text-base mb-1">cloud_done</span>
                                <span className="text-[10px] font-bold dark:font-black text-slate-500 dark:text-slate-400 uppercase dark:tracking-wider">Server <span className="dark:hidden">Data</span><span className="hidden dark:inline">Sync</span></span>
                            </div>
                            
                             <div className="bg-white dark:bg-transparent p-4 flex flex-col items-center dark:space-y-4">
                                <div className="text-center">
                                    <span className="text-xs dark:text-[10px] text-slate-400 dark:text-slate-500 mb-1 dark:uppercase dark:font-bold dark:block">Stock Count</span>
                                    <span className="text-2xl dark:text-3xl font-bold dark:font-black text-slate-900 dark:text-slate-400">{currentConflict?.serverCount}</span>
                                     <div className="mt-2 hidden dark:flex items-center justify-center gap-1 text-[10px] text-slate-500 bg-slate-800 py-1 px-2 rounded-full">
                                        <span className="material-symbols-outlined text-[12px]">history</span>
                                        <span>Older</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Fixed Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-bg/80 dark:backdrop-blur-xl border-t border-slate-100 dark:border-dark-border p-4 pb-8 space-y-3 dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
                <div className="grid grid-cols-2 gap-3">
                    <button disabled={isLoading} onClick={() => handleResolve('local')} className="flex dark:flex-col items-center justify-center gap-2 dark:gap-1 bg-primary dark:bg-blue-600 text-white font-bold py-3 dark:py-3.5 rounded-xl dark:rounded-2xl shadow-lg shadow-primary/20 dark:shadow-blue-900/40 hover:opacity-90 active:scale-[0.98] transition-all group disabled:opacity-50">
                         {isLoading ? (
                            <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                         ) : (
                             <>
                                <div className="flex items-center gap-2">
                                     <span className="material-symbols-outlined text-lg">check_circle</span>
                                     <span className="text-sm">Keep Local</span>
                                </div>
                                <span className="text-[9px] opacity-70 font-normal hidden dark:block">Apply '{currentConflict?.localCount}' to Server</span>
                             </>
                         )}
                    </button>
                    <button disabled={isLoading} onClick={() => handleResolve('server')} className="flex dark:flex-col items-center justify-center gap-2 dark:gap-1 bg-white dark:bg-dark-card text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-dark-border font-bold py-3 dark:py-3.5 rounded-xl dark:rounded-2xl hover:bg-slate-50 active:scale-[0.98] transition-all disabled:opacity-50">
                        {isLoading ? (
                             <span className="size-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin"></span>
                        ) : (
                            <>
                                <div className="flex items-center gap-2">
                                     <span className="material-symbols-outlined text-lg">cloud_download</span>
                                     <span className="text-sm">Use Server</span>
                                </div>
                                <span className="text-[9px] opacity-50 font-normal text-slate-400 hidden dark:block">Apply '{currentConflict?.serverCount}' to Device</span>
                            </>
                        )}
                    </button>
                </div>
                <button className="w-full py-2 flex items-center justify-center gap-2 text-slate-500 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                    <span className="material-symbols-outlined text-lg dark:text-lg">report_problem</span>
                    <span className="text-xs dark:text-[10px] font-bold dark:font-black uppercase tracking-widest dark:tracking-[0.2em]">Escalate to Manager</span>
                </button>
            </div>
        </div>
    );
};

export default ConflictResolution;