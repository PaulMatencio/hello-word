'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, Loader2, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface ToastItem {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    txHash?: string;
    durationMs?: number;
}

interface ToastContextType {
    toasts: ToastItem[];
    showToast: (toast: Omit<ToastItem, 'id'>) => string;
    dismissToast: (id: string) => void;
    success: (title: string, message?: string, txHash?: string) => string;
    error: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
    loading: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (toast: Omit<ToastItem, 'id'>): string => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
            const duration = toast.durationMs ?? (toast.type === 'loading' ? 0 : 5000);

            setToasts((prev) => [...prev, { ...toast, id }]);

            if (duration > 0) {
                setTimeout(() => {
                    dismissToast(id);
                }, duration);
            }

            return id;
        },
        [dismissToast]
    );

    const success = useCallback(
        (title: string, message?: string, txHash?: string) =>
            showToast({ type: 'success', title, message, txHash }),
        [showToast]
    );

    const error = useCallback(
        (title: string, message?: string) =>
            showToast({ type: 'error', title, message }),
        [showToast]
    );

    const info = useCallback(
        (title: string, message?: string) =>
            showToast({ type: 'info', title, message }),
        [showToast]
    );

    const loading = useCallback(
        (title: string, message?: string) =>
            showToast({ type: 'loading', title, message, durationMs: 0 }),
        [showToast]
    );

    return (
        <ToastContext.Provider
            value={{
                toasts,
                showToast,
                dismissToast,
                success,
                error,
                info,
                loading,
            }}
        >
            {children}
            {/* Floating Toast Notification Stack */}
            <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start space-x-3 rounded-2xl p-4 shadow-2xl backdrop-blur-xl border transition-all animate-in slide-in-from-bottom-5 duration-300 ${
                            toast.type === 'success'
                                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-emerald-900/30'
                                : toast.type === 'error'
                                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-rose-900/30'
                                : toast.type === 'loading'
                                ? 'bg-indigo-950/90 border-indigo-500/40 text-indigo-100 shadow-indigo-900/30'
                                : 'bg-slate-900/90 border-white/20 text-slate-100 shadow-black/40'
                        }`}
                    >
                        <div className="shrink-0 mt-0.5">
                            {toast.type === 'success' && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
                            {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-400" />}
                            {toast.type === 'loading' && <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />}
                            {toast.type === 'info' && <Info className="h-5 w-5 text-indigo-400" />}
                        </div>

                        <div className="flex-1 space-y-1 text-xs">
                            <h4 className="font-bold">{toast.title}</h4>
                            {toast.message && <p className="text-slate-300 break-words">{toast.message}</p>}
                            {toast.txHash && (
                                <p className="font-mono text-[10px] text-emerald-400 truncate">
                                    Tx: {toast.txHash}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={() => dismissToast(toast.id)}
                            className="shrink-0 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = (): ToastContextType => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
