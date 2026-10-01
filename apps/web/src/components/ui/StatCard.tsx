'use client';

import React from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface StatCardProps {
  labelKey: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trendKey?: string;
  trendUp?: boolean;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  labelKey,
  value,
  icon: Icon,
  trendKey,
  trendUp,
  iconBg = 'bg-brand-100 text-brand-600',
}) => {
  const { t } = useLanguage();

  const label = t(labelKey);
  const trend = trendKey ? t(trendKey) : undefined;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className={`mt-1 text-sm font-medium ${trendUp ? 'text-brand-600' : 'text-red-600'}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-lg`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};