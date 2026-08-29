'use client';

import React from 'react';
import { useWallet } from '@/src/presentation/context/WalletContext';
import { useSystem } from '@/src/presentation/context/SystemContext';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { WebTerminal } from '@/components/WebTerminal';

export default function TerminalPage() {
    const { seed, fetchWalletStatus } = useWallet();
    const { activeContractAddress, fetchSystemHealth } = useSystem();

    return (
        <div className="mx-auto max-w-5xl w-full px-4 py-8 sm:px-6 space-y-6">
            <Breadcrumbs />
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">Midnight Web CLI Console</h1>
                <p className="text-sm text-slate-400 mt-1">
                    Execute Compact contract circuits and inspect wallet states directly inside an interactive browser terminal.
                </p>
            </div>

            <div className="bg-midnight-900/50 rounded-2xl border border-white/10 p-2 shadow-2xl">
                <WebTerminal
                    seed={seed}
                    contractAddress={activeContractAddress}
                    onRefreshState={() => {
                        fetchSystemHealth();
                        fetchWalletStatus();
                    }}
                />
            </div>
        </div>
    );
}
