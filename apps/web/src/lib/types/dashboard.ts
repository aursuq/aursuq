// Owner Dashboard Types - Production-ready types for real backend data
// No mock/business data - only type definitions

export interface DashboardSummaryMetrics {
  totalSellers: number;
  activeSellers: number;
  totalCustomers: number;

  totalOrders: number | null;
  todayOrders: number | null;
  warehouseUnits: number | null;

  frozenSellerFunds: number | null; // in smallest currency unit (agorot/cents)
  availableSellerFunds: number | null; // in smallest currency unit

  aursuqProfit: number | null; // in smallest currency unit
  todaysProfit: number | null; // in smallest currency unit
}

export interface TopStore {
  id: string;
  name: string;
  storeName: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  productCount: number;
  stockStatus: 'stocked' | 'low' | 'out';
  salesCount: number;
  accountStatus: 'active' | 'inactive' | 'suspended';
}

export interface TodayOrder {
  id: string;
  customerName: string;
  sellerCount: number;
  total: number; // in smallest currency unit
  status: 'delivered' | 'shipped' | 'processing' | 'cancelled';
  date: string; // ISO 8601
}

export interface WarehouseOverview {
  incomingShipments: number;
  underInspection: number;
  stockedUnits: number;
  lowStockAlerts: number;
  damagedQuarantinedUnits: number;
}

export interface SupportOverview {
  openComplaints: number;
  pendingCases: number;
  escalatedCases: number;
}

export interface RecentActivityItem {
  id: string;
  type: 'seller' | 'warehouse' | 'order' | 'payout' | 'admin';
  actionKey: string; // translation key
  actionParams: Record<string, string | number>;
  user: string;
  timestamp: string; // ISO 8601
}

export interface OwnerDashboardData {
  summary: DashboardSummaryMetrics;
  topStores: TopStore[];
  todayOrders: TodayOrder[];
  warehouse: WarehouseOverview;
  support: SupportOverview;
  recentActivity: RecentActivityItem[];
}

export type DashboardDataState = 'loading' | 'loaded' | 'empty' | 'error';

export interface DashboardViewState {
  state: DashboardDataState;
  error?: string;
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Sort options for top stores
export type TopStoreSortBy = 'sales' | 'profit';

export interface TopStoresQuery {
  sortBy: TopStoreSortBy;
  limit?: number;
}