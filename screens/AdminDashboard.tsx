import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HealthStrip } from '../components/HealthStrip';
import { useToast } from '../components/Toast';
import { useStock } from '../contexts/StockContext';
import { ErrorState } from '../components/UIStates';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { adminAction, isLoading, error, clearError } = useStock();
    const [activeTab, setActiveTab] = useState<'overview' | 'health' | 'users' | 'sql' | 'security'>('overview');

    const handleAction = async (action: string, successMsg: string) => {
        try {
            await adminAction(action);
            showToast(successMsg, 'success');
        } catch (e) {
            showToast('Action failed', 'error');
        }
    };

    return (
        <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-primary/10 dark:border-slate-800 sticky top-0 z-20">
                <div className="px-4 py-2 border-b border-slate-50 dark:border-slate-800/50">
                    <HealthStrip variant="compact" />
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="p-1 -ml-1 text-slate-400 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight dark:text-white">Admin Console</h1>
                            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">System Configuration</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <button className="size-9 rounded-full bg-primary/10 dark:bg-slate-800 text-primary dark:text-blue-400 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">smart_toy</span>
                        </button>
                        <button className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">settings</span>
                        </button>
                    </div>
                </div>
                
                {/* Tabs */}
                <div className="flex px-4 gap-4 overflow-x-auto hide-scrollbar border-b border-slate-200 dark:border-slate-800">
                    {['overview', 'health', 'users', 'sql', 'security'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`pb-3 pt-1 text-xs font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-colors ${
                                activeTab === tab
                                    ? 'border-primary dark:border-blue-500 text-primary dark:text-blue-400'
                                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {error && <div className="animate-in fade-in"><ErrorState message={error} onRetry={clearError} /></div>}

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                        {/* Metrics Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Total Users</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">24</p>
                                <p className="text-[10px] text-green-500 font-bold mt-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">trending_up</span> 2 active
                                </p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">SQL Latency</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">12ms</p>
                                <p className="text-[10px] text-green-500 font-bold mt-1">Optimal</p>
                            </div>
                            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Pending Syncs</p>
                                <p className="text-2xl font-black text-orange-500 mt-1">8</p>
                                <p className="text-[10px] text-orange-500 font-bold mt-1">Requires Action</p>
                            </div>
                             <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 shadow-sm">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Device Health</p>
                                <p className="text-2xl font-black text-slate-800 dark:text-white mt-1">98%</p>
                                <p className="text-[10px] text-slate-400 font-bold mt-1">Battery/Storage</p>
                            </div>
                        </div>

                        {/* Recent System Logs */}
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-100 dark:border-slate-700/50 overflow-hidden">
                            <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-sm font-bold dark:text-white">System Logs</h3>
                                <button className="text-[10px] font-bold text-primary dark:text-blue-400 uppercase">View All</button>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="px-4 py-3 flex gap-3">
                                        <span className="text-[10px] font-mono text-slate-400 mt-0.5">10:4{i}:22</span>
                                        <div>
                                            <p className="text-xs font-semibold dark:text-slate-200">Database synchronization completed</p>
                                            <p className="text-[10px] text-slate-400">Source: Auto-Sync Worker</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* HEALTH TAB */}
                {activeTab === 'health' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                         {/* Database Status Row */}
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Operational DB */}
                            <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3 items-center">
                                        <div className="size-10 bg-green-50 dark:bg-green-500/10 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                                            <span className="material-symbols-outlined">dns</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm dark:text-white">Operational DB</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">MongoDB (Write)</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                                        <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
                                        Online
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-800">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Latency</p>
                                        <p className="text-lg font-mono font-bold dark:text-slate-200">12ms</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Pool</p>
                                        <p className="text-lg font-mono font-bold dark:text-slate-200">8/20</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Uptime</p>
                                        <p className="text-lg font-mono font-bold dark:text-slate-200">99.9%</p>
                                    </div>
                                </div>
                            </div>

                            {/* ERP DB */}
                            <div className="bg-white dark:bg-surface-dark p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full -mr-4 -mt-4"></div>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex gap-3 items-center">
                                        <div className="size-10 bg-blue-50 dark:bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <span className="material-symbols-outlined">table_view</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm dark:text-white">ERP Observer</h3>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">SQL Server (Read-Only)</p>
                                        </div>
                                    </div>
                                    <span className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                                        <span className="size-2 bg-blue-500 rounded-full animate-pulse"></span>
                                        Connected
                                    </span>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center divide-x divide-slate-100 dark:divide-slate-800">
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Latency</p>
                                        <p className="text-lg font-mono font-bold dark:text-slate-200">45ms</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Sync</p>
                                        <p className="text-lg font-mono font-bold dark:text-slate-200">2m ago</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">Records</p>
                                        <p className="text-lg font-mono font-bold dark:text-slate-200">14k</p>
                                    </div>
                                </div>
                            </div>
                         </div>

                         {/* Active User Sessions Table */}
                         <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                <h3 className="text-sm font-bold dark:text-white">Active Sessions</h3>
                                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Real-time</span>
                            </div>
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {[
                                    { user: 'Rahul Staff', role: 'Staff', device: 'Mobile-01', ip: '192.168.1.101', time: '1h 20m', status: 'Active' },
                                    { user: 'Anita Roy', role: 'Supervisor', device: 'Tablet-Pro', ip: '192.168.1.105', time: '45m', status: 'Idle' },
                                    { user: 'System Admin', role: 'Admin', device: 'Desktop-HQ', ip: '192.168.1.50', time: '10m', status: 'Active' },
                                ].map((session, idx) => (
                                    <div key={idx} className="px-5 py-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`size-8 rounded-full flex items-center justify-center text-xs font-bold ${session.role === 'Admin' ? 'bg-purple-100 text-purple-600' : (session.role === 'Supervisor' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600')}`}>
                                                {session.user.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold dark:text-slate-200">{session.user}</p>
                                                <p className="text-[10px] text-slate-400">{session.role} • {session.device}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                             <div className="flex items-center justify-end gap-1.5">
                                                 <span className={`size-1.5 rounded-full ${session.status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                                                 <span className="text-[10px] font-bold dark:text-slate-300">{session.status}</span>
                                             </div>
                                             <p className="text-[10px] text-slate-400 font-mono">{session.ip}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                )}

                {/* USERS TAB */}
                {activeTab === 'users' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex justify-between items-center">
                            <h2 className="text-sm font-bold text-slate-500 uppercase">Staff Management</h2>
                            <button className="bg-primary dark:bg-blue-600 text-white p-2 rounded-lg shadow-lg shadow-primary/30">
                                <span className="material-symbols-outlined text-[20px]">person_add</span>
                            </button>
                        </div>
                        <div className="space-y-3">
                             {['Rahul Sharma', 'Anita Roy', 'John Doe'].map((user, idx) => (
                                <div key={idx} className="bg-white dark:bg-surface-dark p-3 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-500">
                                            <span className="material-symbols-outlined">person</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold dark:text-white">{user}</p>
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold">{idx === 0 ? 'Supervisor' : 'Staff'}</p>
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-primary dark:hover:text-blue-400">
                                        <span className="material-symbols-outlined">more_vert</span>
                                    </button>
                                </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* SQL CONFIG TAB */}
                {activeTab === 'sql' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                         <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-4 rounded-xl flex gap-3">
                            <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">warning</span>
                            <div>
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Advanced Configuration</p>
                                <p className="text-[10px] text-amber-600/80 dark:text-amber-400/70 mt-1">Incorrect settings will disconnect the app from the inventory database.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Server Host / IP</label>
                                <input type="text" defaultValue="192.168.1.50" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono dark:text-white" />
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Port</label>
                                <input type="text" defaultValue="1433" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono dark:text-white" />
                            </div>
                             <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Instance Name</label>
                                <input type="text" defaultValue="SQLEXPRESS_LAVANYA" className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono dark:text-white" />
                            </div>
                        </div>

                        <button disabled={isLoading} onClick={() => handleAction('save config', 'SQL Configuration Saved')} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl shadow-lg mt-4 disabled:opacity-50 flex justify-center items-center">
                            {isLoading ? <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : 'Save Configuration'}
                        </button>
                    </div>
                )}
                
                 {/* SECURITY TAB */}
                {activeTab === 'security' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                         <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                             <div>
                                 <p className="text-sm font-bold dark:text-white">Biometric Enforcement</p>
                                 <p className="text-xs text-slate-500">Require fingerprint for login</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-blue-600"></div>
                            </label>
                         </div>
                         <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                             <div>
                                 <p className="text-sm font-bold dark:text-white">Strict LAN Mode</p>
                                 <p className="text-xs text-slate-500">Block external network traffic</p>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-blue-600"></div>
                            </label>
                         </div>
                          <button disabled={isLoading} onClick={() => handleAction('logout users', 'All users logged out')} className="w-full border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold py-3 rounded-xl mt-4 flex justify-center items-center disabled:opacity-50">
                             {isLoading ? <span className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span> : 'Force Logout All Users'}
                        </button>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminDashboard;