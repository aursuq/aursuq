// Owner Dashboard API Service - Frontend data layer for real backend integration

import type {
  OwnerDashboardData,
  TopStoresQuery,
  TopStoreSortBy,
  DashboardSummaryMetrics,
} from '@/lib/types/dashboard';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `HTTP ${res.status}`);
  }

  return res.json();
}

/**
 * Fetches dashboard summary metrics only.
 * Backend endpoint: GET /owner/dashboard/summary
 * Response: DashboardSummaryMetrics
 */
export async function fetchDashboardSummary(): Promise<DashboardSummaryMetrics> {
  return fetchJson<DashboardSummaryMetrics>(`${API_BASE_URL}/owner/dashboard/summary`);
}

/**
 * Fetches top stores with sorting.
 * Backend endpoint: GET /owner/dashboard/top-stores?sortBy=sales|profit&limit=10
 * Response: TopStore[]
 */
export async function fetchTopStores(query: TopStoresQuery): Promise<OwnerDashboardData['topStores']> {
  const params = new URLSearchParams({
    sortBy: query.sortBy,
    ...(query.limit && { limit: query.limit.toString() }),
  });
  return fetchJson(`${API_BASE_URL}/owner/dashboard/top-stores?${params}`);
}

/**
 * Fetches today's orders.
 * Backend endpoint: GET /owner/dashboard/today-orders
 * Response: TodayOrder[]
 */
export async function fetchTodayOrders(): Promise<OwnerDashboardData['todayOrders']> {
  return fetchJson(`${API_BASE_URL}/owner/dashboard/today-orders`);
}

/**
 * Fetches warehouse overview.
 * Backend endpoint: GET /owner/dashboard/warehouse
 * Response: WarehouseOverview
 */
export async function fetchWarehouseOverview(): Promise<OwnerDashboardData['warehouse']> {
  return fetchJson(`${API_BASE_URL}/owner/dashboard/warehouse`);
}

/**
 * Fetches support overview.
 * Backend endpoint: GET /owner/dashboard/support
 * Response: SupportOverview
 */
export async function fetchSupportOverview(): Promise<OwnerDashboardData['support']> {
  return fetchJson(`${API_BASE_URL}/owner/dashboard/support`);
}

/**
 * Fetches recent activity.
 * Backend endpoint: GET /owner/dashboard/activity?limit=20
 * Response: RecentActivityItem[]
 */
export async function fetchRecentActivity(limit = 20): Promise<OwnerDashboardData['recentActivity']> {
  return fetchJson(`${API_BASE_URL}/owner/dashboard/activity?limit=${limit}`);
}

// Convenience function to fetch all dashboard data in parallel
export async function fetchAllDashboardData(): Promise<OwnerDashboardData> {
  const [summary, topStores, todayOrders, warehouse, support, recentActivity] = await Promise.all([
    fetchDashboardSummary(),
    fetchTopStores({ sortBy: 'sales' }),
    fetchTodayOrders(),
    fetchWarehouseOverview(),
    fetchSupportOverview(),
    fetchRecentActivity(),
  ]);

  return {
    summary,
    topStores,
    todayOrders,
    warehouse,
    support,
    recentActivity,
  };
}

/**
 * Type guard to check if we have real data vs empty state
 */
export function hasDashboardData(data: OwnerDashboardData | null): data is OwnerDashboardData {
  return data !== null;
}

/**
 * Default empty state for dashboard - used when no real data is connected
 * Note: null values indicate metrics not yet implemented (not zero)
 */
export const EMPTY_DASHBOARD_DATA: OwnerDashboardData = {
  summary: {
    totalSellers: 0,
    activeSellers: 0,
    totalCustomers: 0,
    totalOrders: null,
    todayOrders: null,
    warehouseUnits: null,
    frozenSellerFunds: null,
    availableSellerFunds: null,
    aursuqProfit: null,
    todaysProfit: null,
  },
  topStores: [],
  todayOrders: [],
  warehouse: {
    incomingShipments: 0,
    underInspection: 0,
    stockedUnits: 0,
    lowStockAlerts: 0,
    damagedQuarantinedUnits: 0,
  },
  support: {
    openComplaints: 0,
    pendingCases: 0,
    escalatedCases: 0,
  },
  recentActivity: [],
};