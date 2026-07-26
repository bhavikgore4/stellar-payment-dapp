'use client';

import { useState } from 'react';
import { isValidStellarAddress } from '@/lib/validation';

const PRESET_AMOUNTS = ['1', '5', '10', '25', '50', '100'];

interface SendPaymentProps {
  publicKey: string | null;
  onSend: (recipient: string, amount: string, memo?: string) => void;
  sending: boolean;
}

export default function SendPayment({ publicKey, onSend, sending }: SendPaymentProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('5');
  const [customAmount, setCustomAmount] = useState('');
  const [memo, setMemo] = useState('');

  const finalAmount = customAmount || amount;
  const isRecipientValid = isValidStellarAddress(recipient);
  const isAmountValid = parseFloat(finalAmount) > 0;
  const canSend = publicKey && isRecipientValid && isAmountValid && !sending;

  const handleSend = () => {
    if (!canSend) return;
    onSend(recipient.trim(), finalAmount, memo || undefined);
  };

  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-blue-400">
            <path
              d="M22 2L11 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Send XLM</h2>
          <p className="text-xs text-slate-500 mt-0.5">Send a payment on Stellar Testnet</p>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Recipient Address</label>
        <input
          id="input-recipient"
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value.trim())}
          placeholder="G... (56-character Stellar public key)"
          className={`input-field font-mono text-xs ${
            recipient && !isRecipientValid
              ? 'border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20'
              : ''
          }`}
        />
        {recipient && !isRecipientValid && (
          <p className="mt-1.5 text-xs text-red-400">
            Invalid Stellar address. Must start with G and be 56 characters.
          </p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Amount (XLM)</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-3">
          {PRESET_AMOUNTS.map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => {
                setAmount(amt);
                setCustomAmount('');
              }}
              className={`rounded-xl border py-2.5 text-sm font-medium transition-all duration-150 ${
                amount === amt && !customAmount
                  ? 'border-blue-500 bg-blue-500/15 text-blue-400'
                  : 'border-white/8 bg-white/[0.03] text-slate-400 hover:border-white/15 hover:text-white'
              }`}
            >
              {amt}
            </button>
          ))}
        </div>
        <input
          id="input-custom-amount"
          type="number"
          min="0.0000001"
          step="any"
          placeholder="Custom amount…"
          value={customAmount}
          onChange={(e) => {
            setCustomAmount(e.target.value);
            setAmount('');
          }}
          className="input-field text-sm"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          Memo (Optional)
        </label>
        <input
          type="text"
          placeholder="Payment note…"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          className="input-field text-sm"
        />
      </div>

      {isRecipientValid && isAmountValid && (
        <div className="mb-4 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3 animate-slide-up">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">You are sending</span>
            <span className="text-sm font-semibold text-white">{finalAmount} XLM</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-slate-500">To</span>
            <span className="font-mono text-xs text-slate-300">
              {recipient.slice(0, 8)}...{recipient.slice(-8)}
            </span>
          </div>
        </div>
      )}

      <button
        id="btn-send-payment"
        type="button"
        onClick={handleSend}
        disabled={!canSend}
        className="btn-primary w-full"
      >
        {sending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
            Submitting to Stellar Testnet…
          </span>
        ) : !publicKey ? (
          'Connect Freighter to Send'
        ) : (
          `Send ${finalAmount || '0'} XLM →`
        )}
      </button>

      {!publicKey && (
        <p className="mt-2 text-center text-xs text-slate-500">
          Connect your Freighter wallet above to enable payments.
        </p>
      )}
    </div>
  );
}
