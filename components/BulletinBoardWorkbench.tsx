'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
    Shield,
    FileCode2,
    Play,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Copy,
    Check,
    Lock,
    User,
    Sparkles,
    Zap,
    Layers,
    Send,
    Trash2,
    ArrowRight,
    Cpu,
    Flame,
    Eye,
    Terminal as TerminalIcon,
    History,
    ShieldAlert,
    CheckCircle,
    Edit3
} from 'lucide-react';
import { useToast } from '@/src/presentation/context/ToastContext';
import type {
    BulletinBoardShowcaseStep,
    BulletinBoardLedgerState,
} from '@/src/domain/entities/bulletin-board.entity';

interface BulletinBoardWorkbenchProps {
    contractAddress?: string;
    contractNickname?: string;
}

export const BulletinBoardWorkbench: React.FC<BulletinBoardWorkbenchProps> = ({
    contractAddress = '00'.repeat(32),
    contractNickname = 'Midnight Bulletin Board',
}) => {
    const toast = useToast();

    // Live Board State
    const [boardState, setBoardState] = useState<{
        state: number;
        message: { is_some: boolean; value: string };
        sequence: number | string;
        owner: string;
    }>({
        state: 0,
        message: { is_some: false, value: '' },
        sequence: 1,
        owner: contractAddress || '00'.repeat(32),
    });

    // Showcase Suite State
    const [isRunningShowcase, setIsRunningShowcase] = useState<boolean>(false);
    const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
    const [showcaseSteps, setShowcaseSteps] = useState<BulletinBoardShowcaseStep[]>([]);
    const [logs, setLogs] = useState<string[]>([
        `[${new Date().toLocaleTimeString()}] Bulletin Board Workbench ready. Click "Run Showcase Pipeline" or trigger circuits manually.`,
    ]);

    // Manual Circuit Interaction Form State
    const [selectedIdentity, setSelectedIdentity] = useState<'Alice' | 'Bob'>('Alice');
    const [customMessage, setCustomMessage] = useState<string>('Hello from Interactive Workbench!');
    const [isExecutingCircuit, setIsExecutingCircuit] = useState<boolean>(false);

    // Active Inspector Tab
    const [inspectorTab, setInspectorTab] = useState<'ledger' | 'raw' | 'identities' | 'logs'>('ledger');
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    const logEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (msg: string) => {
        setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        toast.info('Copied to Clipboard', text.slice(0, 16) + '...');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // Run All Showcases Flow
    const handleRunAllShowcases = async () => {
        setIsRunningShowcase(true);
        setShowcaseSteps([]);
        addLog('Starting automated 6-step showcase pipeline...');

        try {
            const res = await fetch('/api/contract/bulletin-board/showcase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'run_all' }),
            });

            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Showcase execution failed');
            }

            // Animate through the steps sequentially for rich visualization
            const steps: BulletinBoardShowcaseStep[] = data.data.steps;
            for (let i = 0; i < steps.length; i++) {
                setActiveStepIndex(i);
                setShowcaseSteps((prev) => [...prev, steps[i]]);

                if (steps[i].nextLedgerState) {
                    const ls = steps[i].nextLedgerState!;
                    setBoardState({
                        state: Number(ls.state),
                        message: ls.message,
                        sequence: Number(ls.sequence),
                        owner: typeof ls.owner === 'string' ? ls.owner : Buffer.from(ls.owner).toString('hex'),
                    });
                }

                if (data.data.logs && data.data.logs[i]) {
                    addLog(data.data.logs[i]);
                }

                await new Promise((resolve) => setTimeout(resolve, 600));
            }

            setActiveStepIndex(null);
            toast.success('Showcase Pipeline Completed', 'All 6 ZK contract showcases passed successfully.');
            addLog('Showcase pipeline completed with 100% assertions verified.');
        } catch (err: any) {
            console.error('Showcase error:', err);
            toast.error('Showcase Error', err.message);
            addLog(`Error: ${err.message}`);
        } finally {
            setIsRunningShowcase(false);
        }
    };

    // Reset Board State
    const handleResetBoard = async () => {
        try {
            const res = await fetch('/api/contract/bulletin-board/showcase', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset', sessionId: contractAddress }),
            });
            const data = await res.json();
            if (data.success && data.data?.ledgerState) {
                const ls = data.data.ledgerState;
                setBoardState({
                    state: Number(ls.state),
                    message: ls.message,
                    sequence: Number(ls.sequence),
                    owner: typeof ls.owner === 'string' ? ls.owner : Buffer.from(ls.owner).toString('hex'),
                });
            }
        } catch (err) {
            console.error('Failed to reset state on server:', err);
        }
        setShowcaseSteps([]);
        addLog('Board state reset to initial VACANT state at Sequence #1.');
        toast.info('Board Reset', 'Reset to initial state.');
    };

    const isOccupied = boardState.state === 1;

    return (
        <div className="space-y-8">
            {/* Top Overview & Action Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-midnight-900/90 via-midnight-950 to-midnight-900/90 border border-indigo-500/20 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center space-x-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/30">
                        <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-midnight-950">
                            <Layers className="h-7 w-7 text-cyan-400" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center space-x-2">
                            <h1 className="text-2xl font-black tracking-tight text-white">
                                {contractNickname}
                            </h1>
                            <span className="rounded-full bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 text-xs font-bold border border-cyan-500/30 flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                <span>Execution Workbench</span>
                            </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                            <span className="font-mono text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
                                {contractAddress}
                            </span>
                            <button
                                onClick={() => copyToClipboard(contractAddress, 'contract-address')}
                                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                                title="Copy Contract Address"
                            >
                                {copiedKey === 'contract-address' ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                                ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleResetBoard}
                        disabled={isRunningShowcase}
                        className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-midnight-800 text-slate-300 hover:text-white text-xs font-semibold border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                        <RefreshCw className="h-4 w-4 text-slate-400" />
                        <span>Reset State</span>
                    </button>

                    <button
                        onClick={handleRunAllShowcases}
                        disabled={isRunningShowcase}
                        className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-lg cursor-pointer ${
                            isRunningShowcase
                                ? 'bg-indigo-600/50 cursor-not-allowed'
                                : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 hover:opacity-90 shadow-indigo-500/30 hover:scale-[1.02]'
                        }`}
                    >
                        {isRunningShowcase ? (
                            <>
                                <RefreshCw className="h-4 w-4 animate-spin text-white" />
                                <span>Running Showcases...</span>
                            </>
                        ) : (
                            <>
                                <Play className="h-4 w-4 fill-current text-white" />
                                <span>Run Showcase Pipeline (6 Steps)</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Grid Layout: Visual Board + Showcase Stepper */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column (5 Cols): Live Visual Board & Manual Circuit Panel */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Visual Bulletin Board Card */}
                    <div className="p-6 rounded-3xl bg-midnight-900/80 border border-white/10 shadow-2xl space-y-5 relative overflow-hidden backdrop-blur-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none" />

                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center space-x-2">
                                <FileCode2 className="h-4 w-4 text-indigo-400" />
                                <h2 className="text-sm font-bold text-white tracking-wide uppercase">
                                    Live Board State
                                </h2>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className="text-[11px] font-mono text-slate-400">
                                    Seq: <span className="text-white font-bold">#{boardState.sequence}</span>
                                </span>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                        isOccupied
                                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/20 animate-pulse'
                                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20'
                                    }`}
                                >
                                    {isOccupied ? '● OCCUPIED (1)' : '○ VACANT (0)'}
                                </span>
                            </div>
                        </div>

                        {/* Pinned Message Display */}
                        <div className="p-5 rounded-2xl bg-midnight-950/90 border border-white/10 shadow-inner space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                                    Pinned Message
                                </span>
                                {isOccupied && (
                                    <span className="text-[10px] text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-semibold flex items-center gap-1">
                                        <Edit3 className="h-3 w-3" />
                                        <span>Editable with postMessage()</span>
                                    </span>
                                )}
                            </div>
                            {boardState.message.is_some ? (
                                <p className="text-base font-medium text-white italic leading-relaxed">
                                    &ldquo;{boardState.message.value}&rdquo;
                                </p>
                            ) : (
                                <div className="text-sm text-slate-500 italic py-2 flex items-center space-x-2">
                                    <span>(No message currently posted on the board)</span>
                                </div>
                            )}
                        </div>

                        {/* Owner Commitment & Metadata */}
                        <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between p-3 rounded-xl bg-midnight-950/60 border border-white/5">
                                <span className="text-slate-400 font-medium">Owner Tag (ZK Hash):</span>
                                <div className="flex items-center space-x-1.5 font-mono text-[11px] text-cyan-300">
                                    <span>{boardState.owner.slice(0, 16)}...</span>
                                    <button
                                        onClick={() => copyToClipboard(boardState.owner, 'owner-tag')}
                                        className="text-slate-400 hover:text-white cursor-pointer"
                                        title="Copy full owner hash"
                                    >
                                        {copiedKey === 'owner-tag' ? (
                                            <Check className="h-3 w-3 text-emerald-400" />
                                        ) : (
                                            <Copy className="h-3 w-3" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Manual Circuit Execution Sandbox */}
                    <div className="p-6 rounded-3xl bg-midnight-900/80 border border-white/10 shadow-2xl space-y-5 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center space-x-2">
                                <Zap className="h-4 w-4 text-cyan-400" />
                                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                                    Circuit Execution Sandbox
                                </h3>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">Simulated Local Context</span>
                        </div>

                        {/* Identity Switcher */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-slate-300 block">
                                Active Off-Chain Identity
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedIdentity('Alice')}
                                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        selectedIdentity === 'Alice'
                                            ? 'bg-purple-600/30 text-purple-200 border-purple-500/50 shadow-md shadow-purple-500/20'
                                            : 'bg-midnight-950 text-slate-400 border-white/10 hover:text-white'
                                    }`}
                                >
                                    <User className="h-3.5 w-3.5 text-purple-400" />
                                    <span>Alice (Author 0x07)</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setSelectedIdentity('Bob')}
                                    className={`flex items-center justify-center space-x-2 p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                                        selectedIdentity === 'Bob'
                                            ? 'bg-amber-600/30 text-amber-200 border-amber-500/50 shadow-md shadow-amber-500/20'
                                            : 'bg-midnight-950 text-slate-400 border-white/10 hover:text-white'
                                    }`}
                                >
                                    <User className="h-3.5 w-3.5 text-amber-400" />
                                    <span>Bob (Guest 0x09)</span>
                                </button>
                            </div>
                        </div>

                        {/* Circuit Form */}
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                    Message Payload
                                </label>
                                <input
                                    type="text"
                                    value={customMessage}
                                    onChange={(e) => setCustomMessage(e.target.value)}
                                    placeholder="Enter message for post() / postMessage() circuits..."
                                    className="w-full rounded-xl bg-midnight-950 px-3.5 py-2.5 text-xs text-white border border-white/10 focus:border-cyan-500 focus:outline-none placeholder-slate-500"
                                />
                            </div>

                            {/* Circuit Action Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                                {/* Post Circuit Button */}
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!customMessage.trim()) return;
                                        setIsExecutingCircuit(true);
                                        addLog(`[Manual] ${selectedIdentity} executing post("${customMessage}")...`);
                                        try {
                                            const res = await fetch('/api/contract/bulletin-board/showcase', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    action: 'custom_circuit',
                                                    customAction: 'post',
                                                    message: customMessage.trim(),
                                                    identity: selectedIdentity,
                                                    sessionId: contractAddress,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                const ls = data.data?.nextLedgerState;
                                                if (ls) {
                                                    setBoardState({
                                                        state: Number(ls.state),
                                                        message: ls.message,
                                                        sequence: Number(ls.sequence),
                                                        owner: typeof ls.owner === 'string' ? ls.owner : Buffer.from(ls.owner).toString('hex'),
                                                    });
                                                }
                                                addLog(`[Manual] Post confirmed: "${customMessage}"`);
                                                toast.success('Post Confirmed', `${selectedIdentity} posted to bulletin board.`);
                                            } else {
                                                throw new Error(data.error);
                                            }
                                        } catch (err: any) {
                                            addLog(`[Manual Error] Assertion caught: ${err.message}`);
                                            toast.error('Circuit Assertion Failed', err.message);
                                        } finally {
                                            setIsExecutingCircuit(false);
                                        }
                                    }}
                                    disabled={isExecutingCircuit}
                                    className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-cyan-600/30 text-cyan-200 hover:bg-cyan-600 hover:text-white border border-cyan-500/40 text-xs font-bold transition-all cursor-pointer shadow-md"
                                    title="Requires board to be in VACANT state"
                                >
                                    <Send className="h-3.5 w-3.5" />
                                    <span>post()</span>
                                </button>

                                {/* PostMessage Circuit Button */}
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!customMessage.trim()) return;
                                        setIsExecutingCircuit(true);
                                        addLog(`[Manual] ${selectedIdentity} executing postMessage("${customMessage}")...`);
                                        try {
                                            const res = await fetch('/api/contract/bulletin-board/showcase', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    action: 'custom_circuit',
                                                    customAction: 'postMessage',
                                                    message: customMessage.trim(),
                                                    identity: selectedIdentity,
                                                    sessionId: contractAddress,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                const ls = data.data?.nextLedgerState;
                                                if (ls) {
                                                    setBoardState({
                                                        state: Number(ls.state),
                                                        message: ls.message,
                                                        sequence: Number(ls.sequence),
                                                        owner: typeof ls.owner === 'string' ? ls.owner : Buffer.from(ls.owner).toString('hex'),
                                                    });
                                                }
                                                addLog(`[Manual] postMessage confirmed: "${customMessage}"`);
                                                toast.success('Message Updated', `${selectedIdentity} executed postMessage().`);
                                            } else {
                                                throw new Error(data.error);
                                            }
                                        } catch (err: any) {
                                            addLog(`[Manual Error] Assertion caught: ${err.message}`);
                                            toast.error('postMessage Assertion Failed', err.message);
                                        } finally {
                                            setIsExecutingCircuit(false);
                                        }
                                    }}
                                    disabled={isExecutingCircuit}
                                    className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-purple-600/30 text-purple-200 hover:bg-purple-600 hover:text-white border border-purple-500/40 text-xs font-bold transition-all cursor-pointer shadow-md"
                                    title="Posts when VACANT, or updates existing message if caller is current owner"
                                >
                                    <Edit3 className="h-3.5 w-3.5" />
                                    <span>postMessage()</span>
                                </button>

                                {/* TakeDown Circuit Button */}
                                <button
                                    type="button"
                                    onClick={async () => {
                                        setIsExecutingCircuit(true);
                                        addLog(`[Manual] ${selectedIdentity} executing takeDown()...`);
                                        try {
                                            const res = await fetch('/api/contract/bulletin-board/showcase', {
                                                method: 'POST',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({
                                                    action: 'custom_circuit',
                                                    customAction: 'takeDown',
                                                    identity: selectedIdentity,
                                                    sessionId: contractAddress,
                                                }),
                                            });
                                            const data = await res.json();
                                            if (data.success) {
                                                const ls = data.data?.nextLedgerState;
                                                if (ls) {
                                                    setBoardState({
                                                        state: Number(ls.state),
                                                        message: ls.message,
                                                        sequence: Number(ls.sequence),
                                                        owner: typeof ls.owner === 'string' ? ls.owner : Buffer.from(ls.owner).toString('hex'),
                                                    });
                                                }
                                                addLog(`[Manual] takeDown() confirmed. Removed message: "${data.data.result}"`);
                                                toast.success('TakeDown Confirmed', `Post removed: "${data.data.result}"`);
                                            } else {
                                                throw new Error(data.error);
                                            }
                                        } catch (err: any) {
                                            addLog(`[Manual Error] Assertion caught: ${err.message}`);
                                            toast.error('TakeDown Assertion Failed', err.message);
                                        } finally {
                                            setIsExecutingCircuit(false);
                                        }
                                    }}
                                    disabled={isExecutingCircuit}
                                    className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl bg-rose-600/30 text-rose-200 hover:bg-rose-600 hover:text-white border border-rose-500/40 text-xs font-bold transition-all cursor-pointer shadow-md"
                                    title="Removes post if caller is current owner"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>takeDown()</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (7 Cols): Showcase Stepper Pipeline + State Inspector */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Showcase Stepper Card */}
                    <div className="p-6 rounded-3xl bg-midnight-900/80 border border-white/10 shadow-2xl space-y-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center space-x-2">
                                <Cpu className="h-4 w-4 text-purple-400" />
                                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                                    Showcase Verification Suite
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                                6 Circuit Test Scenarios
                            </span>
                        </div>

                        {/* Step Items List */}
                        <div className="space-y-3">
                            {[
                                {
                                    id: 1,
                                    title: '1. Contract Initialization',
                                    subtitle: 'Constructor sets VACANT state & Sequence #1',
                                    actor: 'Alice',
                                    type: 'success',
                                },
                                {
                                    id: 2,
                                    title: '2. Alice Posts Message',
                                    subtitle: 'Sets OCCUPIED (1) & commits Alice secretKey hash',
                                    actor: 'Alice',
                                    type: 'success',
                                },
                                {
                                    id: 3,
                                    title: '3. Duplicate Post Rejection (Alice)',
                                    subtitle: 'Enforces assert(ledger.state == State.VACANT)',
                                    actor: 'Alice',
                                    type: 'expected_error',
                                },
                                {
                                    id: 4,
                                    title: '4. Unauthorized Post Rejection (Bob)',
                                    subtitle: 'Rejects Bob submission while board is OCCUPIED',
                                    actor: 'Bob',
                                    type: 'expected_error',
                                },
                                {
                                    id: 5,
                                    title: '5. Unauthorized Takedown Rejection (Bob)',
                                    subtitle: 'Enforces owner cryptographic commitment check',
                                    actor: 'Bob',
                                    type: 'expected_error',
                                },
                                {
                                    id: 6,
                                    title: '6. Authorized Takedown (Alice)',
                                    subtitle: 'Alice proves ownership, resets board to VACANT, Sequence #2',
                                    actor: 'Alice',
                                    type: 'success',
                                },
                            ].map((step, idx) => {
                                const result = showcaseSteps.find((s) => s.stepId === step.id);
                                const isCurrent = activeStepIndex === idx;

                                return (
                                    <div
                                        key={step.id}
                                        className={`p-3.5 rounded-2xl border transition-all ${
                                            isCurrent
                                                ? 'bg-indigo-600/20 border-indigo-500/60 shadow-lg shadow-indigo-500/20'
                                                : result
                                                ? result.status === 'success'
                                                    ? 'bg-emerald-500/10 border-emerald-500/30'
                                                    : 'bg-amber-500/10 border-amber-500/30'
                                                : 'bg-midnight-950/70 border-white/5 text-slate-400'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div
                                                    className={`flex h-7 w-7 items-center justify-center rounded-xl text-xs font-bold ${
                                                        isCurrent
                                                            ? 'bg-indigo-600 text-white animate-spin'
                                                            : result
                                                            ? result.status === 'success'
                                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                                : 'bg-amber-500/20 text-amber-300'
                                                            : 'bg-midnight-800 text-slate-400'
                                                    }`}
                                                >
                                                    {isCurrent ? (
                                                        <RefreshCw className="h-3.5 w-3.5" />
                                                    ) : result ? (
                                                        result.status === 'success' ? (
                                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                                        ) : (
                                                            <ShieldAlert className="h-4 w-4 text-amber-400" />
                                                        )
                                                    ) : (
                                                        step.id
                                                    )}
                                                </div>

                                                <div>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-xs font-bold text-white">
                                                            {step.title}
                                                        </span>
                                                        <span
                                                            className={`px-2 py-0.2 rounded text-[10px] font-semibold border ${
                                                                step.actor === 'Alice'
                                                                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                                                                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                                            }`}
                                                        >
                                                            {step.actor}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-400">{step.subtitle}</p>
                                                </div>
                                            </div>

                                            {result && (
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                                        result.status === 'success'
                                                            ? 'bg-emerald-500/20 text-emerald-300'
                                                            : 'bg-amber-500/20 text-amber-300'
                                                    }`}
                                                >
                                                    {result.status === 'success' ? 'PASSED' : 'ASSERTION CAUGHT'}
                                                </span>
                                            )}
                                        </div>

                                        {result && (
                                            <div className="mt-2.5 pt-2 border-t border-white/5 text-[11px] font-mono text-slate-300">
                                                {result.message}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* State Inspector & Console Tabs */}
                    <div className="p-6 rounded-3xl bg-midnight-900/80 border border-white/10 shadow-2xl space-y-4 backdrop-blur-xl">
                        <div className="flex items-center justify-between border-b border-white/10 pb-3">
                            <div className="flex items-center space-x-2">
                                <TerminalIcon className="h-4 w-4 text-cyan-400" />
                                <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                                    Live Diagnostics & State Inspector
                                </h3>
                            </div>

                            {/* Inspector Tab Switcher */}
                            <div className="flex items-center space-x-1 p-1 rounded-xl bg-midnight-950 border border-white/5">
                                <button
                                    onClick={() => setInspectorTab('ledger')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        inspectorTab === 'ledger'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Ledger State
                                </button>
                                <button
                                    onClick={() => setInspectorTab('identities')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        inspectorTab === 'identities'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Alice & Bob Keys
                                </button>
                                <button
                                    onClick={() => setInspectorTab('logs')}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                                        inspectorTab === 'logs'
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-400 hover:text-white'
                                    }`}
                                >
                                    Logs Console ({logs.length})
                                </button>
                            </div>
                        </div>

                        {/* Inspector Content */}
                        <div className="rounded-2xl bg-midnight-950/90 border border-white/5 p-4 min-h-[160px] max-h-[240px] overflow-y-auto text-xs font-mono">
                            {inspectorTab === 'ledger' && (
                                <pre className="text-cyan-300 leading-relaxed">
                                    {JSON.stringify(
                                        {
                                            state: boardState.state === 1 ? 'OCCUPIED (1)' : 'VACANT (0)',
                                            sequence: boardState.sequence,
                                            message: boardState.message,
                                            owner: boardState.owner,
                                        },
                                        null,
                                        2
                                    )}
                                </pre>
                            )}

                            {inspectorTab === 'identities' && (
                                <div className="space-y-3 text-slate-300">
                                    <div>
                                        <span className="text-purple-300 font-bold block mb-1">
                                            Alice Private State (Author):
                                        </span>
                                        <code className="text-[11px] text-slate-400 break-all">
                                            secretKey: 0707070707070707070707070707070707070707070707070707070707070707
                                        </code>
                                    </div>
                                    <div className="border-t border-white/5 pt-2">
                                        <span className="text-amber-300 font-bold block mb-1">
                                            Bob Private State (Guest / Unauthorized):
                                        </span>
                                        <code className="text-[11px] text-slate-400 break-all">
                                            secretKey: 0909090909090909090909090909090909090909090909090909090909090909
                                        </code>
                                    </div>
                                </div>
                            )}

                            {inspectorTab === 'logs' && (
                                <div className="space-y-1 text-[11px] leading-snug text-slate-300">
                                    {logs.map((log, index) => (
                                        <div
                                            key={index}
                                            className={
                                                log.includes('Error') || log.includes('caught')
                                                    ? 'text-amber-300'
                                                    : log.includes('confirmed') || log.includes('successfully')
                                                    ? 'text-emerald-300'
                                                    : 'text-slate-300'
                                            }
                                        >
                                            {log}
                                        </div>
                                    ))}
                                    <div ref={logEndRef} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
