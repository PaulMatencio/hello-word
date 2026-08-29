'use client';

import React from 'react';
import { useWallet } from '@/src/presentation/context/WalletContext';
import { useSystem } from '@/src/presentation/context/SystemContext';
import { useTransactions } from '@/src/presentation/context/TransactionContext';
import { useToast } from '@/src/presentation/context/ToastContext';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WalletStudio } from '@/components/WalletStudio';
import { TransactionFeed } from '@/components/TransactionFeed';

export default function WalletPage() {
    const { seed, setSeed, defaultSeed, walletStatus, isLoadingWallet, isRegisteringDust, fetchWalletStatus, registerDust } = useWallet();
    const { setIsSyncDashboardOpen } = useSystem();
    const { transactions } = useTransactions();
    const toast = useToast();

    const handleRegisterDust = async () => {
        const res = await registerDust();
        if (!res.success) {
            toast.error('Registration Failed', res.message);
            throw new Error(res.message);
        }
        toast.success('DUST Registered', 'UTXOs successfully registered for DUST fuel generation', res.txHash);
        return res.txHash || '';
    };

    return (
        <div className="mx-auto max-w-7xl w-full px-4 py-8 sm:px-6 space-y-6">
            <Breadcrumbs />
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Wallet Studio & Asset Hub</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Manage multi-role HD identities, track tNIGHT and DUST fuel balances, and send tokens.
                </p>
            </div>

            <WalletStudio
                seed={seed}
                setSeed={setSeed}
                walletStatus={walletStatus}
                isLoading={isLoadingWallet}
                onRefresh={() => fetchWalletStatus()}
                onRegisterDust={handleRegisterDust}
                isRegisteringDust={isRegisteringDust}
                defaultSeed={defaultSeed}
                onOpenSyncDashboard={() => setIsSyncDashboardOpen(true)}
            />

            <div className="mt-8">
                <h2 className="text-lg font-bold text-white mb-4">Recent Wallet Activity</h2>
                <TransactionFeed transactions={transactions} />
            </div>
        </div>
    );
}
