import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { StockItem, VarianceItem, ConflictItem } from './types';

/**
 * GOVERNANCE CONTRACTS (DTOs)
 */

export interface LoginRequest {
  username: string;
  device_id: string;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    role: 'staff' | 'supervisor' | 'admin';
  };
  token: string;
}

export interface SessionStartRequest {
  location: string;
  floor: string;
  rack: string;
  idempotency_key: string;
}

export interface SessionStartResponse {
  session_id: string;
  snapshot_hash: string;
  items: StockItem[];
}

export interface VerifyStockRequest {
  sku: string;
  observed_qty: number;
  expected_version: number;
  idempotency_key: string;
  system_qty_at_verification: number; // Audit: What was SQL showing when user clicked commit?
  
  // Governance & Attribute Fields (Optional)
  category?: string;
  subCategory?: string;
  mrp?: number;
  mrpVerified?: boolean;
  manufacturingDate?: string;
  manufacturingDateFormat?: 'full' | 'month-year' | 'year-only';
  expiryDate?: string;
  isSerialized?: boolean;
  serialNumber?: string;
  isDamaged?: boolean;
  damagedQty?: number;
  isReturnable?: boolean;
  isTagged?: boolean;
  complaintNumber?: string;
  capturedImage?: string;
  narration?: string;
  splitEntries?: number[];
  cartonConfig?: {
      cartonCount: number;
      unitsPerCarton: number;
      isCartonBased: boolean;
  };
}

export interface AddStockRequest {
  sku: string;
  idempotency_key: string;
}

export interface ResolveConflictRequest {
  resolution: 'local' | 'server';
  idempotency_key: string;
}

/**
 * TYPED API CLIENT
 */
class StockApiClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string = 'http://192.168.1.50:8080/api/v1') {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request Interceptor for Auth and Audit Logging
    this.axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem('AUTH_TOKEN');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response Interceptor for Error Normalization
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 409 Conflict specifically for Version Mismatch UI triggers
        if (error.response?.status === 409) {
          console.error('Optimistic Lock Failure: Version Mismatch detected.');
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth
  async login(data: LoginRequest): Promise<LoginResponse> {
    const res = await this.axiosInstance.post<LoginResponse>('/auth/login', data);
    return res.data;
  }

  // Sessions
  async startSession(data: SessionStartRequest): Promise<SessionStartResponse> {
    const res = await this.axiosInstance.post<SessionStartResponse>('/sessions/start', data, {
      headers: { 'X-Idempotency-Key': data.idempotency_key }
    });
    return res.data;
  }

  async endSession(sessionId: string): Promise<void> {
    await this.axiosInstance.post(`/sessions/${sessionId}/end`);
  }

  // Stock Mutations
  async verifyItem(sessionId: string, data: VerifyStockRequest): Promise<StockItem> {
    const res = await this.axiosInstance.post<StockItem>(`/sessions/${sessionId}/verify`, data, {
      headers: { 'X-Idempotency-Key': data.idempotency_key }
    });
    return res.data;
  }

  async addItem(sessionId: string, data: AddStockRequest): Promise<StockItem> {
    const res = await this.axiosInstance.post<StockItem>(`/sessions/${sessionId}/add`, data, {
      headers: { 'X-Idempotency-Key': data.idempotency_key }
    });
    return res.data;
  }

  // Live Data Sync (JIT)
  async getItemLatest(sku: string): Promise<Partial<StockItem>> {
      // In production, this hits an endpoint like GET /items/:sku/live
      // It queries SQL Server for the absolute latest Qty, Price, etc.
      const res = await this.axiosInstance.get<Partial<StockItem>>(`/items/${sku}/live`);
      return res.data;
  }

  // Governance
  async getVariances(): Promise<VarianceItem[]> {
    const res = await this.axiosInstance.get<VarianceItem[]>('/governance/variances');
    return res.data;
  }

  async approveVariance(id: string): Promise<void> {
    await this.axiosInstance.post(`/governance/variances/${id}/approve`);
  }

  async getConflicts(): Promise<ConflictItem[]> {
    const res = await this.axiosInstance.get<ConflictItem[]>('/governance/conflicts');
    return res.data;
  }

  async resolveConflict(id: string, data: ResolveConflictRequest): Promise<void> {
    await this.axiosInstance.post(`/governance/conflicts/${id}/resolve`, data, {
      headers: { 'X-Idempotency-Key': data.idempotency_key }
    });
  }
}

export const api = new StockApiClient();
export default api;