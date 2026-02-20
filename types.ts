
export interface BatchEntry {
  id: string;
  batchNumber: string;
  mrp: number;
  expiryDate?: string;
  systemQty: number; // ERP quantity for this specific batch
}

export interface StockItem {
  id: string;
  name: string;
  sku: string; // Mapped to 'Item Code'
  image: string;
  status: 'verified' | 'pending' | 'conflict' | 'pending_approval' | 'assigned_recount';
  timestamp: string;
  
  // --- THE THREE TRUTHS ---
  systemQty: number;      // 1. ERP Observed Total (Read-only, SQL). Global reference.
  snapshotQty: number;    // 2. Session Snapshot Total (Immutable). Audit baseline.
  observedQty: number;    // 3. Verified Total (Mongo SoT). Mutable operational truth.
  
  // --- GOVERNANCE ---
  version: number;        // Optimistic Locking Version
  lastUser: string;       // Audit: Last modifier
  locationRef: string;    // Mongo Overlay Location

  // --- GRANULAR AUDIT DETAILS (Mutable during Verification) ---
  category: string;
  subCategory: string;
  mrp: number;
  mrpVerified: boolean;
  
  // Lifecycle & Dates
  manufacturingDate?: string; 
  manufacturingDateFormat?: 'full' | 'month-year' | 'year-only'; // Metadata for parsing
  expiryDate?: string;

  // Evidence & Serialization
  isSerialized?: boolean;       
  serialNumber?: string;        // Primary serial number if single item
  serialList?: string[];        // If serialized and count > 1
  
  // Damage Governance
  isDamaged: boolean;
  damagedQty: number;
  isReturnable?: boolean;
  isTagged?: boolean;           // "Red Tag" physically applied
  complaintNumber?: string;     // RTV / CRM Ticket ID
  narration?: string;

  // --- EVIDENCE ---
  capturedImage?: string;       // Base64 evidence photo
  isDisplayItem?: boolean;      // Mark as Display/Demo unit
  batchNumber?: string;         // For items with same SKU but different batch/mrp
  
  // --- BULK & CARTON LOGIC ---
  uom?: string;                 // 'pcs', 'kg', 'm', 'ltr', 'box'
  isUnidentified?: boolean;     // If true, name/desc was missing and user added it
  splitEntries?: number[];      // Log of split adds: [5, 10, 2.5]
  cartonConfig?: {
      cartonCount: number;
      unitsPerCarton: number;
      isCartonBased: boolean;
  };

  // --- BATCH MANAGEMENT ---
  batches?: BatchEntry[];     // List of known batches from ERP

  // --- ERP REFERENCE DATA (Read-Only Source) ---
  itemCode: string;
  manualBarcode: string;
  autoBarcode: string;
  salePrice: number;
  taxPercentage: number;
  hsnCode: string;
  brand: string;
  lastPurchaseQty: number;
  lastPurchaseDate: string;
  lastPurchasePrice: number;
  lastPurchaseCost: number;
  lastSupplier: string;
  lastPurchaseDocType: string;
}

export interface VarianceItem {
  id: string;
  name: string;
  sku: string;
  image: string;
  severity: 'high' | 'medium' | 'low';
  systemCount: number;
  physicalCount: number;
  variance: number;
  sessionLocation: string; // To help supervisor know where this variance occurred
}

export interface ConflictItem {
  id: string;
  name: string;
  sku: string;
  localCount: number;
  serverCount: number;
  localUser: string;
  localTime: string;
  serverSource: string;
  serverTime: string;
  versionMismatch: {
    local: number;
    remote: number;
  };
}

export interface Notification {
  id: string;
  type: 'recount_request';
  title: string;
  message: string;
  sku: string;
  location: string;
  timestamp: number;
  isRead: boolean;
}

export interface Mutation {
  id: string;
  type: 'VERIFY' | 'ADD' | 'RESOLVE' | 'SESSION_START' | 'SESSION_END' | 'ASSIGN_RECOUNT';
  payload: any;
  idempotencyKey: string;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  retryCount: number;
}
