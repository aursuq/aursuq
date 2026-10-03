'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCog,
  UserCheck,
  Package,
  Warehouse,
  Headphones,
  DollarSign,
  Megaphone,
  Settings,
  Building2,
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface NavItem {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface SidebarProps {
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ className = '' }) => {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems: NavItem[] = [
    { labelKey: 'nav.overview', href: '/owner', icon: LayoutDashboard },
    { labelKey: 'nav.sellers', href: '/owner/sellers', icon: Users },
    { labelKey: 'nav.admins', href: '/owner/admins', icon: UserCog },
    { labelKey: 'nav.users', href: '/owner/users', icon: UserCheck },
    { labelKey: 'nav.orders', href: '/owner/orders', icon: Package },
    { labelKey: 'nav.warehouse', href: '/owner/warehouse', icon: Warehouse },
    { labelKey: 'nav.support', href: '/owner/support', icon: Headphones },
    { labelKey: 'nav.finance', href: '/owner/finance', icon: DollarSign },
    { labelKey: 'nav.promotions', href: '/owner/promotions', icon: Megaphone },
    { labelKey: 'nav.settings', href: '/owner/settings', icon: Settings },
  ];

  return (
    <aside className={`bg-white border-slate-200 flex flex-col h-full ${className}`}>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-slate-200">
        <Link href="/owner" className="flex items-center gap-2">
          <Building2 className="w-8 h-8 text-brand-600" />
          <span className="text-xl font-bold text-slate-900">{t('brand')}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          let isActive: boolean;
          if (item.href === '/owner') {
            // Exact match for Overview
            isActive = pathname === '/owner';
          } else {
            // Prefix match for nested sections (e.g., /owner/sellers, /owner/sellers/123)
            isActive = pathname.startsWith(item.href);
          }
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
              {t(item.labelKey)}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 text-center">
          {t('sidebar.footer')}
        </p>
      </div>
    </aside>
  );
};