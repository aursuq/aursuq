'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth/AuthContext';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Loader2 } from 'lucide-react';

function OwnerLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { t, isRTL } = useLanguage();

  // Skip auth check for login page to avoid redirect loop
  const isLoginPage = pathname === '/owner/login';

  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/owner/login');
    }
  }, [user, loading, router, isLoginPage]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600">{t('dashboard.empty.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user && !isLoginPage) {
    return null;
  }

  return <>{children}</>;
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OwnerLayoutContent>{children}</OwnerLayoutContent>
    </AuthProvider>
  );
}