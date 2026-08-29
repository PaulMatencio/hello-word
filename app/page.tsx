'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSystem } from '@/src/presentation/context/SystemContext';
import { useWallet } from '@/src/presentation/context/WalletContext';
import { useTransactions } from '@/src/presentation/context/TransactionContext';
import { MessageBoard } from '@/components/MessageBoard';
import { MessagePublisher } from '@/components/MessagePublisher';
import { WalletStudio } from '@/components/WalletStudio';
import { ContractManager } from '@/components/ContractManager';
import { TransactionFeed } from '@/components/TransactionFeed';
import type { TxRecord } from '@/src/types/tx';

export default function Home() {
  const { systemHealth, activeContractAddress, setActiveContractAddress, setIsSyncDashboardOpen, fetchSystemHealth } = useSystem();
  const { seed, setSeed, defaultSeed, walletStatus, isLoadingWallet, isRegisteringDust, fetchWalletStatus, registerDust } = useWallet();
  const { transactions, addTransaction, fetchTransactions } = useTransactions();

  // Contract On-Chain Message State
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoadingMessage, setIsLoadingMessage] = useState<boolean>(false);

  // Fetch On-Chain Message State
  const fetchContractState = useCallback(async (targetAddr?: string) => {
    const addr = targetAddr || activeContractAddress;
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
  }, [activeContractAddress]);

  // Initial and periodic contract polling
  useEffect(() => {
    if (activeContractAddress) {
      fetchContractState(activeContractAddress);
      const interval = setInterval(() => {
        fetchContractState(activeContractAddress);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [activeContractAddress, fetchContractState]);

  const handleRegisterDust = async () => {
    const res = await registerDust();
    if (!res.success) {
      alert(res.message || 'Failed to register for DUST');
    } else {
      alert('DUST registration successful!');
    }
  };

  const handleTxSuccess = (result: any) => {
    const newTx: TxRecord = {
      id: Math.random().toString(),
      txHash: result.txHash,
      contractAddress: result.contractAddress || activeContractAddress,
      circuitName: 'storeMessage',
      txType: 'contract_call',
      blockHeight: result.blockHeight,
      message: result.message,
      timestamp: result.timestamp || new Date().toISOString(),
      dustPaid: result.dustPaid,
      durationMs: result.durationMs,
    };
    addTransaction(newTx);
    setCurrentMessage(result.message);
    setLastUpdated(new Date().toISOString());
    fetchWalletStatus();
    fetchTransactions();
  };

  const handleTxError = (err: any) => {
    const errorTx: TxRecord = {
      id: Math.random().toString(),
      txHash: '',
      blockHeight: null,
      message: '',
      timestamp: new Date().toISOString(),
      error: err.message || 'Transaction failed',
    };
    addTransaction(errorTx);
  };

  const handleDeploySuccess = (newAddress: string) => {
    setActiveContractAddress(newAddress);
    fetchContractState(newAddress);
    fetchSystemHealth();
    fetchTransactions();
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-8">
      {/* Top Grid: Message Board & ZK Publisher */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <MessageBoard
          currentMessage={currentMessage}
          contractAddress={activeContractAddress}
          isLoading={isLoadingMessage}
          onRefresh={() => fetchContractState()}
          lastUpdated={lastUpdated}
          onSetContractAddress={(addr) => {
            setActiveContractAddress(addr);
            fetchContractState(addr);
          }}
        />

        <MessagePublisher
          seed={seed}
          contractAddress={activeContractAddress}
          onSuccess={handleTxSuccess}
          onError={handleTxError}
          dustBalance={walletStatus?.dustBalance || '0'}
          isSynced={walletStatus?.isSynced ?? false}
          syncPercentage={walletStatus?.syncProgress?.percentage ?? 0}
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
        onOpenSyncDashboard={() => setIsSyncDashboardOpen(true)}
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
    </div>
  );
}
