'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';
import { Shield } from 'lucide-react';

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (element: HTMLElement, config: {
            theme: 'outline' | 'filled_blue' | 'filled_black';
            size: 'large' | 'medium' | 'small';
            text: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
            shape: 'rectangular' | 'pill' | 'circle' | 'square';
            logo_alignment: 'left' | 'center';
            width?: string;
            locale?: string;
          }) => void;
          prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean; getDismissedReason: () => string }) => void) => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function OwnerLoginPage() {
  const { t, language, isRTL } = useLanguage();
  const { user, login, loading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!authLoading && user) {
      router.push('/owner');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setGoogleLoaded(true);
    };
    document.head.appendChild(script);
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (googleLoaded && window.google && buttonRef.current) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: '100%',
        locale: language === 'ar' ? 'ar' : language === 'he' ? 'he' : 'en',
      });
    }
  }, [googleLoaded, language]);

  const handleGoogleCredential = async (response: { credential: string }) => {
    setError(null);
    setIsLoading(true);
    try {
      await login(response.credential);
      window.location.href = '/owner';
    } catch (err) {
      const message = err instanceof Error ? err.message : t('login.loginFailed');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (buttonRef.current) {
        buttonRef.current.click();
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-600 mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t('brand')}</h1>
          <p className="text-slate-500 mt-1">{t('login.subtitle')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-6">{t('login.title')}</h2>

          {/* Google Sign-In Button */}
          <div ref={buttonRef} className="mb-6" role="button" tabIndex={0} onKeyDown={handleKeyDown} />

          {/* Error Message */}
          {error && (
            <div
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Info Text */}
          <p className="text-center text-sm text-slate-500">
            {t('login.continueWithGoogle')}
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Aursuq Owner Dashboard
        </p>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50" role="status" aria-live="polite">
          <div className="bg-white rounded-xl p-6 flex items-center gap-3 shadow-lg">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-slate-700 font-medium">{t('login.signingIn')}</span>
          </div>
        </div>
      )}
    </div>
  );
}