'use client';

import { useEffect, useState, useCallback } from 'react';
import WalletPanel from '@/components/WalletPanel';
import SendPayment from '@/components/SendPayment';
import TxFeedback, { TxResult } from '@/components/TxFeedback';
import TxHistory from '@/components/TxHistory';
import Faucet from '@/components/Faucet';
import MultiBalanceChecker from '@/components/MultiBalanceChecker';
import TipJarCard from '@/components/TipJarCard';
import { stellar } from '@/lib/stellar-helper';
import { requestTestnetFunds } from '@/lib/friendbot';

const TABS = [
  { id: 'send', label: 'Send XLM', icon: '→' },
  { id: 'history', label: 'History', icon: '⏱' },
  { id: 'faucet', label: 'Faucet', icon: '⚡' },
  { id: 'balances', label: 'Balances', icon: '🔍' },
  { id: 'tipjar', label: 'Tip Jar', icon: '☕' },
] as const;

type TabId = (typeof TABS)[number]['id'];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabId>('send');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');

  const [balance, setBalance] = useState('0');
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [funding, setFunding] = useState(false);

  const [sending, setSending] = useState(false);
  const [txResult, setTxResult] = useState<TxResult | null>(null);

  const refreshBalance = useCallback(async (key: string) => {
    setBalanceLoading(true);
    try {
      const data = await stellar.getBalance(key);
      setBalance(data.xlm);
    } catch (err) {
      console.error('Balance fetch error:', err);
    } finally {
      setBalanceLoading(false);
    }
  }, []);

  useEffect(() => {
    if (publicKey) refreshBalance(publicKey);
  }, [publicKey, refreshBalance]);

  const handleConnect = async () => {
    setConnecting(true);
    setConnectError('');
    try {
      const address = await stellar.connectWallet();
      setPublicKey(address);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Failed to connect wallet.');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    stellar.disconnect();
    setPublicKey(null);
    setBalance('0');
    setTxResult(null);
  };

  const handleFund = async (targetKey: string) => {
    if (!targetKey) return;
    setFunding(true);
    setConnectError('');
    try {
      const result = await requestTestnetFunds(targetKey);
      if (!result.success) throw new Error(result.message);
      if (targetKey === publicKey) await refreshBalance(publicKey);
    } catch (err) {
      setConnectError(err instanceof Error ? err.message : 'Friendbot funding failed.');
    } finally {
      setFunding(false);
    }
  };

  const handleSend = async (recipientKey: string, amountStr: string, memo?: string) => {
    if (!publicKey) return;
    setTxResult({ status: 'pending' });
    setSending(true);
    try {
      const result = await stellar.sendPayment({
        from: publicKey,
        to: recipientKey,
        amount: amountStr,
        memo,
      });
      setTxResult({ status: 'success', hash: result.hash });
      await refreshBalance(publicKey);
    } catch (err) {
      const message =
        (err as { response?: { data?: { extras?: { result_codes?: { operations?: string[] } } } } })
          ?.response?.data?.extras?.result_codes?.operations?.join(', ') ||
        (err instanceof Error ? err.message : 'Unknown error during transaction.');
      setTxResult({ status: 'error', message });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />

      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <header className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3.5 py-1.5 text-xs font-medium text-slate-400 mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse-soft" />
            Stellar Testnet · Freighter Only
          </div>
          <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">Stellar Pay</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Connect your Freighter wallet, check your XLM balance, and send payments on the Stellar
            Testnet.
          </p>
        </header>

        <section className="mb-4">
          <WalletPanel
            publicKey={publicKey}
            balance={balance}
            balanceLoading={balanceLoading}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onFund={() => publicKey && handleFund(publicKey)}
            funding={funding}
            connecting={connecting}
          />
          {connectError && (
            <div className="mt-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 flex items-center justify-between gap-2">
              <p className="text-xs text-red-400">{connectError}</p>
              <button
                onClick={() => setConnectError('')}
                className="text-xs text-slate-500 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}
        </section>

        {txResult && (
          <section className="mb-4">
            <TxFeedback result={txResult} onDismiss={() => setTxResult(null)} />
          </section>
        )}

        <nav className="mb-4 flex gap-1 rounded-xl border border-white/5 bg-white/[0.03] p-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              id={`tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 min-w-[4.5rem] rounded-lg px-2 sm:px-3 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white/8 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <main>
          {activeTab === 'send' && (
            <SendPayment publicKey={publicKey} onSend={handleSend} sending={sending} />
          )}
          {activeTab === 'history' && <TxHistory publicKey={publicKey} />}
          {activeTab === 'faucet' && (
            <Faucet publicKey={publicKey} onFund={handleFund} funding={funding} />
          )}
          {activeTab === 'balances' && (
            <MultiBalanceChecker connectedPublicKey={publicKey} />
          )}
          {activeTab === 'tipjar' && (
            <TipJarCard
              connectedPublicKey={publicKey}
              onSendTip={handleSend}
              sending={sending}
            />
          )}
        </main>

        <footer className="mt-10 text-center text-xs text-slate-600">
          <p>
            Built on Stellar Testnet · Requires{' '}
            <a
              href="https://www.freighter.app/"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:text-blue-400 transition-colors"
            >
              Freighter Wallet
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
