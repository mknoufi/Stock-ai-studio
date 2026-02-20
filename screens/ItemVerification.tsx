import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { HealthStrip } from '../components/HealthStrip';
import { useToast } from '../components/Toast';
import { useStock } from '../contexts/StockContext';
import { ErrorState } from '../components/UIStates';

const ItemVerification: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { items, verifyItem, isLoading } = useStock();
    const { showToast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const serialInputRef = useRef<HTMLInputElement>(null);
    
    const sku = searchParams.get('sku');
    const currentItem = items.find(i => i.sku === sku);

    // --- Counting State ---
    const [count, setCount] = useState(0);
    const [countingMode, setCountingMode] = useState<'simple' | 'split' | 'carton'>('simple');
    const [splitEntries, setSplitEntries] = useState<number[]>([]);
    const [splitInput, setSplitInput] = useState('');
    const [cartonCount, setCartonCount] = useState(0);
    const [unitsPerCarton, setUnitsPerCarton] = useState(1);
    const [looseUnits, setLooseUnits] = useState(0);

    // --- Batch Verification State ---
    const [batchCounts, setBatchCounts] = useState<{ [batchId: string]: number }>({});
    const [showZeroBatches, setShowZeroBatches] = useState(false);

    // --- Reverse Calc State ---
    const [showReverseCalc, setShowReverseCalc] = useState(false);
    const [reverseTotal, setReverseTotal] = useState('');

    // --- Attributes Verification State ---
    const [category, setCategory] = useState('');
    const [subCategory, setSubCategory] = useState('');
    const [mrpInput, setMrpInput] = useState('0'); 
    const [isDisplayItem, setIsDisplayItem] = useState(false);

    // --- Lifecycle & Dates State ---
    const [mfgDate, setMfgDate] = useState('');
    const [mfgFormat, setMfgFormat] = useState<'full' | 'month-year' | 'year-only'>('full');
    const [expiryDate, setExpiryDate] = useState('');
    
    // --- Serialization State ---
    const [isSerialized, setIsSerialized] = useState(false);
    const [serialList, setSerialList] = useState<string[]>([]);
    const [serialInput, setSerialInput] = useState('');
    const [isPartialVerify, setIsPartialVerify] = useState(false);

    // --- Damage & Governance State ---
    const [isDamaged, setIsDamaged] = useState(false);
    const [damagedQty, setDamagedQty] = useState(0);
    const [isReturnable, setIsReturnable] = useState(false);
    const [isTagged, setIsTagged] = useState(false);
    const [complaintNumber, setComplaintNumber] = useState('');
    const [narration, setNarration] = useState('');
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const hasBatches = currentItem?.batches && currentItem.batches.length > 0;

    // --- Load Data ---
    useEffect(() => {
        if (currentItem) {
            // Count
            if (currentItem.observedQty > 0) setCount(currentItem.observedQty);
            setCountingMode(currentItem.cartonConfig?.isCartonBased ? 'carton' : (currentItem.splitEntries?.length ? 'split' : 'simple'));
            if (currentItem.splitEntries) setSplitEntries(currentItem.splitEntries);
            if (currentItem.cartonConfig) {
                setCartonCount(currentItem.cartonConfig.cartonCount);
                setUnitsPerCarton(currentItem.cartonConfig.unitsPerCarton || 1);
            }

            // Attributes
            setCategory(currentItem.category || '');
            setSubCategory(currentItem.subCategory || '');
            setMrpInput(currentItem.mrp !== undefined ? currentItem.mrp.toString() : '0');
            setIsDisplayItem(currentItem.isDisplayItem || false);

            // Dates
            if (currentItem.manufacturingDate) setMfgDate(currentItem.manufacturingDate);
            if (currentItem.manufacturingDateFormat) setMfgFormat(currentItem.manufacturingDateFormat);
            if (currentItem.expiryDate) setExpiryDate(currentItem.expiryDate);

            // Serialization
            setIsSerialized(currentItem.isSerialized || false);
            // Load existing serials (Handle both single string legacy and array)
            if (currentItem.serialList && currentItem.serialList.length > 0) {
                setSerialList(currentItem.serialList);
            } else if (currentItem.serialNumber) {
                setSerialList([currentItem.serialNumber]);
            }

            // Damage
            setIsDamaged(currentItem.isDamaged || false);
            if (currentItem.damagedQty) setDamagedQty(currentItem.damagedQty);
            setIsReturnable(currentItem.isReturnable || false);
            setIsTagged(currentItem.isTagged || false);
            if (currentItem.complaintNumber) setComplaintNumber(currentItem.complaintNumber);
            if (currentItem.narration) setNarration(currentItem.narration);
            
            // Evidence
            if (currentItem.capturedImage) setCapturedImage(currentItem.capturedImage);
        }
    }, [currentItem]);

    // Recalculate total when counting inputs change
    useEffect(() => {
        if (hasBatches) {
            const totalBatchCount = Object.values(batchCounts).reduce((acc: number, curr: number) => acc + curr, 0);
            setCount(totalBatchCount);
        } else if (countingMode === 'split') {
            setCount(splitEntries.reduce((a: number, b: number) => a + b, 0));
        } else if (countingMode === 'carton') {
            setCount((cartonCount * unitsPerCarton) + looseUnits);
        }
    }, [countingMode, splitEntries, cartonCount, unitsPerCarton, looseUnits, batchCounts, hasBatches]);

    const handleBatchCountChange = (batchId: string, val: number) => {
        setBatchCounts(prev => ({
            ...prev,
            [batchId]: val >= 0 ? val : 0
        }));
    };

    const handleAddSplit = () => {
        const val = parseFloat(splitInput);
        if (!isNaN(val) && val > 0) {
            setSplitEntries([...splitEntries, val]);
            setSplitInput('');
        }
    };

    const applyReverseCalc = () => {
        const total = parseInt(reverseTotal);
        if (isNaN(total) || total <= 0) {
            showToast('Please enter a valid total quantity', 'warning');
            return;
        }
        if (cartonCount <= 0) {
            showToast('Enter Carton Count first', 'warning');
            return;
        }
        
        const units = Math.floor(total / cartonCount);
        const loose = total % cartonCount;
        
        setUnitsPerCarton(units);
        setLooseUnits(loose);
        setShowReverseCalc(false);
        setReverseTotal('');
        showToast(`Applied: ${units} units/carton + ${loose} loose`, 'success');
    };

    // --- Serial Number Logic ---
    const handleAddSerial = (e?: React.FormEvent) => {
        e?.preventDefault();
        const trimmed = serialInput.trim().toUpperCase();
        if (!trimmed) return;

        // Check Duplicates
        if (serialList.includes(trimmed)) {
            showToast('Duplicate Serial Number', 'warning');
            setSerialInput('');
            return;
        }

        // Similarity Validation (Basic Heuristic)
        if (serialList.length > 0) {
            const sample = serialList[0];
            // Length check
            if (Math.abs(sample.length - trimmed.length) > 2) {
                showToast('Format Warning: Serial length differs significantly from previous scans.', 'warning');
            }
            // Prefix check (first 3 chars)
            if (sample.length > 3 && trimmed.length > 3 && sample.substring(0, 3) !== trimmed.substring(0, 3)) {
                 showToast('Format Warning: Serial prefix mismatch.', 'warning');
            }
        }

        // Check Limit
        if (count > 0 && serialList.length >= count) {
            showToast(`Limit reached. Total count is ${count}.`, 'warning');
            return;
        }

        setSerialList([...serialList, trimmed]);
        setSerialInput('');
        // Keep focus for rapid scanning
        setTimeout(() => serialInputRef.current?.focus(), 50);
    };

    const handleRemoveSerial = (serial: string) => {
        setSerialList(serialList.filter(s => s !== serial));
    };

    const handleBulkPaste = () => {
        navigator.clipboard.readText().then(text => {
            const lines = text.split(/[\n,]+/).map(s => s.trim().toUpperCase()).filter(s => s);
            const uniqueNew = lines.filter(s => !serialList.includes(s));
            
            if (uniqueNew.length === 0) {
                showToast('No new unique serials found in clipboard', 'info');
                return;
            }

            const availableSlots = count > 0 ? count - serialList.length : 9999;
            const toAdd = uniqueNew.slice(0, availableSlots);

            setSerialList([...serialList, ...toAdd]);
            
            if (uniqueNew.length > availableSlots) {
                showToast(`Added ${toAdd.length} serials. Truncated excess based on count.`, 'warning');
            } else {
                showToast(`Bulk added ${toAdd.length} serials`, 'success');
            }
        }).catch(() => {
            showToast('Clipboard access denied', 'error');
        });
    };

    const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCapturedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleVerify = async () => {
        if (!currentItem) return;
        
        // --- Integrity Checks ---
        const variance = count - currentItem.systemQty;
        const isHighVariance = Math.abs(variance) > 5;
        
        if (isHighVariance && !narration && !isDamaged) {
            showToast('High variance requires a remark or damage flag.', 'warning');
            return;
        }

        // GOVERNANCE: MRP Validation
        const finalMrp = parseFloat(mrpInput);
        if (isNaN(finalMrp)) {
             showToast('Invalid MRP format.', 'error');
             return;
        }
        
        if (count > 0 && finalMrp <= 0) {
            showToast('Invalid MRP. Price must be greater than 0 for verified stock.', 'error');
            return;
        }

        // Damage Logic
        if (isDamaged) {
            if (damagedQty <= 0) {
                showToast('Please specify damaged quantity', 'error');
                return;
            }
            if (damagedQty > count) {
                showToast('Damaged quantity cannot exceed verified count', 'error');
                return;
            }
            if (!capturedImage) {
                showToast('Photo evidence is REQUIRED for damaged items.', 'error');
                return;
            }
            if (isReturnable && !complaintNumber && !isTagged) {
                if (!complaintNumber) {
                    showToast('Returnable items require a Complaint/RTV Number', 'warning');
                    return;
                }
            }
        }

        // Display Item Logic
        if (isDisplayItem && !capturedImage) {
            showToast('Photo is REQUIRED for Display/Demo items.', 'error');
            return;
        }

        // GOVERNANCE: Serialization Check
        if (isSerialized && count > 0) {
            if (serialList.length === 0) {
                 showToast('Serialized items require at least one scanned serial number.', 'error');
                 return;
            }
            if (serialList.length !== count && !isPartialVerify) {
                showToast(`Serial Mismatch: Count is ${count}, but scanned ${serialList.length}. Enable 'Partial Verify' to proceed.`, 'error');
                return;
            }
        }

        try {
            await verifyItem(currentItem.sku, count, currentItem.version, {
                category,
                subCategory,
                mrp: finalMrp,
                mrpVerified: true, 
                manufacturingDate: mfgDate,
                manufacturingDateFormat: mfgFormat,
                expiryDate,
                isSerialized,
                serialNumber: serialList[0] || '', // Legacy compatibility
                serialList: serialList, // Primary Truth
                isDamaged,
                damagedQty: isDamaged ? damagedQty : 0,
                isReturnable: isDamaged ? isReturnable : false,
                isTagged: (isDamaged && isReturnable) ? isTagged : false,
                complaintNumber: (isDamaged && isReturnable) ? complaintNumber : '',
                // If user uploaded a photo, we save it regardless of damage status
                capturedImage: capturedImage || undefined,
                isDisplayItem,
                narration: isPartialVerify && serialList.length !== count ? `${narration} [PARTIAL_SERIALS: ${serialList.length}/${count}]` : narration,
                splitEntries: countingMode === 'split' ? splitEntries : undefined,
                cartonConfig: countingMode === 'carton' ? { cartonCount, unitsPerCarton, isCartonBased: true } : undefined
            });
            
            if (isHighVariance) {
                showToast('High Variance Recorded - Supervisor Alerted', 'error');
            } else if (variance !== 0 || (isSerialized && serialList.length !== count)) {
                showToast('Variance/Partial Data Recorded - Sent for Approval', 'warning');
            } else {
                showToast('Item Verified Successfully', 'success');
            }
            navigate(-1);
        } catch (e) {
            showToast('Failed to verify item', 'error');
        }
    };

    if (!currentItem) return <ErrorState message="Item not found" onRetry={() => navigate(-1)} />;

    return (
        <div className="flex flex-col min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
            {/* Header */}
            <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 sticky top-0 z-20 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-lg font-bold leading-tight dark:text-white">{currentItem.name}</h1>
                        <p className="text-xs text-slate-500 font-mono">{currentItem.sku}</p>
                    </div>
                </div>
                
                {/* Master Data Strip */}
                <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Barcode</p>
                        <p className="text-xs font-mono font-bold truncate">{currentItem.autoBarcode || currentItem.manualBarcode || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Price</p>
                        <p className="text-xs font-mono font-bold">₹{currentItem.salePrice || 0}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">MRP</p>
                        <p className="text-xs font-mono font-bold">₹{currentItem.mrp}</p>
                    </div>
                    <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">UOM</p>
                        <p className="text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded inline-block">{currentItem.uom || 'PCS'}</p>
                    </div>
                </div>
                
                <div className="mt-3">
                   <HealthStrip variant="compact" />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto p-4 space-y-6 pb-32">
                
                {/* Counting Section */}
                <section className="bg-white dark:bg-surface-dark rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {/* Mode Toggle (Hidden if Multi-Batch active) */}
                    {!hasBatches && (
                        <div className="flex border-b border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setCountingMode('simple')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${countingMode === 'simple' ? 'bg-primary/10 text-primary dark:bg-blue-600/20 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                Simple
                            </button>
                            <button 
                                onClick={() => setCountingMode('split')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${countingMode === 'split' ? 'bg-primary/10 text-primary dark:bg-blue-600/20 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                Split Add
                            </button>
                            <button 
                                onClick={() => setCountingMode('carton')}
                                className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider ${countingMode === 'carton' ? 'bg-primary/10 text-primary dark:bg-blue-600/20 dark:text-blue-400' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                            >
                                Carton
                            </button>
                        </div>
                    )}

                    {hasBatches && (
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-3 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-purple-500">layers</span>
                                <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-widest">Multi-Batch Item</span>
                            </div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Show Zero Qty</span>
                                <input 
                                    type="checkbox" 
                                    checked={showZeroBatches} 
                                    onChange={(e) => setShowZeroBatches(e.target.checked)}
                                    className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 size-4" 
                                />
                            </label>
                        </div>
                    )}

                    <div className="p-6">
                        {/* BATCH VERIFICATION MODE */}
                        {hasBatches && (
                            <div className="space-y-4">
                                {currentItem.batches?.filter(b => b.systemQty > 0 || showZeroBatches).map((batch) => (
                                    <div key={batch.id} className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                                        <div className="flex-1">
                                            <p className="text-xs font-bold dark:text-white">{batch.batchNumber || 'NO BATCH ID'}</p>
                                            <div className="flex gap-2 text-[10px] text-slate-500 mt-1">
                                                <span className="bg-slate-100 dark:bg-slate-800 px-1 rounded">MRP: {batch.mrp}</span>
                                                <span className="bg-slate-100 dark:bg-slate-800 px-1 rounded">Exp: {batch.expiryDate || 'N/A'}</span>
                                            </div>
                                            <p className="text-[9px] text-slate-400 mt-1">ERP: {batch.systemQty}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => handleBatchCountChange(batch.id, (batchCounts[batch.id] || 0) - 1)}
                                                className="size-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 active:bg-slate-100"
                                            >
                                                <span className="material-symbols-outlined text-sm">remove</span>
                                            </button>
                                            <input 
                                                type="number"
                                                value={batchCounts[batch.id] || 0}
                                                onChange={(e) => handleBatchCountChange(batch.id, parseInt(e.target.value) || 0)}
                                                className="w-16 text-center font-bold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg py-1 text-lg dark:text-white"
                                            />
                                            <button 
                                                onClick={() => handleBatchCountChange(batch.id, (batchCounts[batch.id] || 0) + 1)}
                                                className="size-8 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center active:bg-purple-200"
                                            >
                                                <span className="material-symbols-outlined text-sm">add</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="pt-2 flex justify-between items-end">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Total Verified</span>
                                    <span className="text-3xl font-black text-purple-600 dark:text-purple-400">{count}</span>
                                </div>
                            </div>
                        )}

                        {/* SIMPLE COUNT MODE */}
                        {(!hasBatches && countingMode === 'simple') && (
                            <div className="flex items-center justify-center gap-6">
                                <button onClick={() => setCount(Math.max(0, count - 1))} className="size-14 rounded-full border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-400 active:scale-95 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">remove</span>
                                </button>
                                <div className="text-center w-32">
                                    <input 
                                        type="number" 
                                        value={count} 
                                        onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                                        className="text-5xl font-black text-center w-full bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-white"
                                    />
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Units</p>
                                </div>
                                <button onClick={() => setCount(count + 1)} className="size-14 rounded-full bg-primary dark:bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-primary/30 dark:shadow-blue-900/40 active:scale-95 transition-transform">
                                    <span className="material-symbols-outlined text-2xl">add</span>
                                </button>
                            </div>
                        )}

                        {/* SPLIT MODE */}
                        {(!hasBatches && countingMode === 'split') && (
                            <div>
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {splitEntries.map((val, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-mono font-bold flex items-center gap-2 dark:text-slate-200">
                                            {val}
                                            <button onClick={() => setSplitEntries(splitEntries.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">
                                                <span className="material-symbols-outlined text-[14px]">close</span>
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        placeholder="Add qty..."
                                        className="flex-1 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl p-3 dark:text-white"
                                        value={splitInput}
                                        onChange={(e) => setSplitInput(e.target.value)}
                                    />
                                    <button onClick={handleAddSplit} className="px-4 bg-slate-200 dark:bg-slate-700 rounded-xl font-bold text-slate-600 dark:text-slate-200">
                                        ADD
                                    </button>
                                </div>
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-slate-400 uppercase font-bold">Total Count</p>
                                    <p className="text-3xl font-black dark:text-white">{count}</p>
                                </div>
                            </div>
                        )}

                        {/* CARTON MODE */}
                        {(!hasBatches && countingMode === 'carton') && (
                            <div className="space-y-4">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Cartons</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl mt-1 font-bold text-lg p-3 dark:text-white"
                                            value={cartonCount}
                                            onChange={(e) => setCartonCount(parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Units/Carton</label>
                                        <input 
                                            type="number" 
                                            className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl mt-1 font-bold text-lg p-3 dark:text-white"
                                            value={unitsPerCarton}
                                            onChange={(e) => setUnitsPerCarton(parseInt(e.target.value) || 0)}
                                        />
                                    </div>
                                </div>

                                {/* Reverse Calculator Toggle */}
                                <div>
                                     <button 
                                        onClick={() => setShowReverseCalc(!showReverseCalc)}
                                        className="text-xs font-bold text-primary dark:text-blue-400 flex items-center gap-1 hover:underline"
                                    >
                                        <span className="material-symbols-outlined text-[16px]">calculate</span>
                                        {showReverseCalc ? 'Hide Calculator' : 'Calculate Units from Total'}
                                    </button>
                                    
                                    {showReverseCalc && (
                                        <div className="mt-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Known Total Quantity</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number" 
                                                    placeholder="Enter Total"
                                                    value={reverseTotal}
                                                    onChange={(e) => setReverseTotal(e.target.value)}
                                                    className="flex-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold dark:text-white"
                                                />
                                                <button 
                                                    onClick={applyReverseCalc}
                                                    className="bg-primary dark:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-xs shadow-sm"
                                                >
                                                    Calculate
                                                </button>
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-2">
                                                Formula: Total ({reverseTotal || '?'}) ÷ Cartons ({cartonCount || 0}) = Units/Carton + Loose
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Loose Units</label>
                                    <input 
                                        type="number" 
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl mt-1 font-bold text-lg p-3 dark:text-white"
                                        value={looseUnits}
                                        onChange={(e) => setLooseUnits(parseInt(e.target.value) || 0)}
                                    />
                                </div>
                                <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-end">
                                    <span className="text-xs font-bold text-slate-400">Calculated Total</span>
                                    <span className="text-3xl font-black dark:text-white">{count}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Batch Reference Section */}
                {hasBatches && (
                    <section className="space-y-4">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Batch Reference (ERP)</h3>
                        <div className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                            <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Batch No</th>
                                            <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">MRP</th>
                                            <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">Expiry</th>
                                            <th className="p-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap text-right">Sys Qty</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {currentItem.batches?.map((batch) => (
                                            <tr key={batch.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-3 text-xs font-bold font-mono dark:text-slate-200">{batch.batchNumber}</td>
                                                <td className="p-3 text-xs font-mono text-slate-600 dark:text-slate-400">₹{batch.mrp}</td>
                                                <td className="p-3 text-xs font-mono text-slate-600 dark:text-slate-400">{batch.expiryDate || '-'}</td>
                                                <td className="p-3 text-xs font-mono font-bold text-right dark:text-slate-200">{batch.systemQty}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                )}

                {/* Product Integrity & Attributes */}
                <section className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Product Details</h3>
                    
                    <div className="bg-white dark:bg-surface-dark p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">MRP (₹)</label>
                                <input 
                                    type="number" 
                                    step="0.01"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg mt-1 font-mono font-bold p-2 dark:text-white"
                                    value={mrpInput}
                                    onChange={(e) => setMrpInput(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Mfg Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg mt-1 font-mono font-bold p-2 dark:text-white"
                                    value={mfgDate}
                                    onChange={(e) => setMfgDate(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Expiry Date</label>
                                <input 
                                    type="date" 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg mt-1 font-mono font-bold p-2 dark:text-white"
                                    value={expiryDate}
                                    onChange={(e) => setExpiryDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Category</label>
                                <input 
                                    type="text"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg mt-1 font-bold p-2 dark:text-white"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        {/* Display Item Toggle */}
                         <div className="pt-2 border-t border-slate-100 dark:border-slate-700">
                             <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    checked={isDisplayItem} 
                                    onChange={(e) => setIsDisplayItem(e.target.checked)}
                                    className="size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" 
                                />
                                <div>
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200 block">Mark as Display / Demo Unit</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Requires Product Photo</span>
                                </div>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Serialization Section */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                         <div className="flex items-center gap-3">
                            <div className={`size-8 rounded-lg flex items-center justify-center ${isSerialized ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                <span className="material-symbols-outlined text-lg">qr_code_2</span>
                            </div>
                            <span className="text-sm font-bold dark:text-white">Serialized Item</span>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" checked={isSerialized} onChange={(e) => setIsSerialized(e.target.checked)} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                        </label>
                    </div>
                    
                    {isSerialized && (
                        <div className="p-4 animate-in slide-in-from-top-2 space-y-4">
                             {/* Validation Status Bar */}
                             <div className={`flex items-center justify-between p-3 rounded-lg border ${
                                 serialList.length === count 
                                    ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-400' 
                                    : 'bg-orange-50 border-orange-200 text-orange-700 dark:bg-orange-500/10 dark:border-orange-500/30 dark:text-orange-400'
                             }`}>
                                 <div className="flex items-center gap-2">
                                     <span className="material-symbols-outlined text-xl">
                                         {serialList.length === count ? 'check_circle' : 'pending'}
                                     </span>
                                     <span className="text-xs font-bold uppercase tracking-wide">
                                         {serialList.length === count ? 'Count Matched' : 'Scanning Required'}
                                     </span>
                                 </div>
                                 <div className="text-sm font-mono font-black">
                                     {serialList.length} / {count}
                                 </div>
                             </div>

                             {/* Input Area */}
                             <div className="flex gap-2">
                                <form onSubmit={handleAddSerial} className="flex-1 relative">
                                    <input 
                                        ref={serialInputRef}
                                        type="text"
                                        value={serialInput}
                                        onChange={(e) => setSerialInput(e.target.value)}
                                        placeholder="Scan Serial No."
                                        className="w-full bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold p-3 pr-10 dark:text-white focus:ring-2 focus:ring-primary uppercase placeholder:normal-case"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleBulkPaste} 
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary dark:hover:text-blue-400"
                                        title="Paste from Clipboard"
                                    >
                                        <span className="material-symbols-outlined text-lg">content_paste</span>
                                    </button>
                                </form>
                                <button 
                                    onClick={() => handleAddSerial()} 
                                    disabled={!serialInput}
                                    className="px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-bold disabled:opacity-50"
                                >
                                    ADD
                                </button>
                             </div>

                             {/* Partial Verify Toggle */}
                             {serialList.length > 0 && serialList.length !== count && (
                                 <label className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-lg cursor-pointer">
                                     <input 
                                         type="checkbox" 
                                         checked={isPartialVerify} 
                                         onChange={(e) => setIsPartialVerify(e.target.checked)}
                                         className="size-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500" 
                                     />
                                     <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                                         Allow Partial Verification (Pending Approval)
                                     </span>
                                 </label>
                             )}

                             {/* Chip List */}
                             {serialList.length > 0 && (
                                 <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                                     {serialList.map((sn, idx) => (
                                         <div key={`${sn}-${idx}`} className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800/50">
                                             <span className="text-xs font-mono font-bold">{sn}</span>
                                             <button onClick={() => handleRemoveSerial(sn)} className="text-blue-400 hover:text-red-500 flex items-center">
                                                 <span className="material-symbols-outlined text-[14px]">close</span>
                                             </button>
                                         </div>
                                     ))}
                                 </div>
                             )}
                        </div>
                    )}
                </section>

                {/* Damage & Governance */}
                 <div className={`bg-white dark:bg-surface-dark rounded-xl border-2 transition-colors overflow-hidden ${isDamaged ? 'border-red-500/50' : 'border-slate-200 dark:border-slate-700'}`}>
                     <div 
                        onClick={() => setIsDamaged(!isDamaged)}
                        className={`p-4 flex items-center justify-between cursor-pointer ${isDamaged ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`size-10 rounded-lg flex items-center justify-center ${isDamaged ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>
                                <span className="material-symbols-outlined">{isDamaged ? 'broken_image' : 'image'}</span>
                            </div>
                            <div>
                                    <p className={`text-sm font-bold ${isDamaged ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-300'}`}>
                                    {isDamaged ? 'Item is Damaged' : 'Mark as Damaged'}
                                    </p>
                                    <p className="text-xs text-slate-400">Report defects</p>
                            </div>
                        </div>
                        <div className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isDamaged ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isDamaged ? 'translate-x-5' : 'translate-x-0'}`}></div>
                        </div>
                    </div>

                    {isDamaged && (
                        <div className="p-4 border-t border-red-100 dark:border-red-900/30 bg-red-50/50 dark:bg-red-900/5 space-y-4 animate-in slide-in-from-top-2">
                            {/* Qty */}
                            <div>
                                <label className="text-[10px] font-bold uppercase text-red-800 dark:text-red-300 mb-1 block">Damaged Quantity</label>
                                <input 
                                    type="number" 
                                    value={damagedQty}
                                    onChange={(e) => setDamagedQty(parseInt(e.target.value) || 0)}
                                    className="w-full bg-white dark:bg-slate-800 border-red-200 dark:border-red-800 rounded-lg font-bold p-3 dark:text-white"
                                />
                            </div>

                            {/* Returnable Logic */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-red-100 dark:border-red-900/30 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={isReturnable} 
                                        onChange={(e) => setIsReturnable(e.target.checked)}
                                        className="size-4 rounded border-slate-300 text-red-600 focus:ring-red-500" 
                                    />
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Returnable to Vendor</span>
                                </label>

                                {isReturnable && (
                                    <div className="pl-3 border-l-2 border-red-200 dark:border-red-800 space-y-3">
                                        <label className="flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={isTagged} 
                                                onChange={(e) => setIsTagged(e.target.checked)}
                                                className="size-4 rounded border-slate-300 text-red-600 focus:ring-red-500" 
                                            />
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Red Tag Applied</span>
                                        </label>

                                        <div>
                                            <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Complaint / RTV Number</label>
                                            <input 
                                                type="text" 
                                                value={complaintNumber}
                                                onChange={(e) => setComplaintNumber(e.target.value)}
                                                placeholder="e.g. CMP-889"
                                                className="w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg text-sm p-3 dark:text-white"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Evidence / Product Photo Upload */}
                <section className="bg-white dark:bg-surface-dark rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                         <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-400">add_a_photo</span>
                            <h3 className="text-sm font-bold dark:text-white">
                                {isDamaged ? 'Damage Evidence' : (isDisplayItem ? 'Display Unit Photo' : 'Product Photo')}
                            </h3>
                         </div>
                         <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${
                             isDamaged || isDisplayItem 
                             ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' 
                             : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                         }`}>
                             {isDamaged || isDisplayItem ? 'Required' : 'Optional'}
                         </span>
                    </div>
                    <div className="p-4">
                        <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                            {capturedImage ? (
                                <div className="relative w-full">
                                    <img src={capturedImage} alt="Evidence" className="w-full h-40 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
                                    <button 
                                        onClick={() => setCapturedImage(null)}
                                        className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full shadow-lg"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center gap-2 py-6 w-full text-slate-400 hover:text-primary dark:hover:text-blue-400 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-3xl">add_a_photo</span>
                                    <span className="text-xs font-bold uppercase">Tap to Upload</span>
                                </button>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                accept="image/*" 
                                capture="environment" 
                                className="hidden" 
                                onChange={handleImageCapture}
                            />
                        </div>
                    </div>
                </section>

                {/* Narration */}
                <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Remarks / Narration</label>
                    <textarea 
                        value={narration}
                        onChange={(e) => setNarration(e.target.value)}
                        className="w-full bg-white dark:bg-surface-dark border-slate-200 dark:border-slate-700 rounded-xl text-sm p-4 min-h-[80px] dark:text-white"
                        placeholder="Add notes..."
                    ></textarea>
                </div>
            </main>

            {/* Footer Action */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 sticky bottom-0 z-50">
                <button 
                    onClick={handleVerify} 
                    disabled={isLoading}
                    className="w-full h-14 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-sm uppercase flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] transition-all disabled:opacity-50"
                >
                    {isLoading ? 'Processing...' : 'Verify & Commit'}
                </button>
            </div>
        </div>
    );
};

export default ItemVerification;