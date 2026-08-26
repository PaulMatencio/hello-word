'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Coins,
  Flame,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Key,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Eye,
  EyeOff,
  PlusCircle,
  Activity,
} from 'lucide-react';

interface WalletStudioProps {
  seed: string;
  setSeed: (seed: string) => void;
  walletStatus: {
    address: string;
    isSynced: boolean;
    tNightBalance: string;
    dustBalance: string;
    faucetUrl: string;
    syncProgress?: {
      appliedId: string;
      highestTransactionId: string;
      isConnected: boolean;
      percentage: number;
      unshielded?: { applied: string; highest: string; percentage: number };
      shielded?: { applied: string; highest: string; percentage: number };
      dust?: { applied: string; highest: string; percentage: number };
    };
  } | null;
  isLoading: boolean;
  onRefresh: () => void;
  onRegisterDust: () => Promise<void>;
  isRegisteringDust: boolean;
  defaultSeed?: string;
  onOpenSyncDashboard?: () => void;
}

export const WalletStudio: React.FC<WalletStudioProps> = ({
  seed,
  setSeed,
  walletStatus,
  isLoading,
  onRefresh,
  onRegisterDust,
  isRegisteringDust,
  defaultSeed,
  onOpenSyncDashboard,
}) => {
  const [showSeed, setShowSeed] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [copiedSeed, setCopiedSeed] = useState(false);
  const [inputSeed, setInputSeed] = useState(seed);

  useEffect(() => {
    setInputSeed(seed);
  }, [seed]);

  const handleCopyAddr = () => {
    if (!walletStatus?.address) return;
    navigator.clipboard.writeText(walletStatus.address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  const handleCopySeed = () => {
    if (!seed) return;
    navigator.clipboard.writeText(seed);
    setCopiedSeed(true);
    setTimeout(() => setCopiedSeed(false), 2000);
  };

  const handleGenerateSeed = () => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const newSeed = Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
    setSeed(newSeed);
    setInputSeed(newSeed);
  };

  const handleSaveSeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputSeed.trim()) {
      setSeed(inputSeed.trim());
    }
  };

  const handleLoadDefaultSeed = () => {
    if (defaultSeed) {
      setSeed(defaultSeed);
      setInputSeed(defaultSeed);
    }
  };

  const rawNight = walletStatus?.tNightBalance ? BigInt(walletStatus.tNightBalance) : 0n;
  const formattedTNight = (Number(rawNight) / 1_000_000).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 6,
  });
  const rawDust = walletStatus?.dustBalance ? BigInt(walletStatus.dustBalance) : 0n;
  const formattedDust = Number(rawDust).toLocaleString();

  return (
    <div className="glass-panel p-6 sm:p-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-purple-500/30">
            <Wallet className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Wallet Studio
              {!walletStatus ? (
                <span className="flex items-center space-x-1.5 rounded-full bg-slate-800 px-2.5 py-0.5 text-[11px] font-medium text-slate-400 border border-white/10">
                  <RefreshCw className="h-3 w-3 animate-spin text-slate-400" />
                  <span>Connecting...</span>
                </span>
              ) : walletStatus.isSynced ? (
                <button
                  onClick={onOpenSyncDashboard}
                  className="flex items-center space-x-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                  title="Click to open Live Sync Telemetry Monitor"
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>Synced</span>
                </button>
              ) : (
                <button
                  onClick={onOpenSyncDashboard}
                  className="flex items-center space-x-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer"
                  title="Click to open Live Sync Telemetry Monitor"
                >
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  <span>
                    Syncing... {walletStatus?.syncProgress?.percentage !== undefined ? `${walletStatus.syncProgress.percentage}%` : ''}
                  </span>
                </button>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
              <span>Midnight Multi-Role HD Wallet</span>
              {!walletStatus?.isSynced && walletStatus?.syncProgress?.unshielded && (
                <span className="text-[11px] text-slate-500 font-mono">
                  [Unshielded: {walletStatus.syncProgress.unshielded.percentage}% | Shielded: {walletStatus.syncProgress.shielded?.percentage ?? 0}% | DUST: {walletStatus.syncProgress.dust?.percentage ?? 0}%]
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {onOpenSyncDashboard && (
            <button
              onClick={onOpenSyncDashboard}
              className="flex items-center space-x-1.5 rounded-lg bg-midnight-900/80 px-3 py-1.5 text-xs font-medium text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-200 transition-all"
            >
              <Activity className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
              <span>Sync Monitor</span>
            </button>
          )}
          <button
            onClick={onRefresh}
            disabled={isLoading || !seed}
            className="flex items-center space-x-1.5 rounded-lg bg-midnight-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 border border-white/10 hover:border-purple-500/40 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span>{isLoading ? 'Updating...' : 'Refresh Balance'}</span>
          </button>
        </div>
      </div>

      {/* Seed Configuration Bar */}
      <div className="mt-6">
        <form onSubmit={handleSaveSeed} className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-indigo-400" />
              <span>Wallet Seed (64 hex characters)</span>
            </label>
            <div className="flex items-center space-x-2 text-xs">
              {defaultSeed && (
                <button
                  type="button"
                  onClick={handleLoadDefaultSeed}
                  className="text-indigo-400 hover:text-indigo-300 hover:underline"
                >
                  Use Deployment Seed
                </button>
              )}
              <button
                type="button"
                onClick={handleGenerateSeed}
                className="text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1"
              >
                <PlusCircle className="h-3 w-3" />
                <span>Generate New</span>
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type={showSeed ? 'text' : 'password'}
                value={inputSeed}
                onChange={(e) => setInputSeed(e.target.value)}
                placeholder="Paste 64-character hex seed..."
                className="w-full rounded-xl bg-midnight-950/80 px-4 py-2.5 text-xs font-mono text-slate-200 border border-white/10 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/20"
              />
              <button
                type="button"
                onClick={() => setShowSeed(!showSeed)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showSeed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <button
              type="submit"
              disabled={inputSeed === seed}
              className="rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-purple-500 disabled:opacity-40 transition-all"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleCopySeed}
              className="rounded-xl bg-white/5 px-3 py-2.5 text-xs text-slate-300 hover:bg-white/10 hover:text-white border border-white/5"
              title="Copy Seed"
            >
              {copiedSeed ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>

      {/* Address & Balances Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Bech32 Address Card */}
        <div className="rounded-xl bg-midnight-950/80 p-4 border border-white/5 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400 block mb-1">
              Unshielded Address (Bech32)
            </span>
            <p className="font-mono text-xs text-slate-200 break-all line-clamp-2">
              {walletStatus?.address || (seed ? 'Deriving address...' : 'No wallet connected')}
            </p>
          </div>
          {walletStatus?.address && (
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
              <button
                onClick={handleCopyAddr}
                className="inline-flex items-center space-x-1 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                {copiedAddr ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedAddr ? 'Copied to Clipboard' : 'Copy Address'}</span>
              </button>
            </div>
          )}
        </div>

        {/* tNIGHT Balance */}
        <div className="rounded-xl bg-midnight-950/80 p-4 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                tNIGHT Balance
              </span>
              <Coins className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="mt-1">
              <div className="flex items-baseline space-x-1.5">
                <p className="text-2xl font-bold text-white tracking-tight">{formattedTNight}</p>
                <span className="text-xs text-cyan-400 font-semibold">tNIGHT</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                {rawNight > 0n ? `${rawNight.toLocaleString()} base units` : 'Unshielded Native Token'}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5">
            <a
              href="https://midnight-tmnight-preprod.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              <span>Get Free tNIGHT</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* DUST Balance */}
        <div className="rounded-xl bg-midnight-950/80 p-4 border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
                DUST Balance
              </span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-1">
              <p className="text-2xl font-bold text-amber-300 tracking-tight">{formattedDust}</p>
              <p className="text-[11px] text-slate-500">Zero-Knowledge Gas Token</p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
            <button
              onClick={onRegisterDust}
              disabled={isRegisteringDust || !walletStatus || BigInt(walletStatus.tNightBalance || 0) === 0n}
              className="inline-flex items-center space-x-1 text-xs text-amber-400 hover:text-amber-300 font-medium disabled:opacity-40 disabled:hover:text-amber-400"
            >
              <Zap className={`h-3 w-3 ${isRegisteringDust ? 'animate-bounce' : ''}`} />
              <span>{isRegisteringDust ? 'Registering...' : 'Register for DUST'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Nethermind Faucet Notice Alert */}
      <div className="mt-5 rounded-xl bg-indigo-950/30 p-4 border border-indigo-500/20 text-xs text-slate-300 flex items-start space-x-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-slate-200">
            Preprod Faucet Notice
          </p>
          <p className="text-slate-400 leading-relaxed">
            Need test tokens? Copy your Bech32 address above and request tNIGHT from the active Nethermind Preprod Faucet at{' '}
            <a
              href="https://midnight-tmnight-preprod.nethermind.dev/"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-400 underline font-mono hover:text-cyan-300"
            >
              midnight-tmnight-preprod.nethermind.dev
            </a>
            . Once received, click <strong>&quot;Register for DUST&quot;</strong> to start generating gas tokens.
          </p>
        </div>
      </div>
    </div>
  );
};
