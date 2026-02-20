import React from 'react';
import { useNavigate } from 'react-router-dom';

const AboutScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
             <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 py-3 flex items-center gap-3">
                 <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white">
                     <span className="material-symbols-outlined text-2xl">arrow_back</span>
                 </button>
                 <h1 className="text-lg font-bold dark:text-white">About</h1>
             </header>

             <main className="p-6 flex flex-col items-center">
                 <div className="size-24 bg-primary dark:bg-blue-600 rounded-3xl flex items-center justify-center shadow-xl shadow-primary/30 mb-6">
                     <span className="material-symbols-outlined text-white text-5xl">inventory_2</span>
                 </div>
                 
                 <h2 className="text-xl font-bold dark:text-white">Lavanya Emart</h2>
                 <p className="text-sm text-slate-500 font-semibold mb-8">Stock Verification System</p>

                 <div className="w-full space-y-4">
                     <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Device Information</h3>
                         <div className="space-y-3">
                             <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">Version</span>
                                 <span className="font-bold dark:text-white">1.2.4-stable</span>
                             </div>
                             <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">Build</span>
                                 <span className="font-bold dark:text-white">20231024-RC</span>
                             </div>
                              <div className="flex justify-between text-sm">
                                 <span className="text-slate-500">IP Address</span>
                                 <span className="font-mono font-bold dark:text-white">192.168.1.50</span>
                             </div>
                         </div>
                     </div>

                     <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                         <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Diagnostics</h3>
                         <div className="space-y-3">
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Backend API</span>
                                 <span className="flex items-center gap-1.5 text-green-500 font-bold text-xs bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                     <span className="size-2 bg-green-500 rounded-full animate-pulse"></span> Online
                                 </span>
                             </div>
                             <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">SQL Server</span>
                                 <span className="flex items-center gap-1.5 text-green-500 font-bold text-xs bg-green-50 dark:bg-green-500/10 px-2 py-0.5 rounded-full">
                                     <span className="size-2 bg-green-500 rounded-full animate-pulse"></span> Connected
                                 </span>
                             </div>
                              <div className="flex justify-between items-center text-sm">
                                 <span className="text-slate-500">Latency</span>
                                 <span className="font-mono font-bold dark:text-white">24ms</span>
                             </div>
                         </div>
                     </div>
                 </div>
                 
                 <p className="mt-12 text-[10px] text-slate-400 text-center">
                     © 2024 Lavanya Emart Enterprise.<br/>All rights reserved.
                 </p>
             </main>
        </div>
    );
};

export default AboutScreen;