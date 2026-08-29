'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, Cpu, Activity, Terminal, Layers, Wallet, Rocket, FileCode2, Copy, Check, Code2 } from 'lucide-react';
import { useSystem } from '@/src/presentation/context/SystemContext';
import { useWallet } from '@/src/presentation/context/WalletContext';

export const Navbar: React.FC = () => {
    const pathname = usePathname();
    const { systemHealth, setIsSyncDashboardOpen } = useSystem();
    const { walletStatus } = useWallet();
    const [copied, setCopied] = React.useState(false);

    const isProofOnline = systemHealth?.proofServer.status === 'online';
    const isIndexerOnline = systemHealth?.indexer.status === 'online';
    const isSynced = walletStatus?.isSynced ?? false;
    const syncPercentage = walletStatus?.syncProgress?.percentage ?? 0;
    const walletAddress = walletStatus?.unshieldedAddress;

    const navItems = [
        { label: 'Dashboard', href: '/', icon: Layers },
        { label: 'Studio IDE', href: '/ide', icon: Code2 },
        { label: 'Deploy', href: '/deploy', icon: Rocket },
        { label: 'Contracts', href: '/contracts', icon: FileCode2 },
        { label: 'Wallet', href: '/wallet', icon: Wallet },
        { label: 'Web CLI', href: '/terminal', icon: Terminal },
    ];

    const copyAddress = () => {
        if (walletAddress) {
            navigator.clipboard.writeText(walletAddress);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <header className="sticky top-0 z-50 border-b border-indigo-500/20 bg-midnight-950/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6">
                {/* Left: Brand / Title */}
                <Link href="/" className="flex items-center space-x-3 group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                        <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-midnight-950">
                            <Shield className="h-4.5 w-4.5 text-cyan-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="text-base font-bold tracking-tight text-white">Midnight</span>
                            <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-300 border border-indigo-500/30">
                                Preprod
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400">Zero-Knowledge Studio</p>
                    </div>
                </Link>

                {/* Center: Navigation Links */}
                <nav className="hidden md:flex items-center space-x-1 rounded-xl bg-midnight-900/90 p-1 border border-white/10 shadow-inner">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <Icon className="h-3.5 w-3.5" />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Right: Status Pills & Actions */}
                <div className="flex items-center space-x-2 sm:space-x-3">
                    {/* Proof Server Status */}
                    <div
                        title={`Proof Server: ${isProofOnline ? 'Online' : 'Offline'}`}
                        className="hidden lg:flex items-center space-x-1.5 rounded-full bg-midnight-900/90 px-2.5 py-1 text-xs border border-white/5"
                    >
                        <Cpu className="h-3 w-3 text-slate-400" />
                        <span className="text-[11px] text-slate-400">Prover:</span>
                        <span
                            className={`inline-block h-2 w-2 rounded-full ${
                                isProofOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
                            }`}
                        />
                    </div>

                    {/* Indexer Status */}
                    <div
                        title={`Indexer: ${isIndexerOnline ? `Online (Block #${systemHealth?.indexer.blockHeight || 'N/A'})` : 'Offline'}`}
                        className="hidden lg:flex items-center space-x-1.5 rounded-full bg-midnight-900/90 px-2.5 py-1 text-xs border border-white/5"
                    >
                        <Activity className="h-3 w-3 text-slate-400" />
                        <span className="text-[11px] text-slate-400">Indexer:</span>
                        <span
                            className={`inline-block h-2 w-2 rounded-full ${
                                isIndexerOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'
                            }`}
                        />
                    </div>

                    {/* Sync Status Button (Opens Modal) */}
                    <button
                        onClick={() => setIsSyncDashboardOpen(true)}
                        title="Click to view detailed sync telemetry"
                        className={`flex items-center space-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium border transition-all cursor-pointer ${
                            isSynced
                                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20 animate-pulse'
                        }`}
                    >
                        <span
                            className={`inline-block h-2 w-2 rounded-full ${
                                isSynced ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                            }`}
                        />
                        <span>{isSynced ? '✓ Synced' : `Syncing ${syncPercentage}%`}</span>
                    </button>

                    {/* Storage Driver Status */}
                    <div
                        title="Active Persistence Driver"
                        className="hidden xl:flex items-center space-x-1.5 rounded-full bg-midnight-900/90 px-2.5 py-1 text-xs border border-white/5"
                    >
                        <span className="text-[11px] text-slate-400">Storage:</span>
                        <span className="text-[11px] font-mono text-cyan-300 font-semibold">
                            {process.env.NEXT_PUBLIC_STORAGE_DRIVER || 'File / Redis'}
                        </span>
                    </div>

                    {/* Wallet Address Pill */}
                    {walletAddress && (
                        <button
                            onClick={copyAddress}
                            title="Click to copy Bech32 address"
                            className="flex items-center space-x-1.5 rounded-full bg-indigo-950/60 px-2.5 py-1 text-xs text-indigo-200 border border-indigo-500/30 hover:bg-indigo-900/60 transition-colors"
                        >
                            <span className="font-mono text-[11px]">
                                {walletAddress.slice(0, 10)}...{walletAddress.slice(-6)}
                            </span>
                            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3 text-indigo-400" />}
                        </button>
                    )}
                </div>
            </div>

            {/* Mobile Nav Bar */}
            <div className="flex md:hidden border-t border-white/5 bg-midnight-950/95 px-2 py-1.5 justify-around">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center py-1 px-2 text-[10px] font-medium rounded-lg transition-colors ${
                                isActive ? 'text-cyan-400 bg-white/5' : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            <Icon className="h-4 w-4 mb-0.5" />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </header>
    );
};
