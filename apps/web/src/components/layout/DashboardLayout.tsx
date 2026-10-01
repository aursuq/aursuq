'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface DashboardLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ title, children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isRTL } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar className={`fixed inset-y-0 z-50 w-64 transform transition-transform duration-300 lg:translate-x-0 ${
        isRTL
          ? 'right-0 border-l'
          : 'left-0 border-r'
      } ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`} />

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`${isRTL ? 'lg:mr-64' : 'lg:ml-64'} min-h-screen`}>
        {/* Header */}
        <Header
          title={title}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};