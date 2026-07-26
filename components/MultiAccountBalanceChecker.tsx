'use client';

import { useState } from 'react';
import { stellar } from '@/lib/stellar-helper';
import { FaPlus, FaTrash, FaSync, FaSearch } from 'react-icons/fa';
import { Card, Input, Button, Alert } from './example-components';

interface AccountBalance {
  address: string;
  xlm: string;
  error?: string;
}

export default function MultiAccountBalanceChecker() {
  const [inputAddress, setInputAddress] = useState('');
  const [accounts, setAccounts] = useState<AccountBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null
  );

  const validateAddress = (address: string): boolean => {
    if (!address.trim()) {
      setInputError('Address is required');
      return false;
    }
    if (address.length !== 56 || !address.startsWith('G')) {
      setInputError('Invalid Stellar address (must start with G and be 56 characters)');
      return false;
    }
    if (accounts.some((a) => a.address === address)) {
      setInputError('This address is already in the list');
      return false;
    }
    setInputError('');
    return true;
  };

  const fetchBalanceForAddress = async (address: string): Promise<AccountBalance> => {
    try {
      const data = await stellar.getBalance(address);
      return { address, xlm: data.xlm };
    } catch {
      return {
        address,
        xlm: '0',
        error: 'Account not found or unfunded on testnet',
      };
    }
  };

  const handleAddAccount = async () => {
    const trimmed = inputAddress.trim();
    if (!validateAddress(trimmed)) return;

    setLoading(true);
    setAlert(null);

    const result = await fetchBalanceForAddress(trimmed);
    setAccounts((prev) => [...prev, result]);
    setInputAddress('');

    if (result.error) {
      setAlert({ type: 'error', message: result.error });
    } else {
      setAlert({ type: 'success', message: 'Account added and balance loaded.' });
    }

    setLoading(false);
  };

  const handleRefreshAll = async () => {
    if (accounts.length === 0) return;

    setLoading(true);
    setAlert(null);

    const refreshed = await Promise.all(
      accounts.map((account) => fetchBalanceForAddress(account.address))
    );
    setAccounts(refreshed);
    setAlert({ type: 'success', message: 'All balances refreshed.' });
    setLoading(false);
  };

  const handleRemove = (address: string) => {
    setAccounts((prev) => prev.filter((a) => a.address !== address));
  };

  const formatBalance = (balance: string): string => {
    const num = parseFloat(balance);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 7,
    });
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <FaSearch className="text-cyan-400" />
        Wallet Balance Checker
      </h2>
      <p className="text-white/60 text-sm mb-6">
        Look up XLM balances for multiple Stellar testnet accounts — no wallet connection required.
      </p>

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <Input
            label="Stellar Address"
            placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            value={inputAddress}
            onChange={setInputAddress}
            error={inputError}
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={handleAddAccount} disabled={loading} variant="primary">
            <span className="flex items-center gap-2">
              <FaPlus /> Add Account
            </span>
          </Button>
          {accounts.length > 0 && (
            <Button onClick={handleRefreshAll} disabled={loading} variant="secondary">
              <span className="flex items-center gap-2">
                <FaSync className={loading ? 'animate-spin' : ''} /> Refresh All
              </span>
            </Button>
          )}
        </div>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-white/5 rounded-xl border border-white/10">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white font-semibold mb-1">No accounts added yet</p>
          <p className="text-white/50 text-sm">
            Enter a Stellar public key above to check its XLM balance
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {accounts.map((account) => (
            <div
              key={account.address}
              className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <p className="text-white/50 text-xs mb-1">Address</p>
                <p className="text-white font-mono text-sm break-all">{account.address}</p>
                <a
                  href={stellar.getExplorerLink(account.address, 'account')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 text-xs mt-1 inline-block"
                >
                  View on Stellar Expert →
                </a>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white/50 text-xs mb-1">Balance</p>
                  {account.error ? (
                    <p className="text-red-400 text-sm">{account.error}</p>
                  ) : (
                    <p className="text-2xl font-bold text-white">
                      {formatBalance(account.xlm)}{' '}
                      <span className="text-lg text-white/70">XLM</span>
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(account.address)}
                  className="text-red-400 hover:text-red-300 p-2 transition-colors"
                  title="Remove account"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
