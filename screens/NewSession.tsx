import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStock } from '../contexts/StockContext';
import { useToast } from '../components/Toast';
import { ErrorState } from '../components/UIStates';

const NewSession: React.FC = () => {
    const navigate = useNavigate();
    const { startSession, isLoading, error, clearError } = useStock();
    const { showToast } = useToast();
    const [selectedLocation, setSelectedLocation] = useState('Showroom');

    const handleStart = async () => {
        try {
            await startSession(selectedLocation, '1st Floor', 'A-102');
            showToast(`Session started at ${selectedLocation}`, 'success');
            navigate('/staff/dashboard');
        } catch (e) {
            showToast('Failed to start session', 'error');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
             {/* Background App Content (Simulated) */}
             <div className="opacity-20 pointer-events-none fixed inset-0 z-0">
                <header className="bg-slate-900 border-b border-slate-800 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                                <span className="material-symbols-outlined">inventory_2</span>
                            </div>
                            <div>
                                <h1 className="text-sm font-bold">Lavanya Emart</h1>
                                <p className="text-xs text-slate-500">Inventory Management</p>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="p-4 space-y-4">
                    <div className="h-32 bg-slate-800 rounded-xl border border-slate-700"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-24 bg-slate-800 rounded-xl border border-slate-700"></div>
                        <div className="h-24 bg-slate-800 rounded-xl border border-slate-700"></div>
                    </div>
                </main>
             </div>

            {/* Modal */}
            <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center">
                <div className="bg-[#111827] w-full max-w-md h-[94vh] rounded-t-[2.5rem] shadow-2xl flex flex-col relative overflow-hidden ring-1 ring-white/10">
                    <div className="w-full flex justify-center pt-3 pb-1">
                        <div className="w-10 h-1.5 bg-slate-700 rounded-full"></div>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between border-b border-slate-800/50">
                        <h2 className="text-xl font-bold tracking-tight text-white">Create New Session</h2>
                        <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center bg-slate-800 text-slate-400 rounded-full active:bg-slate-700">
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    </div>

                    {/* Stepper */}
                    <div className="px-6 py-6">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-1.5 w-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                                <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">Location</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-1.5 w-full bg-slate-800 rounded-full"></div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Floor</span>
                            </div>
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="h-1.5 w-full bg-slate-800 rounded-full"></div>
                                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Rack</span>
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto px-6 pb-40 hide-scrollbar">
                        {error && (
                             <div className="mb-4">
                                <ErrorState message={error} onRetry={() => { clearError(); handleStart(); }} />
                             </div>
                        )}

                        <section className="mt-2">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-semibold text-slate-100">1. Select Location</h3>
                                <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold rounded uppercase tracking-widest border border-blue-500/20">Required</span>
                            </div>
                            <div className="grid grid-cols-1 gap-4">
                                <div onClick={() => setSelectedLocation('Showroom')} className="relative group cursor-pointer">
                                    <input checked={selectedLocation === 'Showroom'} readOnly className="peer hidden" id="loc-showroom" name="location" type="radio" />
                                    <label className="flex items-center p-4 rounded-2xl border-2 border-slate-800 bg-slate-800/40 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all duration-200">
                                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mr-4 ring-1 ring-blue-500/30">
                                            <span className="material-symbols-outlined text-3xl">storefront</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-white">Showroom</p>
                                            <p className="text-xs text-slate-400">Main retail floor inventory</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center peer-checked:border-blue-500">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 scale-0 transition-transform peer-checked:scale-100"></div>
                                        </div>
                                    </label>
                                </div>
                                <div onClick={() => setSelectedLocation('Godown')} className="relative group cursor-pointer">
                                    <input checked={selectedLocation === 'Godown'} readOnly className="peer hidden" id="loc-godown" name="location" type="radio" />
                                    <label className="flex items-center p-4 rounded-2xl border-2 border-slate-800 bg-slate-800/40 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all duration-200">
                                        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 mr-4 group-hover:text-slate-200 transition-colors">
                                            <span className="material-symbols-outlined text-3xl">warehouse</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-300">Godown</p>
                                            <p className="text-xs text-slate-500">Bulk storage & warehouse</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center peer-checked:border-blue-500">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 scale-0 transition-transform peer-checked:scale-100"></div>
                                        </div>
                                    </label>
                                </div>
                                <div onClick={() => setSelectedLocation('Transit')} className="relative group cursor-pointer">
                                    <input checked={selectedLocation === 'Transit'} readOnly className="peer hidden" id="loc-transit" name="location" type="radio" />
                                    <label className="flex items-center p-4 rounded-2xl border-2 border-slate-800 bg-slate-800/40 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all duration-200">
                                        <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center text-slate-400 mr-4 group-hover:text-slate-200 transition-colors">
                                            <span className="material-symbols-outlined text-3xl">local_shipping</span>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-300">Transit</p>
                                            <p className="text-xs text-slate-500">Inbound & outbound stock</p>
                                        </div>
                                        <div className="w-6 h-6 rounded-full border-2 border-slate-700 flex items-center justify-center peer-checked:border-blue-500">
                                            <div className="w-3 h-3 rounded-full bg-blue-500 scale-0 transition-transform peer-checked:scale-100"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </section>

                        {/* Collapsed steps */}
                        <section className="mt-8 opacity-40">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-500">2. Select Floor</h3>
                                <span className="material-symbols-outlined text-slate-600">lock</span>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1 h-14 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center justify-center font-bold text-slate-600">G</div>
                                <div className="flex-1 h-14 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center justify-center font-bold text-slate-600">1</div>
                                <div className="flex-1 h-14 bg-slate-800/50 rounded-xl border border-slate-800 flex items-center justify-center font-bold text-slate-600">2</div>
                            </div>
                        </section>

                        <section className="mt-8 opacity-40">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-slate-500">3. Select Rack</h3>
                                <span className="material-symbols-outlined text-slate-600">lock</span>
                            </div>
                            <div className="h-14 bg-slate-800/50 border border-slate-800 rounded-2xl flex items-center px-4 gap-3">
                                <span className="material-symbols-outlined text-slate-600">search</span>
                                <div className="h-2 w-32 bg-slate-700 rounded-full"></div>
                            </div>
                        </section>

                        {/* Helper Text */}
                        <div className="mt-10 p-5 bg-slate-800/30 rounded-2xl border border-slate-700/50 flex gap-4">
                            <div className="flex-shrink-0">
                                <span className="material-symbols-outlined text-blue-500">lightbulb</span>
                            </div>
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Selecting the correct location ensures stock counts are attributed to the right department. Location data is synced in real-time.
                            </p>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-slate-900/90 ios-blur border-t border-slate-800">
                        <div className="flex flex-col gap-3">
                            <button onClick={handleStart} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                        Connecting...
                                    </span>
                                ) : (
                                    <>
                                        <span>Continue to Floor</span>
                                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                                    </>
                                )}
                            </button>
                            <button onClick={() => navigate(-1)} className="w-full bg-transparent text-slate-500 font-semibold py-2 rounded-lg text-sm active:text-slate-300 transition-colors">
                                Cancel Session
                            </button>
                        </div>
                        <div className="h-6"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NewSession;