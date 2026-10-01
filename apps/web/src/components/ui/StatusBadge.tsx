'use client';

import React from 'react';

type StatusVariant =
  | 'verified'
  | 'pending'
  | 'rejected'
  | 'active'
  | 'inactive'
  | 'suspended'
  | 'delivered'
  | 'processing'
  | 'shipped'
  | 'cancelled'
  | 'awaiting'
  | 'inspection'
  | 'stocked'
  | 'low'
  | 'damaged'
  | 'open'
  | 'escalated'
  | 'default';

interface StatusBadgeProps {
  label: string;
  variant: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  verified: 'bg-brand-100 text-brand-700',
  pending: 'bg-amber-100 text-amber-700',
  rejected: 'bg-red-100 text-red-700',
  active: 'bg-brand-100 text-brand-700',
  inactive: 'bg-slate-100 text-slate-700',
  suspended: 'bg-red-100 text-red-700',
  delivered: 'bg-brand-100 text-brand-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  cancelled: 'bg-red-100 text-red-700',
  awaiting: 'bg-amber-100 text-amber-700',
  inspection: 'bg-blue-100 text-blue-700',
  stocked: 'bg-brand-100 text-brand-700',
  low: 'bg-red-100 text-red-700',
  damaged: 'bg-orange-100 text-orange-700',
  open: 'bg-blue-100 text-blue-700',
  escalated: 'bg-red-100 text-red-700',
  default: 'bg-slate-100 text-slate-700',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'default',
  className = ''
}) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantStyles[variant]} ${className}`}>
      {label}
    </span>
  );
};