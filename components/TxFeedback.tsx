'use client';

export interface TxResult {
  status: 'pending' | 'success' | 'error';
  hash?: string;
  message?: string;
}

interface TxFeedbackProps {
  result: TxResult | null;
  onDismiss?: () => void;
}

export default function TxFeedback({ result, onDismiss }: TxFeedbackProps) {
  if (!result) return null;

  if (result.status === 'pending') {
    return (
      <div className="card px-5 py-4 border-blue-500/20 animate-slide-up">
        <div className="flex items-center gap-3">
          <span className="h-4 w-4 flex-shrink-0 rounded-full border-2 border-blue-400 border-t-transparent animate-spin" />
          <div>
            <p className="text-sm font-medium text-blue-400">Processing Transaction</p>
            <p className="text-xs text-slate-500 mt-0.5">Signing & submitting to Stellar Testnet…</p>
          </div>
        </div>
      </div>
    );
  }

  if (result.status === 'error') {
    return (
      <div className="card px-5 py-4 border-red-500/20 animate-slide-up">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-500/15">
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                <path
                  d="M2 2L10 10M10 2L2 10"
                  stroke="#f87171"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-red-400">Transaction Failed</p>
              <p className="mt-1 text-xs text-slate-400 break-words max-w-sm">{result.message}</p>
            </div>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-xs text-slate-500 hover:text-white flex-shrink-0"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="card px-5 py-4 border-green-500/20 animate-slide-up">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-green-500/15">
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="#4ade80"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-400">Transaction Confirmed ✓</p>
            <p className="mt-1 text-xs text-slate-500">Transaction Hash</p>
            <p className="mt-0.5 font-mono text-xs text-white break-all">{result.hash}</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${result.hash}`}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
            >
              View on Stellar Expert ↗
            </a>
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-xs text-slate-500 hover:text-white flex-shrink-0"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
