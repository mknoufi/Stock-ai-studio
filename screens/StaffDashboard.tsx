import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthStrip } from '../components/HealthStrip';
import { useStock } from '../contexts/StockContext';
import { useToast } from '../components/Toast';
import { EmptyState } from '../components/UIStates';

const StaffDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { activeSession, items, addItem, notifications, markNotificationRead, getMetrics } = useStock();
    const { showToast } = useToast();
    
    // Search & Filter State
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'conflict'>('all');

    const metrics = getMetrics();

    // Pending Tasks (Recounts)
    const pendingTasks = notifications.filter(n => !n.isRead && n.type === 'recount_request');

    // Advanced Filtering Logic
    const filteredItems = items.filter(item => {
        const term = searchTerm.toLowerCase();
        
        // 1. Search (Name, SKU, Barcodes)
        const matchesSearch = 
            item.name.toLowerCase().includes(term) || 
            item.sku.toLowerCase().includes(term) ||
            (item.autoBarcode && item.autoBarcode.toLowerCase().includes(term)) ||
            (item.manualBarcode && item.manualBarcode.toLowerCase().includes(term));

        // 2. Status Filter
        let matchesStatus = true;
        if (filterStatus === 'pending') matchesStatus = item.status === 'pending' || item.status === 'pending_approval' || item.status === 'assigned_recount';
        if (filterStatus === 'verified') matchesStatus = item.status === 'verified';
        if (filterStatus === 'conflict') matchesStatus = item.status === 'conflict';

        return matchesSearch && matchesStatus;
    });

    const handleScan = async () => {
        // Simulation of a barcode scan event
        const mockSku = `SKU-100${Math.floor(Math.random() * 5)}`;
        // Check if item exists
        const exists = items.find(i => i.sku === mockSku);
        if (exists) {
            navigate(`/staff/verify?sku=${mockSku}`);
        } else {
            // Add new item logic
            try {
                await addItem(mockSku);
                showToast('New item added to session', 'success');
                navigate(`/staff/verify?sku=${mockSku}`);
            } catch (e: any) {
                showToast(e.message || 'Scan failed', 'error');
            }
        }
    };

    if (!activeSession) {
         return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6 text-center">
                 <div className="size-24 bg-primary/10 dark:bg-blue-600/20 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-primary dark:text-blue-400">inventory_2</span>
                 </div>
                 <h1 className="text-2xl font-bold dark:text-white mb-2">No Active Session</h1>
                 <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-xs">Start a verification session to access the stock governance layer.</p>
                 <button onClick={() => navigate('/staff/new-session')} className="w-full max-w-sm bg-primary dark:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2">
                    Start New Session
                    <span className="material-symbols-outlined">arrow_forward</span>
                 </button>
                  <button onClick={() => navigate('/')} className="mt-4 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Back to Login</button>
            </div>
        );
    }

    return (
        <div className="relative flex h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display text-[#111318] dark:text-slate-200">
            {/* Governance Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-primary/10 dark:border-slate-800 px-4 pt-4 pb-2 shrink-0 z-10">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary dark:text-blue-500 text-2xl">verified_user</span>
                        <div>
                          <h1 className="text-sm font-black tracking-tight uppercase dark:text-white leading-none">Audit: SID-{activeSession.id.substring(0,6)}</h1>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Rack: {activeSession.rack}</p>
                        </div>
                    </div>
                    <button onClick={() => navigate('/staff/summary')} className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold uppercase tracking-wider rounded-lg shadow-lg active:scale-95 transition-transform">
                        Finish
                    </button>
                </div>
                <div className="mb-2">
                   <HealthStrip variant="compact" />
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Search by SKU or Name..." 
                        className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-sm font-semibold placeholder:text-slate-400 focus:ring-2 focus:ring-primary dark:focus:ring-blue-500 transition-all dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={() => setSearchTerm('')} className={`absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 ${searchTerm ? 'opacity-100' : 'opacity-0'}`}>
                        <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mt-3 overflow-x-auto hide-scrollbar pb-1">
                    <button onClick={() => setFilterStatus('all')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === 'all' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        All ({items.length})
                    </button>
                    <button onClick={() => setFilterStatus('pending')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === 'pending' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        Pending ({metrics.pending})
                    </button>
                    <button onClick={() => setFilterStatus('verified')} className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${filterStatus === 'verified' ? 'bg-slate-800 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                        Verified ({metrics.verified})
                    </button>
                </div>
            </header>

            {/* List Content */}
            <main className="flex-1 overflow-y-auto p-4 space-y-3 scroll-smooth">
                {/* Notification Center / Tasks */}
                {pendingTasks.length > 0 && (
                    <div className="space-y-3 mb-6 animate-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-orange-500 text-sm">assignment_late</span>
                            <h2 className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest">Priority Tasks</h2>
                        </div>
                        {pendingTasks.map(task => (
                            <div key={task.id} className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/30 rounded-xl p-3 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="size-8 bg-white dark:bg-slate-800 rounded-lg flex items-center justify-center text-orange-500 shadow-sm">
                                            <span className="material-symbols-outlined text-lg">replay</span>
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recount Required</h3>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">SKU: {task.sku}</p>
                                        </div>
                                    </div>
                                    <span className="px-2 py-0.5 bg-white dark:bg-slate-800 text-[9px] font-bold text-slate-400 rounded uppercase border border-slate-100 dark:border-slate-700">Assigned by Sup</span>
                                </div>
                                <div className="flex gap-2 mt-3">
                                    <button 
                                        onClick={() => navigate(`/staff/verify?sku=${task.sku}`)}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2 rounded-lg shadow-md shadow-orange-500/20 active:scale-95 transition-all"
                                    >
                                        Count Now
                                    </button>
                                    <button 
                                        onClick={() => markNotificationRead(task.id)}
                                        className="flex-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold py-2 rounded-lg border border-slate-200 dark:border-slate-700 active:scale-95 transition-all"
                                    >
                                        Remind Later
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Added Header for Visual Hierarchy */}
                <div className="flex items-center justify-between mb-1 ml-1">
                    <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        {searchTerm ? 'Search Results' : 'Recent Items'}
                    </h2>
                    <span className="text-[10px] text-slate-400 font-mono font-bold">
                        {filteredItems.length} found
                    </span>
                </div>

                {filteredItems.length === 0 ? (
                    <EmptyState message="No items found" icon="search_off" />
                ) : (
                    filteredItems.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => navigate(`/staff/verify?sku=${item.sku}`)}
                            className={`relative bg-white dark:bg-surface-dark rounded-xl p-3 shadow-sm border active:scale-[0.99] transition-all cursor-pointer ${
                                item.status === 'verified' 
                                    ? 'border-green-200 dark:border-green-900/30' 
                                    : (item.status === 'pending_approval' ? 'border-red-200 dark:border-red-900/30' : (item.status === 'assigned_recount' ? 'border-orange-200 dark:border-orange-500/30' : 'border-slate-100 dark:border-slate-700'))
                            }`}
                        >
                            <div className="flex gap-3">
                                <div className={`size-14 rounded-lg flex items-center justify-center shrink-0 ${
                                    item.status === 'verified' ? 'bg-green-50 dark:bg-green-900/10 text-green-500' : 
                                    (item.status === 'assigned_recount' ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400')
                                }`}>
                                    {item.status === 'verified' && <span className="material-symbols-outlined text-2xl">check</span>}
                                    {item.status === 'assigned_recount' && <span className="material-symbols-outlined text-2xl">replay</span>}
                                    {item.status !== 'verified' && item.status !== 'assigned_recount' && <span className="material-symbols-outlined text-2xl">inventory_2</span>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate pr-2">{item.name}</h3>
                                        {item.status === 'verified' && (
                                            <span className="text-[10px] font-black uppercase text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400 px-1.5 py-0.5 rounded">Verified</span>
                                        )}
                                        {item.status === 'pending_approval' && (
                                            <span className="text-[10px] font-black uppercase text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400 px-1.5 py-0.5 rounded">Variance</span>
                                        )}
                                        {item.status === 'assigned_recount' && (
                                            <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-100 dark:bg-orange-500/20 dark:text-orange-400 px-1.5 py-0.5 rounded">Recount</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 font-mono mt-0.5">{item.sku}</p>
                                    
                                    <div className="mt-2 flex items-center justify-between">
                                        <div className="flex items-center gap-4 text-xs">
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold block">System</span>
                                                <span className="font-mono font-bold dark:text-slate-300">{item.systemQty}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 uppercase font-bold block">Physical</span>
                                                <span className={`font-mono font-bold ${
                                                    item.observedQty !== item.systemQty && item.status !== 'pending' 
                                                        ? 'text-red-500' 
                                                        : (item.status === 'verified' ? 'text-green-500' : 'text-slate-300')
                                                }`}>
                                                    {item.status === 'pending' ? '-' : item.observedQty}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="material-symbols-outlined text-slate-300 text-lg">chevron_right</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div className="h-20"></div> {/* Spacer for FAB */}
            </main>

            {/* Floating Scan Button */}
            <button 
                onClick={handleScan}
                className="absolute bottom-6 right-6 size-16 bg-primary dark:bg-blue-600 rounded-2xl shadow-xl shadow-primary/30 dark:shadow-blue-900/40 flex items-center justify-center text-white active:scale-90 transition-all z-20 group"
            >
                <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">barcode_reader</span>
            </button>
        </div>
    );
};

export default StaffDashboard;