import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../contexts/StockContext';

const AuditLogScreen: React.FC = () => {
    const navigate = useNavigate();
    const { auditLog, activeSession } = useStock();

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'SESSION_START': return 'play_circle';
            case 'SESSION_END': return 'stop_circle';
            case 'VERIFY_SUCCESS': return 'check_circle';
            case 'VARIANCE_DETECTED': return 'warning';
            case 'ITEM_ADD': return 'add_circle';
            default: return 'info';
        }
    };

    const getActionColor = (action: string) => {
        switch (action) {
            case 'SESSION_START': return 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
            case 'SESSION_END': return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
            case 'VERIFY_SUCCESS': return 'text-green-500 bg-green-50 dark:bg-green-900/20';
            case 'VARIANCE_DETECTED': return 'text-orange-500 bg-orange-50 dark:bg-orange-900/20';
            case 'ITEM_ADD': return 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
            default: return 'text-slate-500 bg-slate-50 dark:bg-slate-800';
        }
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 py-3 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white">
                    <span className="material-symbols-outlined text-2xl">arrow_back</span>
                </button>
                <div>
                    <h1 className="text-lg font-bold dark:text-white">Session Audit Log</h1>
                    <p className="text-xs text-slate-500 font-mono">SID: {activeSession?.id.substring(0,8) || 'N/A'}</p>
                </div>
            </header>

            <main className="p-4">
                {auditLog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <span className="material-symbols-outlined text-4xl mb-2">history</span>
                        <p className="text-sm font-bold">No activity recorded yet</p>
                    </div>
                ) : (
                    <div className="relative border-l-2 border-slate-100 dark:border-slate-800 ml-4 space-y-8">
                        {auditLog.map((entry) => (
                            <div key={entry.id} className="relative pl-6">
                                <div className={`absolute -left-[11px] top-0 size-5 rounded-full border-2 border-white dark:border-slate-900 flex items-center justify-center ${getActionColor(entry.action)}`}>
                                    <span className="material-symbols-outlined text-[12px]">{getActionIcon(entry.action)}</span>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            {new Date(entry.timestamp).toLocaleTimeString()}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                            {entry.user}
                                        </span>
                                    </div>
                                    <p className="text-sm font-bold dark:text-white">{entry.action.replace('_', ' ')}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{entry.details}</p>
                                    {entry.sku && (
                                        <span className="inline-block mt-2 text-[10px] font-mono font-bold text-slate-400 bg-slate-50 dark:bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">
                                            {entry.sku}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default AuditLogScreen;
