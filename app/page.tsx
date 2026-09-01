'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTransactions } from '@/src/presentation/context/TransactionContext';
import { useSystem } from '@/src/presentation/context/SystemContext';
import { TransactionFeed } from '@/components/TransactionFeed';
import {
  History,
  RefreshCw,
  Zap,
  FileCode2,
  Activity,
  ShieldCheck,
  ExternalLink,
  Layers,
} from 'lucide-react';

export default function Home() {
  const { transactions, fetchTransactions, isLoadingTx } = useTransactions();
  const { systemHealth } = useSystem();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh transaction history periodically
  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(() => {
      fetchTransactions();
    }, 8000);
    return () => clearInterval(interval);
  }, [fetchTransactions]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await fetchTransactions();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Quick statistics
  const deployCount = transactions.filter(
    (tx) => tx.txType === 'contract_deploy' || tx.message?.startsWith('Contract Deployed')
  ).length;

  const circuitCount = transactions.filter(
    (tx) => tx.txType !== 'contract_deploy' && tx.txType !== 'token_transfer' && !tx.message?.startsWith('Contract Deployed') && !tx.message?.startsWith('Sent ')
  ).length;

  const transferCount = transactions.filter(
    (tx) => tx.txType === 'token_transfer' || tx.message?.startsWith('Sent ')
  ).length;

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-6">
      {/* Top Banner / Dashboard Header */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Midnight Preprod Explorer & Ledger Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Recent Midnight Transactions
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Live Zero-Knowledge transactions, proof verifications, smart contract deployments, and circuit executions recorded on the Midnight network.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            onClick={handleManualRefresh}
            disabled={isLoadingTx || isRefreshing}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-midnight-900 hover:bg-midnight-800 border border-white/10 text-xs font-semibold text-slate-200 hover:text-white transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            title="Refresh transaction history"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-cyan-400 ${isRefreshing || isLoadingTx ? 'animate-spin' : ''}`} />
            <span>{isRefreshing || isLoadingTx ? 'Syncing...' : 'Refresh'}</span>
          </button>

          <Link
            href="/ide"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-lg transition-all"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>IDE Studio</span>
          </Link>

          <Link
            href="/contracts"
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-midnight-900 hover:bg-midnight-800 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <FileCode2 className="h-3.5 w-3.5 text-slate-400" />
            <span>Contracts</span>
          </Link>
        </div>
      </div>

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Transactions</span>
            <History className="h-4 w-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{transactions.length}</p>
          <p className="text-[11px] text-slate-500">Live recorded in session</p>
        </div>

        <div className="glass-panel p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Circuit Invocations</span>
            <Zap className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{circuitCount}</p>
          <p className="text-[11px] text-slate-500">ZK proofs & assertions</p>
        </div>

        <div className="glass-panel p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Contract Deploys</span>
            <Layers className="h-4 w-4 text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-white font-mono">{deployCount}</p>
          <p className="text-[11px] text-slate-500">On-chain deployments</p>
        </div>

        <div className="glass-panel p-4 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Network Health</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 font-mono">
            {systemHealth?.indexer?.status === 'online' && systemHealth?.proofServer?.status === 'online' ? 'Online' : 'Connected'}
          </p>
          <p className="text-[11px] text-slate-500">Preprod ZK Node</p>
        </div>
      </div>

      {/* Primary Component: Recent Midnight Transactions Feed */}
      <TransactionFeed transactions={transactions} />
    </div>
  );
}
