import type { Metadata } from 'next';
import { LanguageProvider } from '@/lib/i18n/LanguageContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aursuq Owner Dashboard',
  description: 'Platform owner control panel for Aursuq marketplace',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-slate-50">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}