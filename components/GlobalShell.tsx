'use client';

import React from 'react';
import { SystemProvider, useSystem } from '@/src/presentation/context/SystemContext';
import { WalletProvider } from '@/src/presentation/context/WalletContext';
import { TransactionProvider } from '@/src/presentation/context/TransactionContext';
import { Navbar } from './Navbar';
import { SyncDashboardModal } from './SyncDashboardModal';

import { useWallet } from '@/src/presentation/context/WalletContext';

const Modals: React.FC = () => {
    const { isSyncDashboardOpen, setIsSyncDashboardOpen } = useSystem();
    const { seed, walletStatus } = useWallet();
    return (
        <SyncDashboardModal
            isOpen={isSyncDashboardOpen}
            onClose={() => setIsSyncDashboardOpen(false)}
            seed={seed}
            initialData={walletStatus?.syncProgress}
            isSynced={walletStatus?.isSynced ?? false}
        />
    );
};

import { ToastProvider } from '@/src/presentation/context/ToastContext';

export const GlobalShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <SystemProvider>
            <WalletProvider>
                <TransactionProvider>
                    <ToastProvider>
                        <div className="min-h-screen flex flex-col bg-midnight-950 text-slate-100">
                            <Navbar />
                            <main className="flex-1">
                                {children}
                            </main>
                            <Modals />
                        </div>
                    </ToastProvider>
                </TransactionProvider>
            </WalletProvider>
        </SystemProvider>
    );
};
