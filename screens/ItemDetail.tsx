import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useStock } from '../contexts/StockContext';
import { ErrorState } from '../components/UIStates';

const ItemDetail: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { items, addBatch, user } = useStock();
    const sku = searchParams.get('sku');
    const item = items.find(i => i.sku === sku);

    // Add Batch State
    const [isAddBatchOpen, setIsAddBatchOpen] = React.useState(false);
    const [newBatchNo, setNewBatchNo] = React.useState('');
    const [newBatchMrp, setNewBatchMrp] = React.useState('');
    const [newBatchExpiry, setNewBatchExpiry] = React.useState('');
    const [newBatchQty, setNewBatchQty] = React.useState('');

    if (!item) return <ErrorState message="Item not found" onRetry={() => navigate(-1)} />;

    const canAddBatch = user && ['supervisor', 'admin'].includes(user.role);

    const handleAddBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item || !newBatchNo || !newBatchMrp || !newBatchQty) return;

        await addBatch(item.sku, {
            id: crypto.randomUUID(),
            batchNumber: newBatchNo,
            mrp: parseFloat(newBatchMrp),
            expiryDate: newBatchExpiry,
            systemQty: parseInt(newBatchQty)
        });

        setIsAddBatchOpen(false);
        setNewBatchNo('');
        setNewBatchMrp('');
        setNewBatchExpiry('');
        setNewBatchQty('');
    };

    const InfoRow = ({ label, value, mono = false }: { label: string, value: string | number | undefined, mono?: boolean }) => (
        <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</span>
            <span className={`text-sm font-bold dark:text-slate-200 text-right ${mono ? 'font-mono' : ''}`}>
                {value !== undefined && value !== '' ? value : '-'}
            </span>
        </div>
    );

    const SectionHeader = ({ title, icon }: { title: string, icon: string }) => (
        <div className="flex items-center gap-2 mb-3 text-primary dark:text-blue-400">
            <span className="material-symbols-outlined text-lg">{icon}</span>
            <h3 className="text-xs font-black uppercase tracking-widest">{title}</h3>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <h1 className="text-lg font-bold leading-tight dark:text-white">Item Master Data</h1>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Hero Section */}
                <div className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex gap-4 items-start">
                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                        {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">inventory_2</span>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-bold leading-tight dark:text-white mb-1">{item.name}</h2>
                        <p className="text-xs text-slate-500 font-mono mb-2">{item.sku}</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'verified' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            item.status === 'pending_approval' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                            item.status === 'conflict' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                            item.status === 'assigned_recount' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                            <span className={`size-1.5 rounded-full ${
                                item.status === 'verified' ? 'bg-green-500' :
                                item.status === 'pending_approval' ? 'bg-red-500' :
                                item.status === 'conflict' ? 'bg-orange-500' :
                                item.status === 'assigned_recount' ? 'bg-purple-500' :
                                'bg-slate-400'
                            }`}></span>
                            {item.status.replace('_', ' ')}
                        </span>
                    </div>
                </div>

                {/* Stock & Pricing */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <SectionHeader title="Stock & Pricing" icon="payments" />
                    <InfoRow label="System Quantity" value={item.systemQty} mono />
                    <InfoRow label="MRP" value={`₹${item.mrp}`} mono />
                    <InfoRow label="Sale Price" value={`₹${item.salePrice}`} mono />
                    <InfoRow label="Tax Percentage" value={`${item.taxPercentage}%`} mono />
                    <InfoRow label="HSN Code" value={item.hsnCode} mono />
                    <InfoRow label="Unit of Measure" value={item.uom?.toUpperCase()} />
                    {item.status !== 'pending' && (
                        <div className="flex justify-between py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Verified</span>
                            <div className="text-right">
                                <span className="block text-sm font-bold dark:text-slate-200">{item.lastUser}</span>
                                <span className="block text-[10px] font-mono text-slate-400">{new Date(item.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </section>

                {/* Classification */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <SectionHeader title="Classification" icon="category" />
                    <InfoRow label="Category" value={item.category} />
                    <InfoRow label="Sub-Category" value={item.subCategory} />
                    <InfoRow label="Brand" value={item.brand} />
                </section>

                {/* Barcodes */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <SectionHeader title="Identification" icon="qr_code" />
                    <InfoRow label="Item Code" value={item.itemCode} mono />
                    <InfoRow label="Auto Barcode" value={item.autoBarcode} mono />
                    <InfoRow label="Manual Barcode" value={item.manualBarcode} mono />
                </section>

                {/* Supplier Info */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <SectionHeader title="Last Purchase Info" icon="local_shipping" />
                    <InfoRow label="Supplier" value={item.lastSupplier} />
                    <InfoRow label="Date" value={item.lastPurchaseDate} mono />
                    <InfoRow label="Document Type" value={item.lastPurchaseDocType} />
                    <InfoRow label="Purchase Qty" value={item.lastPurchaseQty} mono />
                    <InfoRow label="Cost Price" value={`₹${item.lastPurchaseCost}`} mono />
                </section>

                {/* Batches (if any) */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                        <SectionHeader title="Batch Inventory" icon="layers" />
                        {canAddBatch && (
                            <button 
                                onClick={() => setIsAddBatchOpen(true)}
                                className="text-xs font-bold text-primary dark:text-blue-400 flex items-center gap-1 hover:underline"
                            >
                                <span className="material-symbols-outlined text-sm">add</span>
                                Add Batch
                            </button>
                        )}
                    </div>
                    
                    {item.batches && item.batches.length > 0 ? (
                        <div className="overflow-x-auto -mx-5 px-5">
                            <table className="w-full text-left border-collapse min-w-[300px]">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800">
                                        <th className="py-2 text-[10px] font-bold text-slate-400 uppercase">Batch No</th>
                                        <th className="py-2 text-[10px] font-bold text-slate-400 uppercase">MRP</th>
                                        <th className="py-2 text-[10px] font-bold text-slate-400 uppercase">Expiry</th>
                                        <th className="py-2 text-[10px] font-bold text-slate-400 uppercase text-right">Qty</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {item.batches.map(batch => (
                                        <tr key={batch.id}>
                                            <td className="py-2 text-xs font-mono font-bold dark:text-slate-200">{batch.batchNumber}</td>
                                            <td className="py-2 text-xs font-mono text-slate-500">₹{batch.mrp}</td>
                                            <td className="py-2 text-xs font-mono text-slate-500">{batch.expiryDate || '-'}</td>
                                            <td className="py-2 text-xs font-mono font-bold text-right dark:text-slate-200">{batch.systemQty}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-slate-400">
                            <p className="text-xs">No batches recorded.</p>
                        </div>
                    )}
                </section>
            </main>

            {/* Add Batch Modal */}
            {isAddBatchOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-surface-dark w-full max-w-sm rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="font-bold text-lg dark:text-white">Add New Batch</h3>
                            <button onClick={() => setIsAddBatchOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleAddBatch} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Batch Number</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold dark:text-white focus:ring-2 focus:ring-primary"
                                    value={newBatchNo}
                                    onChange={(e) => setNewBatchNo(e.target.value)}
                                    placeholder="e.g. BATCH-001"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">MRP</label>
                                    <input 
                                        type="number" 
                                        required
                                        step="0.01"
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold dark:text-white focus:ring-2 focus:ring-primary"
                                        value={newBatchMrp}
                                        onChange={(e) => setNewBatchMrp(e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                                    <input 
                                        type="number" 
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold dark:text-white focus:ring-2 focus:ring-primary"
                                        value={newBatchQty}
                                        onChange={(e) => setNewBatchQty(e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expiry Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2.5 font-bold dark:text-white focus:ring-2 focus:ring-primary"
                                    value={newBatchExpiry}
                                    onChange={(e) => setNewBatchExpiry(e.target.value)}
                                />
                            </div>
                            <button 
                                type="submit"
                                className="w-full bg-primary dark:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all"
                            >
                                Add Batch Entry
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;
