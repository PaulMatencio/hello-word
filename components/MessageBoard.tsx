'use client';

import React, { useState } from 'react';
import { MessageSquare, RefreshCw, Copy, Check, ExternalLink, Sparkles, Hash, Clock } from 'lucide-react';

interface MessageBoardProps {
  currentMessage: string;
  contractAddress: string;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated: string | null;
  onSetContractAddress?: (addr: string) => void;
}

export const MessageBoard: React.FC<MessageBoardProps> = ({
  currentMessage,
  contractAddress,
  isLoading,
  onRefresh,
  lastUpdated,
  onSetContractAddress,
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [tempAddress, setTempAddress] = useState(contractAddress);

  const handleCopy = () => {
    if (!contractAddress) return;
    navigator.clipboard.writeText(contractAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSetContractAddress && tempAddress.trim()) {
      onSetContractAddress(tempAddress.trim());
      setIsEditingContract(false);
    }
  };

  return (
    <div className="glass-panel overflow-hidden p-6 sm:p-8 relative">
      {/* Background visual flair */}
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-cyan-500/5 blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30">
            <MessageSquare className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Current On-Chain Message
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </h2>
            <p className="text-xs text-slate-400">Decentralized ledger state disclosed on Midnight Preprod</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center space-x-1.5 rounded-lg bg-midnight-900/80 px-3 py-1.5 text-xs font-medium text-slate-300 border border-white/10 hover:border-cyan-500/40 hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            <span>{isLoading ? 'Fetching...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Main Message Hero Box */}
      <div className="my-6">
        <div className="relative rounded-2xl bg-gradient-to-b from-midnight-900/90 to-midnight-950/90 p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4">
            <Sparkles className="h-24 w-24 text-indigo-500/5 rotate-12 pointer-events-none" />
          </div>

          <div className="relative z-10">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md border border-indigo-500/20">
              Compact Ledger State
            </span>

            <div className="mt-4 min-h-[4.5rem] flex items-center">
              {currentMessage ? (
                <p className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-cyan-200 tracking-tight break-words">
                  &ldquo;{currentMessage}&rdquo;
                </p>
              ) : (
                <p className="text-lg text-slate-500 italic">
                  {isLoading ? 'Connecting to indexer...' : 'No message set yet on this contract.'}
                </p>
              )}
            </div>

            {lastUpdated && (
              <div className="mt-4 flex items-center space-x-1.5 text-xs text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>Last verified: {new Date(lastUpdated).toLocaleTimeString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contract Address Section */}
      <div className="rounded-xl bg-midnight-900/60 p-4 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-2 min-w-0">
          <Hash className="h-4 w-4 text-indigo-400 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-slate-400">Contract Address</p>
            {isEditingContract ? (
              <form onSubmit={handleSaveContract} className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  className="w-full text-xs font-mono bg-midnight-950 px-2 py-1 rounded border border-indigo-500/50 text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  placeholder="Enter 64-char contract address"
                />
                <button
                  type="submit"
                  className="text-xs bg-indigo-600 px-2 py-1 rounded text-white font-medium hover:bg-indigo-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingContract(false);
                    setTempAddress(contractAddress);
                  }}
                  className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <p className="font-mono text-xs text-slate-300 truncate" title={contractAddress}>
                {contractAddress || 'No contract address configured'}
              </p>
            )}
          </div>
        </div>

        {!isEditingContract && (
          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1 rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={() => setIsEditingContract(true)}
              className="rounded-lg bg-white/5 px-2.5 py-1 text-xs text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            >
              Change
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
