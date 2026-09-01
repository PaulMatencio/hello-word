'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Layers,
  Code2,
  FileCode2,
  Wallet,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Cpu,
  Activity,
  X,
  SlidersHorizontal,
  Settings,
} from 'lucide-react';
import packageJson from '@/package.json';
import { useSystem } from '@/src/presentation/context/SystemContext';
import { useWallet } from '@/src/presentation/context/WalletContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const navItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: Layers,
    description: 'Overview & ZK transaction feed',
  },
  {
    label: 'Studio IDE',
    href: '/ide',
    icon: Code2,
    badge: 'AI Copilot',
    description: 'Compact contract editor & compiler',
  },
  {
    label: 'Contracts',
    href: '/contracts',
    icon: FileCode2,
    description: 'Deployed contracts & workbench',
  },
  {
    label: 'Wallet',
    href: '/wallet',
    icon: Wallet,
    description: 'Unshielded/Shielded balance & DUST',
  },
  {
    label: 'Web CLI',
    href: '/terminal',
    icon: Terminal,
    description: 'Interactive Midnight CLI console',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
  const pathname = usePathname();
  const { systemHealth, setIsSettingsOpen } = useSystem();
  const { walletStatus } = useWallet();

  // Desktop collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('midnight_sidebar_collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('midnight_sidebar_collapsed', String(next));
      return next;
    });
  };

  // Close mobile drawer on route change
  useEffect(() => {
    onCloseMobile();
  }, [pathname, onCloseMobile]);

  const isProofOnline = systemHealth?.proofServer.status === 'online';
  const isIndexerOnline = systemHealth?.indexer.status === 'online';

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-out"
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-midnight-950/95 backdrop-blur-2xl border-r border-indigo-500/20 shadow-2xl transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:h-screen md:shrink-0
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-20' : 'md:w-64'}
        `}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/10 shrink-0">
          <Link
            href="/"
            className={`flex items-center space-x-3 overflow-hidden group ${isCollapsed ? 'justify-center w-full' : ''}`}
            title={`Midnight Studio v${packageJson.version} (Preprod)`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-midnight-950">
                <Shield className="h-5 w-5 text-cyan-400" />
              </div>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 transition-opacity duration-200">
                <div className="flex items-center space-x-2">
                  <span className="text-base font-extrabold tracking-tight text-white truncate">Midnight</span>
                  <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[9px] font-mono font-bold text-indigo-300 border border-indigo-500/30">
                    v{packageJson.version}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                  <span className="truncate">Preprod Studio</span>
                </div>
              </div>
            )}
          </Link>

          {/* Mobile Close Button */}
          <button
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 cursor-pointer"
            aria-label="Close Navigation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <div className={`px-2 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•••' : 'Platform Navigation'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : undefined}
                className={`
                  group relative flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5 border border-transparent'
                  }
                  ${isCollapsed ? 'justify-center px-0' : 'space-x-3'}
                `}
              >
                {/* Active Indicator bar */}
                {isActive && (
                  <span
                    className={`absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] ${isCollapsed ? 'hidden' : ''}`}
                  />
                )}

                <div className={`flex items-center justify-center ${isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-cyan-400'} transition-colors`}>
                  <Icon className="h-5 w-5 shrink-0" />
                </div>

                {!isCollapsed && (
                  <div className="flex flex-1 items-center justify-between min-w-0">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[9px] font-bold tracking-tight">
                        <Sparkles className="h-2.5 w-2.5 text-cyan-400" />
                        <span>{item.badge}</span>
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}

          <div className="pt-2 border-t border-white/5">
            {/* Dedicated Infrastructure Settings Button */}
            <button
              onClick={() => {
                setIsSettingsOpen(true);
                onCloseMobile();
              }}
              title={isCollapsed ? 'Infrastructure Settings' : undefined}
              className={`
                w-full group relative flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer
                text-slate-400 hover:text-cyan-300 hover:bg-white/5 border border-transparent
                ${isCollapsed ? 'justify-center px-0' : 'space-x-3'}
              `}
            >
              <div className="flex items-center justify-center text-slate-400 group-hover:text-cyan-400 transition-colors">
                <SlidersHorizontal className="h-5 w-5 shrink-0" />
              </div>

              {!isCollapsed && (
                <div className="flex flex-1 items-center justify-between min-w-0">
                  <span className="truncate">Settings & Infra</span>
                  <span className="text-[9px] font-mono uppercase bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/30">
                    Config
                  </span>
                </div>
              )}
            </button>
          </div>
        </nav>

        {/* Sidebar Footer / Telemetry & Collapse Control */}
        <div className="p-3 border-t border-white/10 space-y-2 shrink-0 bg-midnight-950/60">
          {/* Quick Node Status (Clickable to open Infrastructure Settings) */}
          {!isCollapsed && (
            <div
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 rounded-xl bg-midnight-900/80 hover:bg-midnight-800/90 border border-white/5 hover:border-indigo-500/30 space-y-2 transition-colors cursor-pointer group"
              title="Click to configure Midnight Infrastructure"
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Cpu className="h-3.5 w-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                  <span>Prover</span>
                </span>
                <span className={`inline-block h-2 w-2 rounded-full ${isProofOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`} />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  <span>Indexer</span>
                </span>
                <span className={`inline-block h-2 w-2 rounded-full ${isIndexerOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`} />
              </div>
              <div className="pt-1 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 group-hover:text-cyan-300">
                <span>Infrastructure Status</span>
                <Settings className="h-3 w-3" />
              </div>
            </div>
          )}

          {/* Version Footer */}
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-slate-500">
              <span>Midnight Studio</span>
              <span className="text-indigo-300 font-semibold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                v{packageJson.version}
              </span>
            </div>
          ) : (
            <div className="text-center text-[9px] font-mono text-indigo-400/80" title={`v${packageJson.version}`}>
              v{packageJson.version.split('-')[0]}
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className="hidden md:flex w-full items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-midnight-900/60 hover:bg-midnight-800 border border-white/5 text-xs text-slate-400 hover:text-white transition-all cursor-pointer"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-cyan-400" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 text-cyan-400" />
                <span className="text-[11px] font-medium">Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
