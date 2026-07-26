'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export type DashboardTab =
  | 'dashboard'
  | 'balance-checker'
  | 'faucet'
  | 'transactions';

interface NavigationProps {
  activeTab?: DashboardTab;
  onTabChange?: (tab: DashboardTab) => void;
}

const tabs: { id: DashboardTab; label: string; icon: string }[] = [
  { id: 'dashboard', label: 'Payment dApp', icon: '💸' },
  { id: 'balance-checker', label: 'Balance Checker', icon: '🔍' },
  { id: 'faucet', label: 'Testnet Faucet', icon: '🚰' },
  { id: 'transactions', label: 'Transactions', icon: '📜' },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const pathname = usePathname();
  const isTipJar = pathname === '/tip-jar';

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange?.(tab.id)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            activeTab === tab.id && !isTipJar
              ? 'bg-white/20 text-white border border-white/30'
              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
          }`}
        >
          <span className="mr-1.5">{tab.icon}</span>
          {tab.label}
        </button>
      ))}

      <Link
        href="/tip-jar"
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          isTipJar
            ? 'bg-white/20 text-white border border-white/30'
            : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-transparent'
        }`}
      >
        <span className="mr-1.5">☕</span>
        Tip Jar
      </Link>
    </nav>
  );
}
