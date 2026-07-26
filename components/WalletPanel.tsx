'use client';

import { useState } from 'react';
import { truncateAddress } from '@/lib/validation';

interface WalletPanelProps {
  publicKey: string | null;
  balance: string;
  balanceLoading: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onFund: () => void;
  funding: boolean;
  connecting: boolean;
}

export default function WalletPanel({
  publicKey,
  balance,
  balanceLoading,
  onConnect,
  onDisconnect,
  onFund,
  funding,
  connecting,
}: WalletPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!publicKey) return;
    await navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!publicKey) {
    return (
      <div className="card p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-slate-400">
              <path d="M20 12V8H4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="2" y="8" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 14h.01M10 14h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Freighter Wallet</p>
            <p className="text-xs text-slate-500 mt-0.5">Not connected</p>
          </div>
        </div>
        <button
          id="btn-connect-wallet"
          onClick={onConnect}
          disabled={connecting}
          className="btn-primary text-sm px-5 py-2.5"
        >
          {connecting ? (
            <span className="flex items-center gap-2">
              <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Connecting…
            </span>
          ) : (
            'Connect Freighter'
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="card p-5 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
            <span className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 ring-2 ring-surface-900 animate-pulse-soft" />
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-green-400">
              <path d="M20 12V8H4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="2" y="8" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M6 14h.01M10 14h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                title="Click to copy full address"
                className="font-mono text-sm font-medium text-white hover:text-blue-400 transition-colors"
              >
                {truncateAddress(publicKey)}
              </button>
              {copied && <span className="text-xs text-green-400 font-medium">Copied!</span>}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {balanceLoading
                ? 'Fetching balance…'
                : `${Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })} XLM`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {Number(balance) === 0 && !balanceLoading && (
            <button
              id="btn-fund-friendbot"
              onClick={onFund}
              disabled={funding}
              className="btn-ghost text-xs text-amber-400 border-amber-400/20 hover:border-amber-400/40"
            >
              {funding ? 'Funding…' : '⚡ Fund via Friendbot'}
            </button>
          )}
          <button
            id="btn-disconnect-wallet"
            onClick={onDisconnect}
            className="btn-ghost text-xs hover:text-red-400"
          >
            Disconnect
          </button>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">XLM Balance</span>
        <span className="font-mono text-lg font-semibold text-white">
          {balanceLoading
            ? '—'
            : `${Number(balance).toLocaleString(undefined, { maximumFractionDigits: 4 })} XLM`}
        </span>
      </div>
    </div>
  );
}
