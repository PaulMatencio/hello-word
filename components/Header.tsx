'use client';

import React from 'react';
import { Shield, Cpu, Activity, ExternalLink, Terminal, Layers } from 'lucide-react';

interface HeaderProps {
  systemHealth: {
    proofServer: { url: string; status: string };
    indexer: { url: string; status: string; blockHeight: number | null };
    network: string;
  } | null;
  activeTab: 'app' | 'terminal';
  setActiveTab: (tab: 'app' | 'terminal') => void;
  walletAddress: string | null;
}

export const Header: React.FC<HeaderProps> = ({
  systemHealth,
  activeTab,
  setActiveTab,
  walletAddress,
}) => {
  const isProofOnline = systemHealth?.proofServer.status === 'online';
  const isIndexerOnline = systemHealth?.indexer.status === 'online';

  return (
    <header className="sticky top-0 z-50 border-b border-indigo-500/20 bg-midnight-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Left: Brand / Title */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-midnight-950">
              <Shield className="h-5 w-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold tracking-tight text-white">Midnight</span>
              <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                Preprod
              </span>
            </div>
            <p className="text-xs text-slate-400">Zero-Knowledge Hello World DApp</p>
          </div>
        </div>

        {/* Center: Tabs Switcher */}
        <div className="hidden sm:flex items-center rounded-xl bg-midnight-900/90 p-1 border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('app')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'app'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Interactive Studio</span>
          </button>
          <button
            onClick={() => setActiveTab('terminal')}
            className={`flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              activeTab === 'terminal'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            <span>Web CLI</span>
          </button>
        </div>

        {/* Right: Status Pills */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Proof Server Status */}
          <div
            title={`Proof Server (${systemHealth?.proofServer.url || '127.0.0.1:6300'})`}
            className="flex items-center space-x-1.5 rounded-full bg-midnight-900/90 px-2.5 py-1 text-xs border border-white/5"
          >
            <Cpu className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline text-slate-400">Proof Server:</span>
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isProofOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
              }`}
            />
            <span className={isProofOnline ? 'text-emerald-400 font-medium' : 'text-rose-400'}>
              {isProofOnline ? 'Online' : 'Offline'}
            </span>
          </div>

          {/* Indexer Status */}
          <div
            title={`Indexer GraphQL (${systemHealth?.indexer.url || 'Midnight Indexer'})`}
            className="flex items-center space-x-1.5 rounded-full bg-midnight-900/90 px-2.5 py-1 text-xs border border-white/5"
          >
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline text-slate-400">Indexer:</span>
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                isIndexerOnline ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]' : 'bg-rose-500'
              }`}
            />
            {systemHealth?.indexer.blockHeight && (
              <span className="text-slate-300 font-mono text-[11px]">
                #{systemHealth.indexer.blockHeight.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
