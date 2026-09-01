'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSystem } from './SystemContext';

export interface WalletStatus {
    unshieldedAddress: string;
    coinPublicKey?: string;
    encryptionPublicKey?: string;
    tNightBalance: string;
    tNightDisplay: string;
    dustBalance: string;
    isSynced: boolean;
    syncProgress?: {
        isSynced: boolean;
        percentage: number;
        appliedId: string;
        highestTransactionId: string;
        isConnected: boolean;
        unshielded?: { applied: string; highest: string; percentage: number };
        shielded?: { applied: string; highest: string; percentage: number };
        dust?: { applied: string; highest: string; percentage: number };
    };
}

interface WalletContextType {
    seed: string;
    setSeed: (seed: string) => void;
    defaultSeed: string;
    walletStatus: WalletStatus | null;
    isLoadingWallet: boolean;
    isRegisteringDust: boolean;
    fetchWalletStatus: (overrideSeed?: string) => Promise<void>;
    registerDust: () => Promise<{ success: boolean; txHash?: string; message?: string }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { systemHealth } = useSystem();
    const fallbackSeed = 'bfddeea52c8e16ebc8b278f4bb5a76604982046d690e7c6f3139831c6888861d';
    const [seed, setSeed] = useState<string>(fallbackSeed);
    const [defaultSeed, setDefaultSeed] = useState<string>(fallbackSeed);
    const [walletStatus, setWalletStatus] = useState<WalletStatus | null>(null);
    const [isLoadingWallet, setIsLoadingWallet] = useState<boolean>(false);
    const [isRegisteringDust, setIsRegisteringDust] = useState<boolean>(false);
    const isFetchingRef = useRef(false);

    // Sync seed from default deployment when available
    useEffect(() => {
        const foundSeed = systemHealth?.deployment?.deployerSeed || systemHealth?.deployment?.seed;
        if (foundSeed && foundSeed !== seed) {
            setSeed(foundSeed);
            setDefaultSeed(foundSeed);
        }
    }, [systemHealth, seed]);

    const fetchWalletStatus = useCallback(async (overrideSeed?: string) => {
        const targetSeed = overrideSeed || seed;
        if (!targetSeed || isFetchingRef.current) return;

        isFetchingRef.current = true;
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        try {
            const res = await fetch('/api/wallet/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seed: targetSeed }),
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!res.ok) return;
            const text = await res.text();
            if (!text.trim()) return;
            const data = JSON.parse(text);
            if (data.success && data.data) {
                setWalletStatus(data.data);
            }
        } catch (err: any) {
            // Silently ignore transient network aborts / reloads during hot compilation
            if (err.name !== 'AbortError' && !(err instanceof SyntaxError)) {
                console.warn('Wallet status sync issue:', err.message || err);
            }
        } finally {
            clearTimeout(timeoutId);
            isFetchingRef.current = false;
            setIsLoadingWallet(false);
        }
    }, [seed]);

    // Initial load when seed changes
    useEffect(() => {
        if (seed) {
            setIsLoadingWallet(true);
            fetchWalletStatus(seed);
        }
    }, [seed, fetchWalletStatus]);

    // Continuous background sync polling (every 3 seconds)
    useEffect(() => {
        if (!seed) return;
        const interval = setInterval(() => {
            fetchWalletStatus(seed);
        }, 3000);
        return () => clearInterval(interval);
    }, [seed, fetchWalletStatus]);

    const registerDust = async () => {
        if (!seed) return { success: false, message: 'No seed selected' };
        setIsRegisteringDust(true);
        try {
            const res = await fetch('/api/wallet/register-dust', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ seed }),
            });
            const text = await res.text();
            const data = text ? JSON.parse(text) : {};
            if (data.success) {
                await fetchWalletStatus(seed);
                return { success: true, txHash: data.data?.txHash };
            } else {
                return { success: false, message: data.error || 'Failed to register DUST' };
            }
        } catch (err: any) {
            return { success: false, message: err?.message || 'Network error registering DUST' };
        } finally {
            setIsRegisteringDust(false);
        }
    };

    return (
        <WalletContext.Provider
            value={{
                seed,
                setSeed,
                defaultSeed,
                walletStatus,
                isLoadingWallet,
                isRegisteringDust,
                fetchWalletStatus,
                registerDust,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
};
