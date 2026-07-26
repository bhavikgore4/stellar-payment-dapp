'use client';

import Link from 'next/link';
import { APP_NAME } from '@/lib/config';
import Navigation, { DashboardTab } from './Navigation';

interface AppShellProps {
  children: React.ReactNode;
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
  showNav?: boolean;
}

export default function AppShell({
  children,
  activeTab,
  onTabChange,
  showNav = true,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-xl group-hover:scale-105 transition-transform">
                ⭐
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{APP_NAME}</h1>
                <p className="text-white/60 text-xs">Stellar Testnet · Freighter Wallet</p>
              </div>
            </Link>

            {showNav && onTabChange && (
              <Navigation activeTab={activeTab} onTabChange={onTabChange} />
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>

      <footer className="border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center text-white/40 text-sm">
            <p className="mb-2">Built with Stellar SDK & Stellar Wallets Kit · Testnet only</p>
            <p className="text-xs">⚠️ Do not use real funds. This app runs on Stellar Testnet.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
