'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { MessageBoard } from '@/components/MessageBoard';
import { MessagePublisher } from '@/components/MessagePublisher';
import { WalletStudio } from '@/components/WalletStudio';
import { ContractManager } from '@/components/ContractManager';
import { WebTerminal } from '@/components/WebTerminal';
import { TransactionFeed, TxRecord } from '@/components/TransactionFeed';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'app' | 'terminal'>('app');

  // System & Deployment state
  const [systemHealth, setSystemHealth] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [seed, setSeed] = useState<string>('');
  const [defaultSeed, setDefaultSeed] = useState<string>('');

  // Contract On-Chain Message State
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);

  // Wallet State
  const [walletStatus, setWalletStatus] = useState<any>(null);
  const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);
  const [isRegisteringDust, setIsRegisteringDust] = useState<boolean>(false);

  // Transaction Feed History
  const [transactions, setTransactions] = useState<TxRecord[]>([]);

  // 1. Fetch System Health & Deployment Info
  const fetchSystemHealth = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status');
      const data = await res.json();
      if (data.success && data.data) {
        setSystemHealth(data.data);
        if (data.data.deployment) {
          if (!contractAddress && data.data.deployment.contractAddress) {
            setContractAddress(data.data.deployment.contractAddress);
          }
          if (!seed && data.data.deployment.seed) {
            setSeed(data.data.deployment.seed);
            setDefaultSeed(data.data.deployment.seed);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching system status:', err);
    }
  }, [contractAddress, seed]);

  // 2. Fetch On-Chain Message State
  const fetchContractState = useCallback(async (targetAddr?: string) => {
    const addr = targetAddr || contractAddress;
    if (!addr) return;

    setIsLoadingMessage(true);
    try {
      const res = await fetch(`/api/contract/state?address=${encodeURIComponent(addr)}`);
      const data = await res.json();
      if (data.success && data.data) {
        setCurrentMessage(data.data.message || '');
        setLastUpdated(data.data.lastChecked || new Date().toISOString());
      }
    } catch (err) {
      console.error('Error fetching contract state:', err);
    } finally {
      setIsLoadingMessage(false);
    }
  }, [contractAddress]);

  // 3. Fetch Wallet Status
  const fetchWalletStatus = useCallback(async (targetSeed?: string) => {
    const activeSeed = targetSeed || seed;
    if (!activeSeed) return;

    setIsLoadingWallet(true);
    try {
      const res = await fetch('/api/wallet/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: activeSeed }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setWalletStatus(data.data);
      }
    } catch (err) {
      console.error('Error fetching wallet status:', err);
    } finally {
      setIsLoadingWallet(false);
    }
  }, [seed]);

  // 4. Register for DUST Generation
  const handleRegisterDust = async () => {
    if (!seed) return;
    setIsRegisteringDust(true);
    try {
      const res = await fetch('/api/wallet/register-dust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(data.error || 'Failed to register for DUST');
      } else {
        alert(data.data.message || 'DUST registration successful!');
        fetchWalletStatus();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to register for DUST');
    } finally {
      setIsRegisteringDust(false);
    }
  };

  // Initial Load
  useEffect(() => {
    fetchSystemHealth();
  }, [fetchSystemHealth]);

  useEffect(() => {
    if (contractAddress) {
      fetchContractState(contractAddress);
    }
  }, [contractAddress, fetchContractState]);

  useEffect(() => {
    if (seed) {
      fetchWalletStatus(seed);
    }
  }, [seed, fetchWalletStatus]);

  // Periodic polling for contract state and system status every 20 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (contractAddress) fetchContractState(contractAddress);
      fetchSystemHealth();
    }, 20000);
    return () => clearInterval(interval);
  }, [contractAddress, fetchContractState, fetchSystemHealth]);

  const handleTxSuccess = (result: any) => {
    const newTx: TxRecord = {
      id: Math.random().toString(),
      txHash: result.txHash,
      blockHeight: result.blockHeight,
      message: result.message,
      timestamp: result.timestamp || new Date().toISOString(),
      durationMs: result.durationMs,
    };
    setTransactions((prev) => [newTx, ...prev]);
    setCurrentMessage(result.message);
    setLastUpdated(new Date().toISOString());
    // Refresh wallet balances
    fetchWalletStatus();
  };

  const handleDeploySuccess = (newAddress: string) => {
    setContractAddress(newAddress);
    fetchContractState(newAddress);
    fetchSystemHealth();
  };

  return (
    <div className="min-h-screen flex flex-col bg-midnight-950 text-slate-100">
      {/* Top Navigation */}
      <Header
        systemHealth={systemHealth}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        walletAddress={walletStatus?.address || null}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-8">
        {activeTab === 'app' ? (
          <>
            {/* Top Grid: Message Board & ZK Publisher */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <MessageBoard
                currentMessage={currentMessage}
                contractAddress={contractAddress}
                isLoading={isLoadingMessage}
                onRefresh={() => fetchContractState()}
                lastUpdated={lastUpdated}
                onSetContractAddress={(addr) => {
                  setContractAddress(addr);
                  fetchContractState(addr);
                }}
              />

              <MessagePublisher
                seed={seed}
                contractAddress={contractAddress}
                onSuccess={handleTxSuccess}
                dustBalance={walletStatus?.dustBalance || '0'}
              />
            </div>

            {/* Middle: Wallet Studio */}
            <WalletStudio
              seed={seed}
              setSeed={(newSeed) => {
                setSeed(newSeed);
                fetchWalletStatus(newSeed);
              }}
              walletStatus={walletStatus}
              isLoading={isLoadingWallet}
              onRefresh={() => fetchWalletStatus()}
              onRegisterDust={handleRegisterDust}
              isRegisteringDust={isRegisteringDust}
              defaultSeed={defaultSeed}
            />

            {/* Bottom Grid: Contract Manager & Transaction History */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <ContractManager
                seed={seed}
                onDeploySuccess={handleDeploySuccess}
                deploymentInfo={systemHealth?.deployment}
              />

              <TransactionFeed transactions={transactions} />
            </div>
          </>
        ) : (
          /* Web Terminal Mode */
          <div className="max-w-4xl mx-auto">
            <WebTerminal
              seed={seed}
              contractAddress={contractAddress}
              onRefreshState={() => {
                fetchContractState();
                fetchWalletStatus();
              }}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-midnight-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>Built for Midnight Network (Preprod) • Powered by Compact Smart Contracts</p>
          <p className="font-mono text-[11px] text-slate-600">
            Proof Server: {systemHealth?.proofServer.url || '127.0.0.1:6300'}
          </p>
        </div>
      </footer>
    </div>
  );
}
