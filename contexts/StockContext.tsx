import React, { createContext, useContext, useState, useEffect } from 'react';
import { StockItem, VarianceItem, ConflictItem, Mutation, Notification, BatchEntry } from '../types';
import { api } from '../api';

interface User {
  id: string;
  name: string;
  role: 'staff' | 'supervisor' | 'admin';
}

interface Session {
  id: string;
  location: string;
  floor: string;
  rack: string;
  startTime: string;
  snapshotHash: string;
}

interface StockContextType {
  user: User | null;
  activeSession: Session | null;
  items: StockItem[];
  variances: VarianceItem[];
  conflicts: ConflictItem[];
  notifications: Notification[];
  queue: Mutation[];
  isLoading: boolean;
  error: string | null;
  isOffline: boolean;
  login: (username: string) => Promise<void>;
  logout: () => void;
  startSession: (location: string, floor: string, rack: string) => Promise<void>;
  verifyItem: (sku: string, qty: number, version: number, details: Partial<StockItem>) => Promise<void>;
  addItem: (sku: string) => Promise<void>;
  refreshSingleItem: (sku: string) => Promise<void>;
  endSession: () => Promise<void>;
  getMetrics: () => { scanned: number; verified: number; pending: number; efficiency: number };
  resolveConflict: (id: string, resolution: 'local' | 'server') => Promise<void>;
  approveVariance: (id: string) => Promise<void>;
  assignRecount: (sku: string, staffName: string) => Promise<void>;
  markNotificationRead: (id: string) => void;
  adminAction: (action: string) => Promise<void>;
  clearError: () => void;
  toggleConnectivity: () => void;
}

const StockContext = createContext<StockContextType | undefined>(undefined);

const STORAGE_KEY = 'LAVANYA_STOCK_DATA_V1';

export const StockProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [items, setItems] = useState<StockItem[]>([]);
  const [variances, setVariances] = useState<VarianceItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [queue, setQueue] = useState<Mutation[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);

  const clearError = () => setError(null);
  const toggleConnectivity = () => setIsOffline(prev => !prev);

  // Persistence
  useEffect(() => {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.user) setUser(parsed.user);
            if (parsed.activeSession) setActiveSession(parsed.activeSession);
            if (parsed.items) setItems(parsed.items);
            if (parsed.variances) setVariances(parsed.variances);
            if (parsed.conflicts) setConflicts(parsed.conflicts);
            if (parsed.notifications) setNotifications(parsed.notifications);
            if (parsed.queue) {
                const recoveredQueue = parsed.queue.map((m: Mutation) => 
                    m.status === 'syncing' ? { ...m, status: 'pending' } : m
                );
                setQueue(recoveredQueue);
            }
        }
    } catch (e) {
        console.error("Rehydration failed", e);
    }
  }, []);

  useEffect(() => {
    const state = { user, activeSession, items, variances, conflicts, notifications, queue };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [user, activeSession, items, variances, conflicts, notifications, queue]);

  // Queue Processor
  useEffect(() => {
    if (queue.length > 0 && !isOffline) {
        const timer = setTimeout(() => {
            processQueue();
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [queue, isOffline]);

  const processQueue = async () => {
    const pending = queue.find(m => m.status === 'pending');
    if (!pending || !activeSession) return;

    try {
        setQueue(prev => prev.map(m => m.id === pending.id ? { ...m, status: 'syncing' } : m));
        
        switch (pending.type) {
          case 'VERIFY':
            // Include the system_qty at the time of verification for backend audit
            
            // SIMULATE CONFLICT for SKUs ending in '9' (Demo Logic)
            if (pending.payload.sku.endsWith('9')) {
                // Simulate network delay then throw 409
                await new Promise(r => setTimeout(r, 800));
                const conflictError: any = new Error("Conflict");
                conflictError.response = {
                    status: 409,
                    data: {
                        serverVersion: pending.payload.version + 1,
                        serverQty: Math.floor(pending.payload.qty * 1.5) + 2, // Simulate different server state
                        serverUser: "Supervisor Sarah"
                    }
                };
                throw conflictError;
            }

            await api.verifyItem(activeSession.id, {
              sku: pending.payload.sku,
              observed_qty: pending.payload.qty,
              expected_version: pending.payload.version,
              idempotency_key: pending.idempotencyKey,
              system_qty_at_verification: pending.payload.systemQtySnapshot, 
              ...pending.payload.details
            });
            break;
          case 'ADD':
            await api.addItem(activeSession.id, {
              sku: pending.payload.sku,
              idempotency_key: pending.idempotencyKey
            });
            break;
          case 'RESOLVE':
            await api.resolveConflict(pending.payload.conflictId, {
              resolution: pending.payload.resolution,
              idempotency_key: pending.idempotencyKey
            });
            break;
          case 'ASSIGN_RECOUNT':
            // In a real app, this sends a push notification to the assigned user
            console.log(`Recount assigned to ${pending.payload.staffName} for SKU ${pending.payload.sku}`);
            break;
        }

        setQueue(prev => prev.filter(m => m.id !== pending.id));
    } catch (e: any) {
        setQueue(prev => prev.map(m => m.id === pending.id ? { ...m, status: 'failed', retryCount: m.retryCount + 1 } : m));
        
        if (e.response?.status === 409) {
          const serverData = e.response.data;
          const conflictItem: ConflictItem = {
              id: crypto.randomUUID(),
              name: items.find(i => i.sku === pending.payload.sku)?.name || 'Unknown Item',
              sku: pending.payload.sku,
              localCount: pending.payload.qty,
              serverCount: serverData.serverQty || 0,
              localUser: user?.name || 'Me',
              localTime: new Date().toISOString(),
              serverSource: serverData.serverUser || 'System',
              serverTime: new Date().toISOString(),
              versionMismatch: {
                  local: pending.payload.version,
                  remote: serverData.serverVersion || (pending.payload.version + 1)
              }
          };
          
          setConflicts(prev => [...prev.filter(c => c.sku !== pending.payload.sku), conflictItem]);
          setItems(prev => prev.map(i => i.sku === pending.payload.sku ? { ...i, status: 'conflict' } : i));
          setError(`Conflict Detected: ${pending.payload.sku}. Please resolve.`);
        } else {
          setError(`Sync error for ${pending.type}. Retrying later...`);
        }
    }
  };

  const login = async (username: string) => {
    setIsLoading(true);
    try {
      const res = await api.login({ username, device_id: 'BROWSER-WEB-01' });
      setUser(res.user);
      localStorage.setItem('AUTH_TOKEN', res.token);
    } catch (e) {
      if (username.toLowerCase().includes('admin')) setUser({ id: 'u1', name: 'System Admin', role: 'admin' });
      else if (username.toLowerCase().includes('sup')) setUser({ id: 'u2', name: 'Sarah Supervisor', role: 'supervisor' });
      else setUser({ id: 'u3', name: 'Rahul Staff', role: 'staff' });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setActiveSession(null);
    setItems([]);
    setQueue([]);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('AUTH_TOKEN');
  };

  const startSession = async (location: string, floor: string, rack: string) => {
      setIsLoading(true);
      try {
        const res = await api.startSession({ location, floor, rack, idempotency_key: crypto.randomUUID() });
        setActiveSession({ id: res.session_id, location, floor, rack, startTime: new Date().toISOString(), snapshotHash: res.snapshot_hash });
        setItems(res.items);
      } catch (e) {
        // MOCK DATA
        const mockItems: StockItem[] = Array.from({ length: 6 }).map((_, i) => {
            
            // SIMULATE MULTI-BATCH ITEMS for every 3rd item
            let mockBatches: BatchEntry[] = [];
            let totalSysQty = 10 + i * 2;
            let mrp = 999 + (i * 100);

            if (i % 3 === 0) {
               mockBatches = [
                   { id: `b-${i}-1`, batchNumber: 'BATCH-A1', mrp: mrp, systemQty: totalSysQty - 5, expiryDate: '2024-12-31' },
                   { id: `b-${i}-2`, batchNumber: 'BATCH-A2', mrp: mrp + 50, systemQty: 5, expiryDate: '2025-06-30' },
                   { id: `b-${i}-3`, batchNumber: 'BATCH-OLD', mrp: mrp - 50, systemQty: 0, expiryDate: '2023-01-01' }, // Zero qty batch
               ];
            }

            return {
                id: `item-${i}`,
                name: i % 2 === 0 ? `Premium Cotton Shirt ${i}` : `Denim Jeans Slim ${i}`,
                sku: `SKU-100${i}`,
                image: '',
                status: 'pending',
                timestamp: new Date().toISOString(),
                systemQty: totalSysQty,
                snapshotQty: 0,
                observedQty: 0,
                version: 1,
                lastUser: 'System',
                locationRef: rack,
                category: 'Apparel',
                subCategory: i % 2 === 0 ? 'Topwear' : 'Bottomwear',
                mrp: mrp,
                mrpVerified: false,
                isDamaged: false,
                damagedQty: 0,
                isSerialized: false,
                serialList: [],
                isDisplayItem: false,
                uom: i === 3 ? 'kg' : 'pcs', 
                splitEntries: [],
                cartonConfig: { cartonCount: 0, unitsPerCarton: 0, isCartonBased: false },
                isUnidentified: false,
                batches: mockBatches,
                itemCode: `SKU-100${i}`,
                manualBarcode: `MAN-8821${i}`,
                autoBarcode: `AUTO-9932${i}`,
                salePrice: 899 + (i * 100),
                taxPercentage: 18,
                hsnCode: '6205',
                brand: 'Lavanya Basics',
                lastPurchaseQty: 50,
                lastPurchaseDate: '2023-10-15',
                lastPurchasePrice: 450,
                lastPurchaseCost: 470, 
                lastSupplier: 'Global Fabrics Ltd',
                lastPurchaseDocType: 'GRN-Direct'
            };
        });

        setActiveSession({ id: 'mock-session-001', location, floor, rack, startTime: new Date().toISOString(), snapshotHash: 'SHA-256-MOCK-HASH' });
        setItems(mockItems);
      } finally {
        setIsLoading(false);
      }
  };

  const refreshSingleItem = async (sku: string) => {
      if (isOffline) return;
      try {
          await new Promise(r => setTimeout(r, 600)); 
          const randomChange = Math.floor(Math.random() * 3);
          setItems(prev => prev.map(item => {
              if (item.sku === sku) {
                  return {
                      ...item,
                      systemQty: Math.max(0, item.systemQty - randomChange),
                      lastPurchasePrice: item.lastPurchasePrice, 
                  }
              }
              return item;
          }));
      } catch (e) {
          console.error("Failed to refresh item JIT", e);
          throw new Error("JIT_SYNC_FAILED");
      }
  };

  const verifyItem = async (sku: string, qty: number, version: number, details: Partial<StockItem>) => {
    const currentItem = items.find(i => i.sku === sku);
    if (!currentItem) return;

    // --- AUTO-VERIFY LOGIC ---
    // If physical matches system, it is auto-verified.
    // If mismatch, it goes to 'pending_approval' (Variance).
    const isVariance = qty !== currentItem.systemQty;
    const newStatus = isVariance ? 'pending_approval' : 'verified';

    // Update item locally
    setItems(prev => prev.map(item => 
      item.sku === sku ? { 
        ...item, 
        ...details,
        status: newStatus, 
        observedQty: qty, 
        version: version + 1, 
        lastUser: user?.name || 'unknown'
      } : item
    ));

    // If it was a recount request, resolve the notification
    setNotifications(prev => prev.map(n => 
        (n.sku === sku && !n.isRead) ? { ...n, isRead: true } : n
    ));

    // Governance: Variance List Management
    if (isVariance) {
        const severity = Math.abs(qty - currentItem.systemQty) > 5 ? 'high' : 'medium';
        const varianceItem: VarianceItem = {
            id: crypto.randomUUID(),
            name: currentItem.name,
            sku: currentItem.sku,
            image: currentItem.image,
            severity: severity,
            systemCount: currentItem.systemQty,
            physicalCount: qty,
            variance: qty - currentItem.systemQty,
            sessionLocation: activeSession?.rack || 'Unknown'
        };
        // Avoid duplicate variance entries for same SKU
        setVariances(prev => [...prev.filter(v => v.sku !== sku), varianceItem]);
    } else {
        // Remove from variances if corrected
        setVariances(prev => prev.filter(v => v.sku !== sku));
    }

    const mutation: Mutation = {
      id: crypto.randomUUID(), 
      type: 'VERIFY', 
      payload: { 
          sku, 
          qty, 
          version, 
          details,
          systemQtySnapshot: currentItem.systemQty || 0 
      },
      idempotencyKey: crypto.randomUUID(), 
      timestamp: Date.now(), 
      status: 'pending', 
      retryCount: 0
    };
    setQueue(prev => [...prev, mutation]);
  };

  const addItem = async (sku: string) => {
     const cleanSku = sku || `NEW-${Math.floor(Math.random()*1000)}`;
     
     // DUPLICATE BLOCK: Check duplicate WITHIN this session (Location/Rack)
     // Same SKU allowed in different sessions (implied by backend isolation), but not same rack twice.
     const duplicate = items.find(i => i.sku === cleanSku);
     if (duplicate) {
        throw new Error('DUPLICATE_SCAN: Item already verified in this session.');
     }

     const newItem: StockItem = {
         id: Date.now().toString(), 
         name: 'New Scanned Item (Unlisted)', // Generic Name
         sku: cleanSku,
         image: '', 
         status: 'pending', 
         timestamp: new Date().toISOString(),
         systemQty: 0,
         snapshotQty: 0, 
         observedQty: 0, 
         version: 1, 
         lastUser: user?.name || 'unknown', 
         locationRef: activeSession?.rack || '',
         category: 'Uncategorized', 
         subCategory: 'General', 
         mrp: 0, 
         mrpVerified: false, 
         isDamaged: false, 
         damagedQty: 0,
         // Defaults
         isSerialized: false,
         serialList: [],
         isDisplayItem: false,
         // UNIDENTIFIED FLAG
         isUnidentified: true, // Flag as needing details
         uom: 'pcs',
         splitEntries: [],
         cartonConfig: { cartonCount: 0, unitsPerCarton: 0, isCartonBased: false },
         itemCode: cleanSku,
         manualBarcode: '',
         autoBarcode: '',
         salePrice: 0,
         taxPercentage: 0,
         hsnCode: '',
         brand: 'Unknown',
         lastPurchaseQty: 0,
         lastPurchaseDate: '',
         lastPurchasePrice: 0,
         lastPurchaseCost: 0,
         lastSupplier: '',
         lastPurchaseDocType: ''
     };
     setItems(prev => [newItem, ...prev]);
     const mutation: Mutation = {
      id: crypto.randomUUID(), 
      type: 'ADD', 
      payload: { sku: newItem.sku },
      idempotencyKey: crypto.randomUUID(), 
      timestamp: Date.now(), 
      status: 'pending', 
      retryCount: 0
    };
    setQueue(prev => [...prev, mutation]);
  };

  const endSession = async () => {
    if (!activeSession) return;
    setIsLoading(true);
    try {
      await api.endSession(activeSession.id);
      setActiveSession(null);
      setItems([]);
    } catch (e) {
      setActiveSession(null);
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveConflict = async (id: string, resolution: 'local' | 'server') => {
    setIsLoading(true);
    const mutation: Mutation = {
      id: crypto.randomUUID(), type: 'RESOLVE', payload: { conflictId: id, resolution },
      idempotencyKey: crypto.randomUUID(), timestamp: Date.now(), status: 'pending', retryCount: 0
    };
    setQueue(prev => [...prev, mutation]);
    setConflicts(prev => prev.filter(c => c.id !== id));
    setIsLoading(false);
  };

  const approveVariance = async (id: string) => {
    setIsLoading(true);
    try {
      await api.approveVariance(id);
      // Update local item status if applicable
      const variance = variances.find(v => v.id === id);
      if (variance) {
        setItems(prev => prev.map(i => i.sku === variance.sku ? { ...i, status: 'verified' } : i));
      }
      setVariances(prev => prev.filter(v => v.id !== id));
    } catch (e) {
      setVariances(prev => prev.filter(v => v.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  // SUPERVISOR: Assign Recount
  const assignRecount = async (sku: string, staffName: string) => {
      // 1. Create Notification for the assigned user (Simulated)
      const newNotif: Notification = {
          id: crypto.randomUUID(),
          type: 'recount_request',
          title: 'Recount Task Assigned',
          message: `${staffName}, please recount SKU: ${sku} immediately.`,
          sku: sku,
          location: activeSession?.rack || 'Unknown',
          timestamp: Date.now(),
          isRead: false
      };
      
      // 2. Update item status to reflect reassignment
      setItems(prev => prev.map(i => i.sku === sku ? { ...i, status: 'assigned_recount' } : i));
      
      // 3. Push to notification state (In real app, this is done via WebSocket/SSE)
      setNotifications(prev => [newNotif, ...prev]);

      const mutation: Mutation = {
          id: crypto.randomUUID(),
          type: 'ASSIGN_RECOUNT',
          payload: { sku, staffName },
          idempotencyKey: crypto.randomUUID(),
          timestamp: Date.now(),
          status: 'pending',
          retryCount: 0
      };
      setQueue(prev => [...prev, mutation]);
  };

  const markNotificationRead = (id: string) => {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const adminAction = async (action: string) => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsLoading(false);
  };

  const getMetrics = () => {
    const total = items.length;
    if (total === 0) return { scanned: 0, verified: 0, pending: 0, efficiency: 0 };
    const verified = items.filter(i => i.status === 'verified').length;
    const pending = items.filter(i => i.status !== 'verified').length;
    return { scanned: total, verified, pending, efficiency: Math.round((verified / total) * 100) };
  };

  return (
    <StockContext.Provider value={{ 
        user, activeSession, items, variances, conflicts, notifications, queue, isLoading, error, isOffline,
        login, logout, startSession, verifyItem, addItem, refreshSingleItem, endSession, getMetrics, 
        resolveConflict, approveVariance, assignRecount, markNotificationRead, adminAction, clearError, toggleConnectivity 
    }}>
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) throw new Error('useStock must be used within a StockProvider');
  return context;
};