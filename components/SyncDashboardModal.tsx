'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  X,
  RefreshCw,
  CheckCircle2,
  Shield,
  Flame,
  Coins,
  Wifi,
  Copy,
  Check,
  Zap,
  Radio,
  Clock,
} from 'lucide-react';

export interface SyncProgressDetails {
  appliedId: string;
  highestTransactionId: string;
  isConnected: boolean;
  percentage: number;
  unshielded?: { applied: string; highest: string; percentage: number };
  shielded?: { applied: string; highest: string; percentage: number };
  dust?: { applied: string; highest: string; percentage: number };
}

interface SyncDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  seed: string;
  initialData?: SyncProgressDetails;
  isSynced: boolean;
}

interface ActivityLogItem {
  id: string;
  timestamp: string;
  subwallet: 'unshielded' | 'shielded' | 'dust' | 'system';
  message: string;
  delta?: number;
}

export const SyncDashboardModal: React.FC<SyncDashboardModalProps> = ({
  isOpen,
  onClose,
  seed,
  initialData,
  isSynced,
}) => {
  const [data, setData] = useState<SyncProgressDetails | null>(initialData || null);
  const [pollInterval, setPollInterval] = useState<number>(1500); // 1.5s live polling
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [throughput, setThroughput] = useState<number>(0);

  const prevDustRef = useRef<bigint>(0n);
  const prevTimeRef = useRef<number>(Date.now());
  const logContainerRef = useRef<HTMLDivElement>(null);

  const fetchTelemetry = async () => {
    if (!seed) return;
    try {
      const res = await fetch('/api/wallet/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed }),
      });
      const json = await res.json();
      if (json.success && json.data?.syncProgress) {
        const p: SyncProgressDetails = json.data.syncProgress;
        setData(p);

        // Calculate DUST throughput
        const currentDust = p.dust?.applied ? BigInt(p.dust.applied) : 0n;
        const now = Date.now();
        const timeDiff = (now - prevTimeRef.current) / 1000;

        if (prevDustRef.current > 0n && currentDust > prevDustRef.current && timeDiff > 0) {
          const delta = currentDust - prevDustRef.current;
          const rate = Math.round(Number(delta) / timeDiff);
          setThroughput(rate);

          // Add log item only when new items were actually processed
          setActivityLogs((prev) => [
            {
              id: Math.random().toString(),
              timestamp: new Date().toLocaleTimeString(),
              subwallet: 'dust',
              message: `Indexed +${delta.toLocaleString()} items (at ${rate.toLocaleString()} items/s) • Total: ${currentDust.toLocaleString()}`,
              delta: Number(delta),
            },
            ...prev.slice(0, 49),
          ]);
        } else if (currentDust === prevDustRef.current && prevDustRef.current > 0n) {
          // Idle / waiting for next batch from indexer
          setThroughput(0);
        }

        prevDustRef.current = currentDust;
        prevTimeRef.current = now;
      }
    } catch (err) {
      console.error('Error polling telemetry:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    fetchTelemetry();
    if (isPaused) return;

    const interval = setInterval(fetchTelemetry, pollInterval);
    return () => clearInterval(interval);
  }, [isOpen, pollInterval, isPaused, seed]);

  if (!isOpen) return null;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pUnshielded = data?.unshielded?.percentage ?? (isSynced ? 100 : 0);
  const pShielded = data?.shielded?.percentage ?? (isSynced ? 100 : 0);
  const pDust = data?.dust?.percentage ?? (isSynced ? 100 : 0);
  const totalPercentage = isSynced ? 100 : (data?.percentage ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-midnight-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-4xl glass-panel border border-indigo-500/30 shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[90vh] bg-midnight-900/95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-midnight-950/80">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Activity className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Midnight Sync Activity & Telemetry Monitor
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Real-time convergence tracking for all 3 Midnight state machines
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Poll rate controls */}
            <div className="hidden sm:flex items-center rounded-lg bg-midnight-950 p-1 border border-white/10 text-xs">
              <button
                onClick={() => {
                  setPollInterval(1000);
                  setIsPaused(false);
                }}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  pollInterval === 1000 && !isPaused
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1s Live
              </button>
              <button
                onClick={() => {
                  setPollInterval(3000);
                  setIsPaused(false);
                }}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  pollInterval === 3000 && !isPaused
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3s
              </button>
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`px-2.5 py-1 rounded font-medium transition-all ${
                  isPaused
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>

            <button
              onClick={fetchTelemetry}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-all border border-white/5"
              title="Refresh Now"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/20 hover:text-rose-300 text-slate-400 transition-all border border-white/5"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Top Overview Meter */}
          <div className="rounded-2xl bg-midnight-950/80 p-5 border border-white/10 shadow-inner">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400">
                  Total Synchronization Progress
                </span>
                <div className="flex items-baseline space-x-2 mt-0.5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {totalPercentage}%
                  </span>
                  <span className="text-xs text-slate-400">
                    {isSynced
                      ? 'Fully synchronized with Midnight Preprod tip'
                      : 'Actively processing blockchain stream...'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3 text-xs">
                <div className="flex items-center space-x-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                  <Wifi className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-slate-400">Indexer WS:</span>
                  <span className="text-emerald-400 font-semibold">
                    {data?.isConnected ? 'Connected' : 'Connecting'}
                  </span>
                </div>
                {throughput > 0 && (
                  <div className="flex items-center space-x-1.5 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-300">
                    <Zap className="h-3.5 w-3.5" />
                    <span>~{throughput.toLocaleString()} items/s</span>
                  </div>
                )}
              </div>
            </div>

            {/* Main Progress Bar */}
            <div className="w-full bg-midnight-900 rounded-full h-3.5 overflow-hidden p-0.5 border border-white/10">
              <div
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                style={{ width: `${totalPercentage}%` }}
              />
            </div>
          </div>

          {/* 3 Sub-Wallets Telemetry Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Unshielded Sub-Wallet */}
            <div className="rounded-xl bg-midnight-950/70 p-4 border border-cyan-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-cyan-300">
                    <Coins className="h-4 w-4" />
                    <span>Unshielded Wallet</span>
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold">{pUnshielded}%</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Applied ID:</span>
                    <span className="text-white font-semibold">
                      {Number(data?.unshielded?.applied || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Chain Tip ID:</span>
                    <span className="text-slate-300">
                      {Number(data?.unshielded?.highest || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-midnight-900 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-cyan-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pUnshielded}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 2. Shielded Zswap Sub-Wallet */}
            <div className="rounded-xl bg-midnight-950/70 p-4 border border-purple-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-purple-300">
                    <Shield className="h-4 w-4" />
                    <span>Shielded Zswap</span>
                  </span>
                  <span className="text-xs font-mono text-purple-400 font-bold">{pShielded}%</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Applied Commitments:</span>
                    <span className="text-white font-semibold">
                      {Number(data?.shielded?.applied || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Status:</span>
                    <span className={pShielded === 100 ? 'text-emerald-400' : 'text-amber-400'}>
                      {pShielded === 100 ? '✓ Up to date' : 'Indexing...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-midnight-900 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-purple-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pShielded}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 3. DUST Engine */}
            <div className="rounded-xl bg-midnight-950/70 p-4 border border-amber-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center space-x-1.5 text-xs font-bold text-amber-300">
                    <Flame className="h-4 w-4" />
                    <span>DUST Engine</span>
                  </span>
                  <span className="text-xs font-mono text-amber-400 font-bold">{pDust}%</span>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Applied UTXOs:</span>
                    <span className="text-white font-semibold">
                      {Number(data?.dust?.applied || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Sync Activity:</span>
                    <span className={isSynced ? 'text-emerald-400' : 'text-amber-300 animate-pulse'}>
                      {isSynced ? '✓ Synced' : 'Processing stream...'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-midnight-900 rounded-full h-2 overflow-hidden border border-white/5">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${pDust}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Event Log */}
          <div className="rounded-xl bg-midnight-950/90 p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3 border-b border-white/5 pb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>Live Ingestion Event Feed</span>
              </span>
              <button
                onClick={handleCopyJson}
                className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-white"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'JSON Copied' : 'Copy Raw Telemetry'}</span>
              </button>
            </div>

            <div
              ref={logContainerRef}
              className="h-36 overflow-y-auto space-y-1.5 font-mono text-[11px] text-slate-300 select-text"
            >
              {activityLogs.length > 0 ? (
                activityLogs.map((log) => (
                  <div key={log.id} className="flex items-center space-x-2">
                    <span className="text-slate-500">{log.timestamp}</span>
                    <span className="text-amber-400 font-semibold">[DUST Engine]</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="flex items-center space-x-2 text-slate-500 italic py-2">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Listening to Midnight Preprod indexer block updates...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-midnight-950/80 flex items-center justify-between text-xs text-slate-400">
          <span>Connected to preprod indexer • Auto-refresh active</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
