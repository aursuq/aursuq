'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, UserCircle, Menu, Globe, ChevronDown, Check, LogOut, Loader2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { useAuth } from '@/lib/auth/AuthContext';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onMenuClick }) => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { user, logout, loading: authLoading } = useAuth();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: 'ar' | 'he' | 'en'; label: string }[] = [
    { code: 'ar', label: t('languages.ar') },
    { code: 'he', label: t('languages.he') },
    { code: 'en', label: t('languages.en') },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      window.location.href = '/owner/login';
    } catch {
      // Logout error handled by redirect
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Menu button (mobile) and Page Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label={t('header.menuAriaLabel')}
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        </div>

        {/* Right side - Search, Notifications, Profile, Language Selector, Logout */}
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="search"
              placeholder={t('header.searchPlaceholder')}
              className="w-64 pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {/* Language Selector */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-2 p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Change language"
              aria-expanded={isLangOpen}
            >
              <Globe className="w-5 h-5" />
              <span className="hidden sm:inline text-sm font-medium text-slate-700">
                {languages.find(l => l.code === language)?.label}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {isLangOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 ${language === lang.code ? 'bg-brand-50 text-brand-700' : ''}`}
                  >
                    <span>{lang.label}</span>
                    {language === lang.code && <Check className="w-4 h-4 text-brand-600 ml-auto" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 left-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile with Logout */}
          <div className="flex items-center gap-3 pl-4 border-r border-slate-200 pr-4">
            <UserCircle className="w-8 h-8 text-slate-400" />
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-slate-900">
                {user ? `${t('header.profileTitle')} (${user.email})` : t('header.profileTitle')}
              </p>
              <p className="text-xs text-slate-500">{t('header.profileEmail')}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut || authLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('login.logout')}
            >
              {isLoggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{t('login.logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};