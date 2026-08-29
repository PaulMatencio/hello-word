'use client';

import React, { useState, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  History,
  ExternalLink,
  CheckCircle2,
  Clock,
  Hash,
  Flame,
  ShieldAlert,
  AlertTriangle,
  FileCode2,
  Zap,
  Rocket,
  Send,
  Copy,
  Check,
  ArrowRight
} from 'lucide-react';
import type { TxRecord } from '@/src/types/tx';

interface TransactionFeedProps {
  transactions: TxRecord[];
}

export const TransactionFeed: React.FC<TransactionFeedProps> = ({ transactions }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Determine the newest transaction (assuming array is newest-first)
  const latestTx = transactions && transactions.length > 0 ? transactions[0] : null;
  const isStale = useMemo(() => {
    if (!latestTx || !latestTx.timestamp) return false;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    return Date.now() - new Date(latestTx.timestamp).getTime() > twentyFourHours;
  }, [latestTx]);

  const copyToClipboard = useCallback((e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // Click handler to open explorer / scanner
  const handleTxClick = useCallback((txHash: string) => {
    if (!txHash) return;
    const scannerUrl = `https://midnightscanner.io/transactions/${txHash}?network=preprod`;
    window.open(scannerUrl, '_blank');
  }, []);

  // If there are no transactions, render nothing
  if (!transactions || transactions.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel p-6 sm:p-8 relative">
      {/* Stale scanner warning banner */}
      {isStale && latestTx?.timestamp && (
        <div className="mb-5 p-3 bg-amber-500/10 border border-amber-500/30 text-amber-200 rounded-xl flex items-center text-xs">
          <AlertTriangle className="w-4 h-4 mr-2 text-amber-400 shrink-0" />
          <span>
            MidnightScanner pre-prod last recorded transaction on{' '}
            <strong>{new Date(latestTx.timestamp).toLocaleDateString()}</strong>. Live status is active on Preprod nodes.
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <History className="h-4.5 w-4.5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Recent Midnight Transactions</h3>
            <p className="text-xs text-slate-400">Zero-Knowledge proofs and smart contract circuit interactions</p>
          </div>
        </div>
        <span className="text-xs text-slate-400 font-mono bg-midnight-950 px-2.5 py-1 rounded-lg border border-white/5">
          {transactions.length} record{transactions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Transaction Cards List */}
      <div className="space-y-3">
        {transactions.map((tx, idx) => {
          const isDeploy = tx.txType === 'contract_deploy' || tx.message?.startsWith('Contract Deployed');
          const isTransfer = tx.txType === 'token_transfer' || tx.message?.startsWith('Sent ');
          const isCircuitCall = !isDeploy && !isTransfer;
          const contractAddr = tx.contractAddress || (isDeploy ? tx.txHash : undefined);

          return (
            <div
              key={tx.id || tx.txHash || idx}
              onClick={() => handleTxClick(tx.txHash)}
              className="group rounded-xl bg-midnight-950/70 border border-white/5 hover:border-indigo-500/30 p-4 transition-all hover:bg-midnight-900/60 cursor-pointer space-y-3 shadow-sm"
            >
              {/* Row 1: Type badge, Contract info, Circuit info, and Timestamp */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {/* Transaction Type / Circuit Badge */}
                  {isDeploy ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-semibold text-[11px]">
                      <Rocket className="h-3 w-3 text-purple-400" />
                      <span>Contract Deploy</span>
                    </span>
                  ) : isTransfer ? (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-semibold text-[11px]">
                      <Send className="h-3 w-3 text-cyan-400" />
                      <span>Token Transfer</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold text-[11px]">
                      <Zap className="h-3 w-3 text-indigo-400" />
                      <span>Circuit: <strong className="font-mono text-white">{tx.circuitName || 'storeMessage'}</strong></span>
                    </span>
                  )}

                  {/* Contract Information Pill */}
                  {contractAddr && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center space-x-1.5 bg-midnight-900 px-2.5 py-1 rounded-lg border border-indigo-500/20 text-[11px] font-mono text-slate-300 hover:border-indigo-500/40 transition-colors"
                    >
                      <FileCode2 className="h-3 w-3 text-indigo-400 shrink-0" />
                      <span className="text-slate-400 font-sans">Contract:</span>
                      <Link
                        href={`/contracts/${encodeURIComponent(contractAddr)}`}
                        className="text-cyan-300 hover:text-white underline hover:no-underline"
                        title={`Open Workbench for ${contractAddr}`}
                      >
                        {contractAddr.slice(0, 8)}...{contractAddr.slice(-6)}
                      </Link>
                      <button
                        onClick={(e) => copyToClipboard(e, contractAddr, `contract-${tx.id || idx}`)}
                        className="text-slate-400 hover:text-white ml-1"
                        title="Copy contract address"
                      >
                        {copiedId === `contract-${tx.id || idx}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Timestamp & Duration */}
                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(tx.timestamp).toLocaleTimeString()}</span>
                  </div>
                  {tx.durationMs && (
                    <span className="bg-white/5 px-2 py-0.5 rounded text-slate-300 font-mono">
                      {(tx.durationMs / 1000).toFixed(1)}s
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Message / Payload preview */}
              {tx.message && (
                <div className="text-xs text-slate-200 bg-midnight-900/90 rounded-lg px-3 py-2 border border-white/5 font-medium flex items-center justify-between">
                  <div className="truncate mr-2">
                    <span className="text-slate-500 mr-2 text-[11px] uppercase font-semibold">Payload:</span>
                    <span className="text-white">&ldquo;{tx.message}&rdquo;</span>
                  </div>
                  {contractAddr && isCircuitCall && (
                    <Link
                      href={`/contracts/${encodeURIComponent(contractAddr)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] text-indigo-300 hover:text-indigo-200 flex items-center space-x-1 whitespace-nowrap shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <span>Workbench</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              )}

              {/* Row 3: Transaction hash, Block height, DUST fee, Explorer action */}
              <div className="flex flex-wrap items-center justify-between gap-y-1 text-slate-400 font-mono text-[11px] pt-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center space-x-1 text-slate-400">
                    <span className="text-slate-500 font-sans">Tx:</span>
                    <span className="text-slate-300" title={tx.txHash}>
                      {tx.txHash ? `${tx.txHash.slice(0, 12)}...${tx.txHash.slice(-6)}` : 'Pending'}
                    </span>
                    {tx.txHash && (
                      <button
                        onClick={(e) => copyToClipboard(e, tx.txHash, `tx-${tx.id || idx}`)}
                        className="text-slate-500 hover:text-white p-0.5"
                        title="Copy transaction hash"
                      >
                        {copiedId === `tx-${tx.id || idx}` ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {tx.blockHeight ? (
                    <span className="text-cyan-400 flex items-center space-x-1">
                      <Hash className="h-3 w-3 text-cyan-500" />
                      <span>#{tx.blockHeight.toLocaleString()}</span>
                    </span>
                  ) : (
                    <span className="text-slate-500">Block Pending</span>
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

                <div className="flex items-center space-x-1 text-indigo-400 group-hover:text-indigo-300 text-[11px] font-sans">
                  <span>Explorer</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
