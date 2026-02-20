import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthStrip } from '../components/HealthStrip';
import { useStock } from '../contexts/StockContext';

const SupervisorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { variances, conflicts, activeSession } = useStock();

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen pb-20">
            {/* Status Bar */}
            <div className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <div className="px-4 py-1.5 border-b border-slate-50 dark:border-slate-800/50">
                    <HealthStrip variant="compact" />
                </div>
                {/* App Header */}
                <div className="flex items-center justify-between px-4 py-4">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20">
                            <img className="w-full h-full object-cover" src="https://picsum.photos/100/100?random=10" alt="" />
                        </div>
                        <div>
                            <h1 className="text-base font-black tracking-tight uppercase dark:text-white">Oversight: SID-{activeSession?.id.substring(0,8) || 'GLOBAL'}</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inventory Governance Mode</p>
                        </div>
                    </div>
                    <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400">
                        <span className="material-symbols-outlined text-[20px]">notifications</span>
                    </button>
                </div>
            </div>

            <main className="p-4 space-y-6">
                {/* Governance Summary Card */}
                {activeSession && (
                  <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-white/5 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-2 opacity-10">
                        <span className="material-symbols-outlined text-[80px]">security</span>
                    </div>
                    <h2 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Active Session Metadata</h2>
                    <div className="grid grid-cols-2 gap-4 relative z-10">
                        <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Snapshot Hash</p>
                            <p className="text-xs font-mono font-bold mt-1 truncate">{activeSession.snapshotHash}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] font-bold text-slate-400 uppercase">Start Timestamp</p>
                            <p className="text-xs font-bold mt-1">{new Date(activeSession.startTime).toLocaleTimeString()}</p>
                        </div>
                    </div>
                  </div>
                )}

                {/* KPI Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div onClick={() => navigate('/supervisor/variances')} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 cursor-pointer active:scale-95 transition-transform">
                        <div className="flex items-center gap-2 mb-2 text-slate-400">
                            <span className="material-symbols-outlined text-[14px]">analytics</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Total Variances</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-black dark:text-white">{variances.length}</span>
                            {variances.length > 0 && <span className="text-[8px] font-black text-red-500 bg-red-100 px-1.5 py-0.5 rounded uppercase">Action</span>}
                        </div>
                    </div>
                    <div onClick={() => navigate('/supervisor/conflicts')} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 border-l-4 border-l-red-500 cursor-pointer active:scale-95 transition-transform">
                        <div className="flex items-center gap-2 mb-2 text-red-500">
                            <span className="material-symbols-outlined text-[14px]">sync_problem</span>
                            <span className="text-[9px] font-black uppercase tracking-widest">Sync Conflicts</span>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-2xl font-black text-red-600 dark:text-red-500">{conflicts.length}</span>
                            {conflicts.length > 0 && <span className="text-[8px] font-black text-white bg-red-600 px-1.5 py-0.5 rounded uppercase animate-pulse">Critical</span>}
                        </div>
                    </div>
                </div>

                {/* Active Sessions */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Global Session Monitor</h2>
                        <button className="text-primary dark:text-blue-500 text-xs font-bold uppercase">All Data</button>
                    </div>
                    
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex gap-3">
                                <div className="size-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center text-orange-600">
                                    <span className="material-symbols-outlined">inventory_2</span>
                                </div>
                                <div>
                                    <h3 className="font-black text-xs uppercase dark:text-white">Zone A - Electronics</h3>
                                    <p className="text-[10px] text-slate-500 font-bold">SID: #88219 • Staff: Rahul Sharma</p>
                                </div>
                            </div>
                            <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-2 py-1 rounded uppercase tracking-wider">In Progress</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <span>Physical Check Progress</span>
                                <span className="text-slate-900 dark:text-white">65%</span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-slate-900 h-2 rounded-full overflow-hidden">
                                <div className="bg-orange-500 h-full w-[65%] rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pb-8 pt-2 z-50">
                <div className="flex justify-around items-center max-w-md mx-auto">
                    <button className="flex flex-col items-center gap-0.5 text-primary">
                        <span className="material-symbols-outlined text-[26px]">dashboard</span>
                        <span className="text-[9px] font-black uppercase">Board</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 text-slate-400">
                        <span className="material-symbols-outlined text-[26px]">assignment</span>
                        <span className="text-[9px] font-black uppercase">Sessions</span>
                    </button>
                    <button className="flex flex-col items-center gap-0.5 text-slate-400">
                        <span className="material-symbols-outlined text-[26px]">package_2</span>
                        <span className="text-[9px] font-black uppercase">Stock</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SupervisorDashboard;