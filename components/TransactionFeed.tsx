'use client';

import React, { useCallback, useMemo } from 'react';
import { History, ExternalLink, CheckCircle2, Clock, Hash, Flame, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { TxRecord } from '@/src/types/tx';

interface TransactionFeedProps {
  transactions: TxRecord[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  // If there are no transactions, render nothing
  if (transactions.length === 0) {
    return null;
  }

  // Determine the newest transaction (assuming the array is sorted newest‑first)
  const latestTx = useMemo(() => transactions[0], [transactions]);
  const isStale = useMemo(() => {
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - new Date(latestTx.timestamp).getTime() > twentyFourHours;
  }, [latestTx]);

  // Click handler: copy hash, then open MidnightScanner transaction page. If scanner is unavailable (e.g., returns 500), fall back to raw node JSON URL.
  const handleTxClick = useCallback(async (txHash: string) => {
    try {
      // Attempt to check scanner availability via HEAD request
      const scannerUrl = `https://midnightscanner.io/transactions/${txHash}?network=preprod`;
      const response = await fetch(scannerUrl, { method: 'HEAD' });
      const finalUrl = response.ok ? scannerUrl : `https://preprod.midnightnode.io/api/v1/tx/${txHash}`;
      // Copy hash to clipboard
      await navigator.clipboard.writeText(txHash);
      // Open appropriate URL
      window.open(finalUrl, '_blank');
    } catch (err) {
      console.error('Failed to handle transaction click:', err);
    }
  }, []);

  return (
    <div className="glass-panel p-6 sm:p-8 relative">
      {/* Stale‑scanner warning banner */}
      {isStale && (
        <div className="mb-4 p-2 bg-amber-700/30 text-amber-200 rounded flex items-center">
          <AlertTriangle className="w-4 h-4 mr-2" />
          <span>
            MidnightScanner pre‑prod appears out‑of‑date (last transaction recorded on{' '}
            {new Date(latestTx.timestamp).toLocaleDateString()})
          </span>
        </div>
      )}

      <div className="flex items-center space-x-3 border-b border-white/5 pb-4 mb-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <History className="h-4 w-4 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Recent Midnight Transactions</h3>
          <p className="text-xs text-slate-400">Zero-knowledge proofs submitted in this session</p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((tx) => (
          <div
            key={tx.txHash}
            className="flex flex-col gap-2 p-2 rounded hover:bg-white/5 cursor-pointer"
            onClick={() => handleTxClick(tx.txHash)}
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-slate-400 font-mono text-[11px]">
              <span className="truncate" title={tx.txHash}>
                Tx: {tx.txHash.slice(0, 16)}...{tx.txHash.slice(-8)}
              </span>
              {tx.blockHeight && (
                <span className="text-cyan-400">Block #{tx.blockHeight.toLocaleString()}</span>
              )}
              {tx.error ? (
                <div className="flex items-center text-rose-400">
                  <ShieldAlert className="h-3 w-3 mr-1" />
                  <span>{tx.error}</span>
                </div>
              ) : (
                tx.dustPaid && tx.dustPaid !== '0' && (
                  <span className="flex items-center space-x-1 text-amber-300 font-semibold">
                    <Flame className="h-3 w-3 text-amber-400" />
                    <span>{BigInt(tx.dustPaid).toLocaleString()} DUST</span>
                  </span>
                )
              )}
            </div>
            <div className="flex items-center space-x-3 text-slate-400 text-[11px] shrink-0 self-end sm:self-center">
              <div className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
              </div>
              {tx.durationMs && (
                <span className="bg-white/5 px-2 py-0.5 rounded text-slate-300">
                  {(tx.durationMs / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
