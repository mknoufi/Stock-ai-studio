import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthStrip } from '../components/HealthStrip';
import { useStock } from '../contexts/StockContext';
import { useToast } from '../components/Toast';
import { ErrorState, EmptyState } from '../components/UIStates';

const VarianceList: React.FC = () => {
    const navigate = useNavigate();
    const { variances, approveVariance, assignRecount, isLoading, error, clearError } = useStock();
    const { showToast } = useToast();
    const [assignModalOpen, setAssignModalOpen] = useState<string | null>(null);

    // Mock Staff List
    const staffMembers = ['Rahul Staff', 'Anita Roy', 'John Doe'];

    const handleApprove = async (id: string) => {
        try {
            await approveVariance(id);
            showToast('Variance approved successfully', 'success');
        } catch (e) {
            showToast('Failed to approve variance', 'error');
        }
    };

    const handleAssign = async (sku: string, staffName: string) => {
        try {
            await assignRecount(sku, staffName);
            showToast(`Recount assigned to ${staffName}`, 'info');
            setAssignModalOpen(null);
        } catch (e) {
            showToast('Failed to assign recount', 'error');
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#111318] dark:text-slate-100 font-display min-h-screen pb-24 relative">
            <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md px-4 pt-6 pb-2 border-b border-transparent dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <button onClick={() => navigate(-1)} className="mr-2 dark:text-blue-400">
                             <span className="material-symbols-outlined text-2xl">arrow_back</span>
                        </button>
                        <span className="material-symbols-outlined text-primary dark:text-blue-500 text-2xl">inventory_2</span>
                        <div>
                            <h1 className="text-lg font-bold leading-tight tracking-tight dark:text-white">Lavanya Emart</h1>
                            <p className="text-[10px] uppercase tracking-widest text-[#616f89] dark:text-slate-400 font-semibold">Store ID: #LE-402</p>
                        </div>
                    </div>
                </div>
                
                {/* Integrated Health Strip */}
                <div className="py-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <HealthStrip variant="compact" />
                </div>

                <div className="flex items-center justify-between pb-2">
                    <h2 className="text-xl font-bold dark:text-white">Inventory Variances</h2>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold px-2 py-1 rounded-full">{variances.length}</span>
                </div>
                
                {/* Search */}
                <div className="py-2">
                    <div className="flex w-full items-stretch rounded-xl h-11 shadow-sm dark:shadow-none dark:bg-slate-800">
                        <div className="text-[#616f89] dark:text-slate-400 flex items-center justify-center pl-4 pr-2">
                            <span className="material-symbols-outlined">search</span>
                        </div>
                        <input className="flex-1 bg-transparent border-none text-sm font-medium placeholder:text-[#616f89] dark:placeholder:text-slate-500 focus:ring-0 text-slate-900 dark:text-white" placeholder="Search SKU or Item Name" />
                    </div>
                </div>
            </header>

            <main className="px-4 py-4 space-y-4">
                {error && <ErrorState message={error} onRetry={clearError} />}
                
                {variances.length === 0 ? (
                    <EmptyState message="No pending variances" icon="check_circle" />
                ) : (
                    variances.map((item) => (
                        <div key={item.id} className="bg-white dark:bg-surface-dark rounded-xl shadow-sm dark:shadow-lg border border-red-100 dark:border-red-500/20 overflow-hidden animate-in fade-in slide-in-from-bottom-2">
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex gap-3">
                                        <div className="h-12 w-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden">
                                            <img className="h-full w-full object-cover" src={item.image} alt="Product" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm dark:text-white">{item.name}</h3>
                                            <p className="text-xs text-[#616f89] dark:text-slate-400">SKU: {item.sku}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.severity === 'high' ? 'bg-red-100 dark:bg-red-500 text-red-700 dark:text-white' : 'bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-400'}`}>{item.severity}</span>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2 bg-background-light dark:bg-slate-950 rounded-lg p-3 mb-4 dark:border dark:border-slate-800">
                                    <div className="text-center">
                                        <p className="text-[10px] text-[#616f89] dark:text-slate-400 uppercase font-bold">System SQL</p>
                                        <p className="text-lg font-bold dark:text-white">{item.systemCount}</p>
                                    </div>
                                    <div className="text-center border-x border-[#dbdfe6] dark:border-slate-800">
                                        <p className="text-[10px] text-[#616f89] dark:text-slate-400 uppercase font-bold">Physical</p>
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{item.physicalCount}</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-[10px] text-[#616f89] dark:text-slate-400 uppercase font-bold">Variance</p>
                                        <p className="text-lg font-bold text-red-600 dark:text-red-400">{item.variance > 0 ? `+${item.variance}` : item.variance}</p>
                                    </div>
                                </div>
                                
                                {/* Location Hint */}
                                <div className="flex items-center gap-2 mb-4 text-[10px] text-slate-500 dark:text-slate-400">
                                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                                    <span>Detected at: {item.sessionLocation}</span>
                                </div>

                                <div className="flex gap-2">
                                    <button disabled={isLoading} onClick={() => handleApprove(item.id)} className="flex-1 py-2.5 bg-primary dark:bg-blue-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-1 shadow-sm dark:shadow-blue-600/30 disabled:opacity-50">
                                        {isLoading ? (
                                             <span className="size-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        ) : (
                                            <>
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button disabled={isLoading} onClick={() => setAssignModalOpen(item.sku)} className="flex-1 py-2.5 border border-[#dbdfe6] dark:border-slate-600 dark:bg-slate-800 text-[#111318] dark:text-slate-200 text-xs font-bold rounded-lg flex items-center justify-center gap-1 disabled:opacity-50">
                                        <span className="material-symbols-outlined text-sm">person_add</span>
                                        Assign Recount
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>

            {/* Recount Assignment Modal */}
            {assignModalOpen && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-4 shadow-2xl animate-in zoom-in-95">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold dark:text-white">Assign Recount Task</h3>
                            <button onClick={() => setAssignModalOpen(null)} className="text-slate-500">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <p className="text-xs text-slate-500 mb-4">Select staff member to recount SKU: <span className="font-bold dark:text-white">{assignModalOpen}</span></p>
                        
                        <div className="space-y-2 mb-4">
                            {staffMembers.map((staff) => (
                                <button key={staff} onClick={() => handleAssign(assignModalOpen, staff)} className="w-full text-left px-4 py-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl font-bold text-sm dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex justify-between items-center group">
                                    {staff}
                                    <span className="material-symbols-outlined text-primary dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">send</span>
                                </button>
                            ))}
                        </div>
                         <button onClick={() => handleAssign(assignModalOpen, 'Me')} className="w-full py-3 border border-slate-200 dark:border-slate-600 rounded-xl font-bold text-sm dark:text-slate-300">
                            Count Myself
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VarianceList;