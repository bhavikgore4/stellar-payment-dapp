'use client';

interface FaucetProps {
  publicKey: string | null;
  onFund: (targetKey: string) => void;
  funding: boolean;
}

export default function Faucet({ publicKey, onFund, funding }: FaucetProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-amber-400">
            <path
              d="M13 2L4.5 13.5H12L11 22L19.5 10.5H12L13 2Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-white">Testnet Faucet</h2>
          <p className="text-xs text-slate-500 mt-0.5">Get free XLM for testing</p>
        </div>
      </div>

      <div className="rounded-xl bg-amber-500/5 border border-amber-500/15 p-4 mb-5">
        <p className="text-sm text-slate-300 leading-relaxed">
          Stellar&apos;s <span className="text-amber-400 font-medium">Friendbot</span> funds any
          testnet account with{' '}
          <span className="text-white font-semibold">10,000 XLM</span> — free for testing. Only
          works on Testnet.
        </p>
      </div>

      {publicKey ? (
        <>
          <div className="mb-4">
            <p className="text-xs text-slate-500 mb-1.5">Target Account</p>
            <div className="rounded-xl bg-white/[0.03] border border-white/5 px-4 py-2.5">
              <code className="font-mono text-xs text-slate-300 break-all">{publicKey}</code>
            </div>
          </div>
          <button
            id="btn-request-faucet"
            onClick={() => onFund(publicKey)}
            disabled={funding}
            className="btn-primary w-full"
          >
            {funding ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Requesting from Friendbot…
              </span>
            ) : (
              '⚡ Request 10,000 Testnet XLM'
            )}
          </button>
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-white/8 p-8 text-center">
          <p className="text-sm text-slate-500">Connect your Freighter wallet to use the faucet.</p>
        </div>
      )}
    </div>
  );
}
