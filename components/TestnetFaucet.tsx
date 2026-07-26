'use client';

import { useState } from 'react';
import { requestTestnetFunds } from '@/lib/friendbot';
import { stellar } from '@/lib/stellar-helper';
import { FaFaucet, FaCheckCircle, FaExternalLinkAlt } from 'react-icons/fa';
import { Card, Input, Button, Alert } from './example-components';

interface TestnetFaucetProps {
  defaultAddress?: string;
  onFunded?: () => void;
}

export default function TestnetFaucet({ defaultAddress = '', onFunded }: TestnetFaucetProps) {
  const [address, setAddress] = useState(defaultAddress);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [txHash, setTxHash] = useState('');

  const validateAddress = (): boolean => {
    if (!address.trim()) {
      setInputError('Address is required');
      return false;
    }
    if (address.length !== 56 || !address.startsWith('G')) {
      setInputError('Invalid Stellar address (must start with G and be 56 characters)');
      return false;
    }
    setInputError('');
    return true;
  };

  const handleFund = async () => {
    if (!validateAddress()) return;

    setLoading(true);
    setAlert(null);
    setTxHash('');

    const result = await requestTestnetFunds(address.trim());

    if (result.success) {
      setTxHash(result.hash || '');
      setAlert({
        type: 'success',
        message: result.message + ' You received 10,000 testnet XLM from Friendbot.',
      });
      onFunded?.();
    } else {
      setAlert({ type: 'error', message: result.message });
    }

    setLoading(false);
  };

  const useConnectedAddress = () => {
    if (defaultAddress) {
      setAddress(defaultAddress);
      setInputError('');
    }
  };

  return (
    <Card>
      <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
        <FaFaucet className="text-sky-400" />
        Testnet Faucet
      </h2>
      <p className="text-white/60 text-sm mb-6">
        Request free testnet XLM with one click via Stellar Friendbot. Perfect for development and
        testing.
      </p>

      {alert && (
        <div className="mb-4">
          <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />
        </div>
      )}

      {txHash && (
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-start gap-3">
            <FaCheckCircle className="text-green-400 text-xl flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="text-green-400 font-semibold mb-2">Funding Confirmed!</p>
              <p className="text-white/70 text-sm mb-2">Transaction Hash:</p>
              <p className="text-white/90 text-xs font-mono break-all mb-3">{txHash}</p>
              <a
                href={stellar.getExplorerLink(txHash, 'tx')}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
              >
                View on Stellar Expert <FaExternalLinkAlt className="text-xs" />
              </a>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <Input
          label="Your Stellar Testnet Address"
          placeholder="GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          value={address}
          onChange={setAddress}
          error={inputError}
        />

        {defaultAddress && address !== defaultAddress && (
          <button
            type="button"
            onClick={useConnectedAddress}
            className="text-blue-400 hover:text-blue-300 text-sm underline"
          >
            Use connected wallet address
          </button>
        )}

        <Button onClick={handleFund} disabled={loading} variant="primary" fullWidth>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-4 border-solid border-white border-r-transparent" />
              Requesting XLM...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <FaFaucet /> Request 10,000 Testnet XLM
            </span>
          )}
        </Button>
      </div>

      <div className="mt-6 p-4 bg-sky-500/10 border border-sky-500/30 rounded-lg space-y-2">
        <p className="text-sky-200/90 text-sm font-semibold">How it works</p>
        <ul className="text-white/60 text-xs space-y-1 list-disc list-inside">
          <li>Friendbot creates or funds your testnet account with 10,000 XLM</li>
          <li>Only works on Stellar Testnet — not real money</li>
          <li>If your account already exists, Friendbot adds more testnet XLM</li>
          <li>Install Freighter wallet and switch to Testnet before connecting</li>
        </ul>
      </div>
    </Card>
  );
}
