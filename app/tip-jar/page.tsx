'use client';

import Link from 'next/link';
import { useState } from 'react';
import QRCodeDisplay from '@/components/QRCodeDisplay';
import { TIP_JAR_ADDRESS } from '@/lib/config';

export default function TipJarPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(TIP_JAR_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-surface-900 text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />

      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:py-16">
        <div className="text-center mb-8">
          <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 font-mono text-xs font-bold text-amber-400 border border-amber-500/30">
            ☕ Tip Jar
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white">Send a Testnet Tip</h1>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Scan the QR code or copy the address below to send testnet XLM.
          </p>
        </div>

        <div className="card p-6 sm:p-8 flex flex-col items-center">
          <QRCodeDisplay value={TIP_JAR_ADDRESS} size={200} label="Scan to Pay" />

          <div className="w-full mt-8 rounded-xl bg-white/[0.02] border border-white/5 px-4 py-3">
            <p className="text-xs text-slate-500 mb-2 text-center">Donation Address (Testnet)</p>
            <div className="flex items-center justify-between gap-3">
              <p className="text-white font-mono text-xs break-all flex-1">{TIP_JAR_ADDRESS}</p>
              <button
                type="button"
                onClick={handleCopy}
                className="btn-ghost text-xs px-3 py-2 flex-shrink-0"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <a
            href={`https://stellar.expert/explorer/testnet/account/${TIP_JAR_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 text-blue-400 hover:text-blue-300 text-sm"
          >
            View on Stellar Expert →
          </a>
        </div>

        <div className="text-center mt-8">
          <Link href="/" className="text-slate-500 hover:text-white text-sm transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
