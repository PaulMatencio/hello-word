'use client';

import React, { useState } from 'react';
import { Rocket, CheckCircle2, ShieldAlert, Loader2, FileCode, Check, Copy } from 'lucide-react';

interface ContractManagerProps {
  seed: string;
  onDeploySuccess: (address: string) => void;
  deploymentInfo: any;
}

export const ContractManager: React.FC<ContractManagerProps> = ({
  seed,
  onDeploySuccess,
  deploymentInfo,
}) => {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleDeploy = async () => {
    if (!seed) {
      setErrorMsg('Please configure a wallet seed in Wallet Studio first.');
      return;
    }

    setIsDeploying(true);
    setErrorMsg(null);
    setDeployResult(null);

    try {
      const res = await fetch('/api/contract/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: seed.trim() }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to deploy contract');
      }

      setDeployResult(data.data);
      onDeploySuccess(data.data.contractAddress);
    } catch (err: any) {
      setErrorMsg(err.message || 'Deployment failed');
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyAddr = (addr: string) => {
    navigator.clipboard.writeText(addr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="glass-panel p-6 sm:p-8 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30">
            <Rocket className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Contract Deployment Studio</h3>
            <p className="text-xs text-slate-400">
              Deploy a new Compact smart contract to Midnight Preprod
            </p>
          </div>
        </div>

        <button
          onClick={handleDeploy}
          disabled={isDeploying || !seed}
          className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-emerald-600/25 hover:shadow-emerald-600/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {isDeploying ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Deploying Contract (30-60s)...</span>
            </>
          ) : (
            <>
              <Rocket className="h-3.5 w-3.5" />
              <span>Deploy New Contract</span>
            </>
          )}
        </button>
      </div>

      {/* Active Deployment Details */}
      <div className="mt-6 rounded-xl bg-midnight-950/80 p-5 border border-white/5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <FileCode className="h-4 w-4 text-emerald-400" />
          <span>Deployment Metadata</span>
        </h4>

        {deploymentInfo ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Network</span>
              <span className="text-slate-200 font-mono capitalize">{deploymentInfo.network || 'preprod'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Deployed At</span>
              <span className="text-slate-200 font-mono">
                {deploymentInfo.deployedAt ? new Date(deploymentInfo.deployedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase">Active Address</span>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="text-emerald-400 font-mono truncate" title={deploymentInfo.contractAddress}>
                  {deploymentInfo.contractAddress}
                </span>
                <button
                  onClick={() => handleCopyAddr(deploymentInfo.contractAddress)}
                  className="text-slate-400 hover:text-white"
                  title="Copy Address"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">No deployment.json found in repository.</p>
        )}
      </div>

      {/* Success Notification */}
      {deployResult && (
        <div className="mt-4 rounded-xl bg-emerald-950/40 p-4 border border-emerald-500/30 text-xs">
          <div className="flex items-center space-x-2 text-emerald-300 font-semibold mb-1">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Contract Deployed Successfully!</span>
          </div>
          <p className="text-slate-300">
            Address:{' '}
            <code className="font-mono text-emerald-300 bg-midnight-950 px-2 py-0.5 rounded ml-1">
              {deployResult.contractAddress}
            </code>
          </p>
        </div>
      )}

      {/* Error Notification */}
      {errorMsg && (
        <div className="mt-4 rounded-xl bg-rose-950/40 p-4 border border-rose-500/30 text-xs">
          <div className="flex items-center space-x-2 text-rose-300 font-semibold mb-1">
            <ShieldAlert className="h-4 w-4 text-rose-400" />
            <span>Deployment Failed</span>
          </div>
          <p className="text-slate-300">{errorMsg}</p>
        </div>
      )}
    </div>
  );
};
