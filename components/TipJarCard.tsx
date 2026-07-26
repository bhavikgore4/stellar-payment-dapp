'use client';

import { useState } from 'react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { TIP_JAR_ADDRESS } from '@/lib/config';
import { isValidStellarAddress } from '@/lib/validation';

interface TipJarCardProps {
  connectedPublicKey: string | null;
  onSendTip: (recipient: string, amount: string, memo?: string) => void;
  sending: boolean;
}

export default function TipJarCard({
  connectedPublicKey,
  onSendTip,
  sending,
}: TipJarCardProps) {
  const [recipientAddress, setRecipientAddress] = useState(TIP_JAR_ADDRESS);
  const [tipAmount, setTipAmount] = useState('5');
  const [customAmount, setCustomAmount] = useState('');
  const [tipNote, setTipNote] = useState('');

  const activeAddress = recipientAddress || TIP_JAR_ADDRESS;
  const isAddressValid = isValidStellarAddress(activeAddress);
  const finalAmount = customAmount || tipAmount;
  const isAmountValid = parseFloat(finalAmount) > 0;

  const handleSend = () => {
    if (!isAddressValid || !isAmountValid || !connectedPublicKey) return;
    onSendTip(activeAddress, finalAmount, tipNote || undefined);
  };

  return (
    <div className="card p-6 sm:p-8">
      <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:justify-between gap-6">
        <div className="flex-1">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
            ☕ Stellar Tip Jar
          </span>
          <h2 className="mt-3 text-xl font-bold text-white">Support with a Testnet Tip</h2>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">
            Send instant testnet XLM tips to any Stellar wallet address. Scan the QR code to copy
            the recipient address.
          </p>
        </div>

        {isAddressValid && (
          <div className="flex flex-col items-center rounded-xl border border-blue-500/30 bg-white/[0.02] p-3">
            <QRCodeDisplay value={activeAddress} size={112} />
            <span className="mt-2 font-mono text-[10px] uppercase tracking-wider text-blue-400">
              Scan to Pay
            </span>
          </div>
        )}
      </div>

      <div className="mt-6">
        <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Recipient Public Key (G... address)
        </label>
        <input
          type="text"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value.trim())}
          placeholder="Enter recipient G... public key"
          className={`input-field font-mono text-xs ${
            recipientAddress && !isAddressValid ? 'border-red-500/50' : ''
          }`}
        />
        {recipientAddress && !isAddressValid && (
          <p className="mt-1 font-mono text-[11px] text-red-400">
            Invalid Stellar public key. Must be 56 characters starting with G.
          </p>
        )}
      </div>

      <div className="mt-6">
        <label className="block font-mono text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
          Select Tip Amount
        </label>
        <div className="grid grid-cols-4 gap-2.5">
          {['1', '5', '10', '25'].map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setTipAmount(amt);
                setCustomAmount('');
              }}
              className={`rounded-xl border py-3 text-sm font-bold transition duration-200 ${
                tipAmount === amt && !customAmount
                  ? 'border-amber-500 bg-amber-500/20 text-amber-400 scale-[1.02]'
                  : 'border-white/8 bg-white/[0.03] text-slate-400 hover:border-blue-500/50 hover:text-white'
              }`}
            >
              {amt} XLM
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-mono text-[11px] text-slate-500 mb-1">Custom Amount (XLM)</label>
          <input
            type="number"
            step="any"
            placeholder="Custom amount"
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value);
              setTipAmount('');
            }}
            className="input-field font-mono text-xs"
          />
        </div>
        <div>
          <label className="block font-mono text-[11px] text-slate-500 mb-1">Optional Note</label>
          <input
            type="text"
            placeholder="Thanks for the help!"
            value={tipNote}
            onChange={(e) => setTipNote(e.target.value)}
            className="input-field font-mono text-xs"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={handleSend}
        disabled={!connectedPublicKey || !isAddressValid || !isAmountValid || sending}
        className="mt-6 w-full rounded-xl bg-amber-500 py-4 text-base font-bold text-surface-900 transition duration-200 hover:bg-amber-400 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-surface-700 disabled:text-slate-500 disabled:transform-none"
      >
        {sending
          ? 'Submitting Tip to Stellar Testnet…'
          : !connectedPublicKey
            ? 'Connect Freighter Wallet to Tip'
            : `Send ${finalAmount || '0'} XLM Tip ☕`}
      </button>
    </div>
  );
}
