'use client';

import { useEffect, useState, useCallback } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { isValidStellarAddress, truncateAddress } from '@/lib/validation';

interface TxHistoryProps {
  publicKey: string | null;
}

export default function TxHistory({ publicKey }: TxHistoryProps) {
  const [txs, setTxs] = useState<
    Array<{
      id: string;
      hash: string;
      createdAt: string;
      from?: string;
      to?: string;
      amount?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async (key: string) => {
    if (!isValidStellarAddress(key)) return;
    setLoading(true);
    try {
      const records = await stellar.getRecentTransactions(key, 15);
      setTxs(records);
    } catch (e) {
      console.error('Failed to load tx history:', e);
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (publicKey) load(publicKey);
    else {
      setTxs([]);
      setLoaded(false);
    }
  }, [publicKey, load]);

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-purple-400">
              <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Transaction History</h2>
            <p className="text-xs text-slate-500 mt-0.5">Recent payments on Stellar Testnet</p>
          </div>
        </div>
        {publicKey && (
          <button
            id="btn-refresh-history"
            onClick={() => load(publicKey)}
            disabled={loading}
            className="btn-ghost text-xs px-3 py-2"
          >
            {loading ? '…' : '↻ Refresh'}
          </button>
        )}
      </div>

      {!publicKey ? (
        <div className="rounded-xl border border-dashed border-white/8 p-8 text-center">
          <p className="text-sm text-slate-500">Connect your Freighter wallet to view transaction history.</p>
        </div>
      ) : loading && !loaded ? (
        <div className="py-10 text-center">
          <span className="inline-block h-5 w-5 rounded-full border-2 border-purple-400 border-t-transparent animate-spin" />
          <p className="mt-3 text-xs text-slate-500">Loading from Horizon…</p>
        </div>
      ) : txs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/8 p-8 text-center">
          <p className="text-sm text-slate-500">No transactions found for this account.</p>
          <p className="text-xs text-slate-600 mt-1">Send a payment to see it here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {txs.map((tx) => {
            const isOut = tx.from === publicKey;
            return (
              <div
                key={tx.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 hover:border-white/10 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      isOut ? 'bg-red-500/10' : 'bg-green-500/10'
                    }`}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      className={isOut ? 'text-red-400' : 'text-green-400'}
                    >
                      {isOut ? (
                        <path
                          d="M7 17L17 7M17 7H7M17 7V17"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      ) : (
                        <path
                          d="M17 7L7 17M7 17H17M7 17V7"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      )}
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-white truncate">
                      {isOut ? `To: ${truncateAddress(tx.to || '', 8, 8)}` : `From: ${truncateAddress(tx.from || '', 8, 8)}`}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {new Date(tx.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className={`font-mono text-sm font-semibold ${isOut ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {isOut ? '-' : '+'}
                    {Number(tx.amount || 0).toFixed(4)} XLM
                  </span>
                  <a
                    href={stellar.getExplorerLink(tx.hash, 'tx')}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors"
                  >
                    ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
