'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { TxRecord } from '@/src/types/tx';

interface TransactionContextType {
    transactions: TxRecord[];
    isLoadingTx: boolean;
    fetchTransactions: () => Promise<void>;
    addTransaction: (tx: TxRecord) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [transactions, setTransactions] = useState<TxRecord[]>([]);
    const [isLoadingTx, setIsLoadingTx] = useState<boolean>(true);

    const fetchTransactions = useCallback(async () => {
        try {
            const res = await fetch('/api/wallet/history');
            if (!res.ok) return;
            const text = await res.text();
            if (!text.trim()) return;
            const data = JSON.parse(text);
            if (data.success && Array.isArray(data.data)) {
                setTransactions(data.data);
            }
        } catch (err) {
            // Silently ignore transient errors
        } finally {
            setIsLoadingTx(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const addTransaction = useCallback((tx: TxRecord) => {
        setTransactions((prev) => {
            if (prev.some((item) => item.txHash === tx.txHash)) return prev;
            return [tx, ...prev];
        });
    }, []);

    return (
        <TransactionContext.Provider
            value={{
                transactions,
                isLoadingTx,
                fetchTransactions,
                addTransaction,
            }}
        >
            {children}
        </TransactionContext.Provider>
    );
};

export const useTransactions = (): TransactionContextType => {
    const context = useContext(TransactionContext);
    if (!context) {
        throw new Error('useTransactions must be used within a TransactionProvider');
    }
    return context;
};
