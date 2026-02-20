import React from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
             <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 px-4 py-3 flex items-center gap-3">
                 <button onClick={() => navigate(-1)} className="p-1 -ml-1 text-slate-500 hover:text-primary dark:text-slate-400 dark:hover:text-white">
                     <span className="material-symbols-outlined text-2xl">arrow_back</span>
                 </button>
                 <h1 className="text-lg font-bold dark:text-white">Settings</h1>
             </header>

             <main className="p-4 space-y-6">
                 
                 {/* Preferences */}
                 <section>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">App Preferences</h3>
                     <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                         <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-3">
                                 <div className="size-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center">
                                     <span className="material-symbols-outlined text-lg">vibration</span>
                                 </div>
                                 <span className="text-sm font-bold dark:text-white">Haptic Feedback</span>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-blue-600"></div>
                            </label>
                         </div>
                         <div className="p-4 flex items-center justify-between">
                             <div className="flex items-center gap-3">
                                 <div className="size-8 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg flex items-center justify-center">
                                     <span className="material-symbols-outlined text-lg">volume_up</span>
                                 </div>
                                 <span className="text-sm font-bold dark:text-white">Scan Sound</span>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-blue-600"></div>
                            </label>
                         </div>
                     </div>
                 </section>

                 {/* Hardware */}
                 <section>
                     <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 ml-1">Scanner Hardware</h3>
                      <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                         <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                             <div className="flex items-center gap-3">
                                 <div className="size-8 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg flex items-center justify-center">
                                     <span className="material-symbols-outlined text-lg">bluetooth</span>
                                 </div>
                                 <div>
                                     <p className="text-sm font-bold dark:text-white">Bluetooth Mode</p>
                                     <p className="text-[10px] text-slate-400">For external handheld scanners</p>
                                 </div>
                             </div>
                             <label className="relative inline-flex items-center cursor-pointer">
                                <input defaultChecked type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary dark:peer-checked:bg-blue-600"></div>
                            </label>
                         </div>
                         <button className="w-full p-4 text-left text-sm font-bold text-primary dark:text-blue-400 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800">
                             Configure Input Prefix/Suffix
                             <span className="material-symbols-outlined">chevron_right</span>
                         </button>
                     </div>
                 </section>

                 {/* About */}
                 <section>
                     <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                         <button onClick={() => navigate('/about')} className="w-full p-4 flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800">
                             <div className="flex items-center gap-3">
                                 <div className="size-8 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-lg flex items-center justify-center">
                                     <span className="material-symbols-outlined text-lg">info</span>
                                 </div>
                                 <span className="text-sm font-bold dark:text-white">About & Diagnostics</span>
                             </div>
                             <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                         </button>
                     </div>
                 </section>
             </main>
        </div>
    );
};

export default SettingsScreen;