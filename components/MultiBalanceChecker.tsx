'use client';

import { useEffect, useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { requestTestnetFunds } from '@/lib/friendbot';
import { isValidStellarAddress } from '@/lib/validation';

interface AccountEntry {
  address: string;
  balance: string;
  loading: boolean;
  label: string;
}

interface MultiBalanceCheckerProps {
  connectedPublicKey: string | null;
}

export default function MultiBalanceChecker({ connectedPublicKey }: MultiBalanceCheckerProps) {
  const [inputAddress, setInputAddress] = useState('');
  const [accounts, setAccounts] = useState<AccountEntry[]>([]);
  const [fundingAddress, setFundingAddress] = useState<string | null>(null);

  useEffect(() => {
    if (connectedPublicKey && !accounts.some((a) => a.address === connectedPublicKey)) {
      setAccounts([
        { address: connectedPublicKey, balance: 'Loading…', loading: true, label: 'Your Wallet' },
      ]);
      void refreshAccount(connectedPublicKey);
    }
  }, [connectedPublicKey]);

  const refreshAccount = async (target: string) => {
    setAccounts((prev) =>
      prev.map((a) => (a.address === target ? { ...a, loading: true } : a))
    );
    try {
      const data = await stellar.getBalance(target);
      setAccounts((prev) =>
        prev.map((a) =>
          a.address === target ? { ...a, balance: data.xlm, loading: false } : a
        )
      );
    } catch {
      setAccounts((prev) =>
        prev.map((a) =>
          a.address === target ? { ...a, balance: 'Unfunded / Error', loading: false } : a
        )
      );
    }
  };

  const handleAddAccount = async (addr?: string, label = 'Account') => {
    const target = (addr || inputAddress).trim();
    if (!isValidStellarAddress(target)) return;
    if (accounts.some((a) => a.address === target)) {
      setInputAddress('');
      return;
    }

    setAccounts((prev) => [
      ...prev,
      { address: target, balance: 'Fetching…', loading: true, label },
    ]);
    setInputAddress('');
    await refreshAccount(target);
  };

  const handleFundAccount = async (target: string) => {
    setFundingAddress(target);
    try {
      const result = await requestTestnetFunds(target);
      if (!result.success) throw new Error(result.message);
      await refreshAccount(target);
    } catch (e) {
      alert(`Funding failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setFundingAddress(null);
    }
  };

  const handleRemove = (target: string) => {
    setAccounts((prev) => prev.filter((a) => a.address !== target));
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="mb-6">
        <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 font-mono text-xs font-bold text-blue-400 border border-blue-500/30">
          🔍 Wallet Balance Checker
        </span>
        <h2 className="mt-3 text-xl font-bold text-white">Multi-Account Balance Inspector</h2>
        <p className="mt-1 text-sm text-slate-400">
          Query live XLM balances across multiple Stellar Testnet public keys.
        </p>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputAddress}
          onChange={(e) => setInputAddress(e.target.value)}
          placeholder="Paste Stellar G... public key address"
          className="input-field flex-1 font-mono text-xs"
        />
        <button
          type="button"
          onClick={() => handleAddAccount()}
          disabled={!isValidStellarAddress(inputAddress)}
          className="btn-primary text-xs px-5 py-3 whitespace-nowrap"
        >
          + Add Account
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-white/8 p-8 text-center font-mono text-xs text-slate-500">
          No accounts added yet. Enter a G... public key above or connect your wallet.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {accounts.map((acc) => (
            <div
              key={acc.address}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-blue-400">{acc.label}</span>
                  <span className="truncate font-mono text-xs text-white">{acc.address}</span>
                </div>
                <p className="mt-1 font-mono text-sm font-bold text-amber-400">
                  {acc.loading
                    ? 'Fetching balance…'
                    : acc.balance === 'Unfunded / Error'
                      ? acc.balance
                      : `${Number(acc.balance).toLocaleString()} XLM`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {acc.balance === '0' && !acc.loading && (
                  <button
                    onClick={() => handleFundAccount(acc.address)}
                    disabled={fundingAddress === acc.address}
                    className="btn-ghost text-xs text-amber-400 border-amber-400/20"
                  >
                    {fundingAddress === acc.address ? 'Funding…' : '⚡ Fund Testnet'}
                  </button>
                )}
                <button
                  onClick={() => refreshAccount(acc.address)}
                  className="btn-ghost text-xs px-3 py-2"
                >
                  🔄
                </button>
                <button
                  onClick={() => handleRemove(acc.address)}
                  className="btn-ghost text-xs px-3 py-2 hover:text-red-400"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
