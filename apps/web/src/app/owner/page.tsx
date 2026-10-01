'use client';

import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/ui/StatCard';
import { SectionCard } from '@/components/ui/SectionCard';
import { DataTable } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import {
  Users,
  UserCheck,
  Package,
  Calendar,
  Warehouse,
  Lock,
  DollarSign,
  Truck,
  Search,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Clock,
  ArrowUpCircle,
} from 'lucide-react';
import type {
  TopStore,
  TodayOrder,
  OwnerDashboardData,
  DashboardSummaryMetrics,
  WarehouseOverview,
  SupportOverview,
  RecentActivityItem,
} from '@/lib/types/dashboard';
import { EMPTY_DASHBOARD_DATA } from '@/lib/api/ownerDashboard';

const iconMap: Record<string, React.ForwardRefExoticComponent<React.SVGProps<SVGSVGElement> & React.RefAttributes<SVGSVGElement>>> = {
  Users,
  UserCheck,
  Package,
  Calendar,
  Warehouse,
  Lock,
  DollarSign,
  Truck,
  Search,
  AlertTriangle,
  ShieldAlert,
  AlertCircle,
  Clock,
  ArrowUpCircle,
};

const statusVariantMap: Record<string, 'verified' | 'pending' | 'rejected' | 'active' | 'inactive' | 'suspended' | 'delivered' | 'processing' | 'shipped' | 'cancelled' | 'awaiting' | 'inspection' | 'stocked' | 'low' | 'damaged' | 'open' | 'escalated' | 'default'> = {
  verified: 'verified',
  pending: 'pending',
  rejected: 'rejected',
  active: 'active',
  inactive: 'inactive',
  suspended: 'suspended',
  delivered: 'delivered',
  processing: 'processing',
  shipped: 'shipped',
  cancelled: 'cancelled',
  awaiting: 'awaiting',
  inspection: 'inspection',
  stocked: 'stocked',
  low: 'low',
  damaged: 'damaged',
  open: 'open',
  escalated: 'escalated',
};

// Empty state stat cards - display em dash for unknown metrics, no fake trends
const statCards = [
  { labelKey: 'dashboard.stats.totalSellers', icon: 'Users', iconBg: 'bg-brand-100 text-brand-600' },
  { labelKey: 'dashboard.stats.activeSellers', icon: 'UserCheck', iconBg: 'bg-green-100 text-green-600' },
  { labelKey: 'dashboard.stats.totalOrders', icon: 'Package', iconBg: 'bg-blue-100 text-blue-600' },
  { labelKey: 'dashboard.stats.todayOrders', icon: 'Calendar', iconBg: 'bg-purple-100 text-purple-600' },
  { labelKey: 'dashboard.stats.totalCustomers', icon: 'Users', iconBg: 'bg-indigo-100 text-indigo-600' },
  { labelKey: 'dashboard.stats.warehouseUnits', icon: 'Warehouse', iconBg: 'bg-amber-100 text-amber-600' },
  { labelKey: 'dashboard.stats.frozenBalances', icon: 'Lock', iconBg: 'bg-red-100 text-red-600' },
  { labelKey: 'dashboard.stats.availableBalances', icon: 'DollarSign', iconBg: 'bg-brand-100 text-brand-600' },
  { labelKey: 'dashboard.stats.aursuqProfit', icon: 'DollarSign', iconBg: 'bg-emerald-100 text-emerald-600' },
  { labelKey: 'dashboard.stats.todaysProfit', icon: 'ArrowUpCircle', iconBg: 'bg-emerald-100 text-emerald-600' },
] as const;

// Warehouse overview metrics configuration (no business data)
const warehouseMetrics = [
  { labelKey: 'dashboard.warehouse.incomingShipments', icon: 'Truck', color: 'bg-blue-100 text-blue-600' },
  { labelKey: 'dashboard.warehouse.underInspection', icon: 'Search', color: 'bg-amber-100 text-amber-600' },
  { labelKey: 'dashboard.warehouse.stockedUnits', icon: 'Package', color: 'bg-brand-100 text-brand-600' },
  { labelKey: 'dashboard.warehouse.lowStockAlerts', icon: 'AlertTriangle', color: 'bg-red-100 text-red-600' },
  { labelKey: 'dashboard.warehouse.damagedUnits', icon: 'ShieldAlert', color: 'bg-orange-100 text-orange-600' },
] as const;

// Support overview metrics configuration (no business data)
const supportMetrics = [
  { labelKey: 'dashboard.support.openComplaints', icon: 'AlertCircle', color: 'bg-red-100 text-red-600' },
  { labelKey: 'dashboard.support.pendingCases', icon: 'Clock', color: 'bg-amber-100 text-amber-600' },
  { labelKey: 'dashboard.support.escalatedCases', icon: 'ArrowUpCircle', color: 'bg-purple-100 text-purple-600' },
] as const;

// Activity type icons and colors (UI configuration, not business data)
const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  seller: UserCheck,
  warehouse: Truck,
  order: Package,
  payout: DollarSign,
  admin: AlertCircle,
};

const activityColors: Record<string, string> = {
  seller: 'bg-brand-100 text-brand-600',
  warehouse: 'bg-blue-100 text-blue-600',
  order: 'bg-indigo-100 text-indigo-600',
  payout: 'bg-green-100 text-green-600',
  admin: 'bg-red-100 text-red-600',
};

export default function OwnerDashboard() {
  const [sellerSortBy, setSellerSortBy] = React.useState<'sales' | 'profit'>('sales');
  const [dashboardData, setDashboardData] = React.useState<OwnerDashboardData>(EMPTY_DASHBOARD_DATA);
  const { t } = useLanguage();

  const sortedSellers = React.useMemo(() => {
    const list = [...dashboardData.topStores];
    if (sellerSortBy === 'sales') {
      return list.sort((a, b) => b.salesCount - a.salesCount);
    }
    return list;
  }, [dashboardData.topStores, sellerSortBy]);

  const sellerColumns = [
    { key: 'name', header: t('dashboard.sellerTable.name') },
    { key: 'storeName', header: t('dashboard.sellerTable.storeName') },
    {
      key: 'verificationStatus',
      header: t('dashboard.sellerTable.verificationStatus'),
      render: (row: TopStore) => (
        <StatusBadge label={t(`dashboard.sellerTable.verification.${row.verificationStatus}`)} variant={statusVariantMap[row.verificationStatus]} />
      ),
    },
    { key: 'productCount', header: t('dashboard.sellerTable.productCount'), className: 'text-center' },
    {
      key: 'stockStatus',
      header: t('dashboard.sellerTable.stockStatus'),
      render: (row: TopStore) => (
        <StatusBadge
          label={t(`dashboard.sellerTable.stock.${row.stockStatus}`)}
          variant={statusVariantMap[row.stockStatus]}
        />
      ),
    },
    { key: 'salesCount', header: t('dashboard.sellerTable.salesCount'), className: 'text-center' },
    {
      key: 'accountStatus',
      header: t('dashboard.sellerTable.accountStatus'),
      render: (row: TopStore) => (
        <StatusBadge
          label={t(`dashboard.sellerTable.account.${row.accountStatus}`)}
          variant={statusVariantMap[row.accountStatus]}
        />
      ),
    },
  ];

  const orderColumns = [
    { key: 'id', header: t('dashboard.orderTable.id') },
    { key: 'customerName', header: t('dashboard.orderTable.customer') },
    { key: 'sellerCount', header: t('dashboard.orderTable.sellerCount'), className: 'text-center' },
    { key: 'total', header: t('dashboard.orderTable.total'), className: 'text-left font-mono' },
    {
      key: 'status',
      header: t('dashboard.orderTable.status'),
      render: (row: TodayOrder) => (
        <StatusBadge
          label={t(`dashboard.orderTable.statuses.${row.status}`)}
          variant={statusVariantMap[row.status]}
        />
      ),
    },
    { key: 'date', header: t('dashboard.orderTable.date') },
  ];

  const warehouseStats = warehouseMetrics.map((metric, index) => {
    const Icon = iconMap[metric.icon];
    const value = dashboardData.warehouse[
      metric.labelKey.replace('dashboard.warehouse.', '') as keyof WarehouseOverview
    ] as number;
    return (
      <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
        {Icon && <Icon className={`w-5 h-5 ${metric.color}`} />}
        <div>
          <p className="text-sm text-slate-500">{t(metric.labelKey)}</p>
          <p className="text-xl font-bold text-slate-900">{value === 0 ? '—' : value}</p>
        </div>
      </div>
    );
  });

  const supportStats = supportMetrics.map((metric, index) => {
    const Icon = iconMap[metric.icon];
    const value = dashboardData.support[
      metric.labelKey.replace('dashboard.support.', '') as keyof SupportOverview
    ] as number;
    return (
      <div key={index} className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg">
        {Icon && <Icon className={`w-5 h-5 ${metric.color}`} />}
        <div>
          <p className="text-sm text-slate-500">{t(metric.labelKey)}</p>
          <p className="text-xl font-bold text-slate-900">{value === 0 ? '—' : value}</p>
        </div>
      </div>
    );
  });

  const summaryStats = statCards.map((stat, index) => {
    const key = stat.labelKey.replace('dashboard.stats.', '') as keyof DashboardSummaryMetrics;
    const value = dashboardData.summary[key] as number;
    return {
      ...stat,
      value: value === 0 ? '—' : value,
      trendKey: undefined,
      trendUp: undefined,
    };
  });

  return (
    <DashboardLayout title={t('dashboard.title')}>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
        {summaryStats.map((stat, index) => {
          const Icon = iconMap[stat.icon];
          return (
            <StatCard
              key={index}
              labelKey={stat.labelKey}
              value={stat.value}
              trendKey={stat.trendKey}
              trendUp={stat.trendUp}
              icon={Icon}
              iconBg={stat.iconBg}
            />
          );
        })}
      </div>

      {/* Seller Overview & Orders Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard
          title={t('dashboard.sections.sellerOverview')}
          action={
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs">
              <button
                onClick={() => setSellerSortBy('sales')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${sellerSortBy === 'sales' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {t('dashboard.sellerFilter.topBySales')}
              </button>
              <button
                onClick={() => setSellerSortBy('profit')}
                title={t('dashboard.sellerFilter.profitNotAvailable')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${sellerSortBy === 'profit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {t('dashboard.sellerFilter.topByProfit')}
              </button>
            </div>
          }
        >
          <div className="max-h-[420px] overflow-y-auto">
            <DataTable columns={sellerColumns} data={sortedSellers} />
          </div>
        </SectionCard>

        <SectionCard title={t('dashboard.sections.orderOverview')}>
          <div className="max-h-[420px] overflow-y-auto">
            <DataTable
              columns={orderColumns}
              data={dashboardData.todayOrders}
              emptyMessage={t('dashboard.empty.noOrders')}
            />
          </div>
        </SectionCard>
      </div>

      {/* Warehouse & Support Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title={t('dashboard.sections.warehouseOverview')}>
          <div className="space-y-3">
            {warehouseStats}
          </div>
        </SectionCard>

        <SectionCard title={t('dashboard.sections.supportOverview')}>
          <div className="space-y-3">
            {supportStats}
          </div>
        </SectionCard>
      </div>

      {/* Recent Activity */}
      <SectionCard title={t('dashboard.sections.recentActivity')}>
        <div className="space-y-4">
          {dashboardData.recentActivity.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {t('dashboard.empty.noActivity')}
            </div>
          ) : (
            dashboardData.recentActivity.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              const bgColor = activityColors[activity.type];
              return (
                <div key={index} className="flex items-start gap-4 p-4 bg-slate-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${bgColor} flex-shrink-0`}>
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-medium">{t(activity.actionKey, activity.actionParams)}</p>
                    <p className="text-sm text-slate-500 mt-1">{activity.user}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">{activity.timestamp}</span>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}