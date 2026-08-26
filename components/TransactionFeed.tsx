'use client';

import React from 'react';
import { History, ExternalLink, CheckCircle2, Clock, Hash } from 'lucide-react';

export interface TxRecord {
  id: string;
  txHash: string;
  blockHeight: number | null;
  message: string;
  timestamp: string;
  durationMs?: number;
}

interface TransactionFeedProps {
  transactions: TxRecord[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-6 sm:p-8 relative">
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
            key={tx.id}
            className="rounded-xl bg-midnight-950/70 p-4 border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-white truncate">&ldquo;{tx.message}&rdquo;</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-400 font-mono text-[11px]">
                <span className="truncate" title={tx.txHash}>
                  Tx: {tx.txHash.slice(0, 16)}...{tx.txHash.slice(-8)}
                </span>
                {tx.blockHeight && (
                  <span className="text-cyan-400">Block #{tx.blockHeight.toLocaleString()}</span>
                )}
              </div>
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
