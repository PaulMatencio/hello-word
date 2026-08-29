'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Sparkles,
    Send,
    Bot,
    User,
    Copy,
    Check,
    RefreshCw,
    Key,
    Settings,
    Shield,
    Zap,
    FlaskConical,
    FileCode2,
    CheckCircle2,
    AlertCircle,
    ArrowDownToLine,
    Trash2,
    HelpCircle,
    Code2,
    ExternalLink,
} from 'lucide-react';
import { useToast } from '@/src/presentation/context/ToastContext';

interface AiMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    action?: string;
    codeBlocks?: { language: string; code: string }[];
}

interface AiCopilotPanelProps {
    filename: string;
    sourceCode: string;
    compilerResult: any;
    testResult: any;
    onApplyCodeToEditor: (code: string) => void;
    onSwitchTab?: (tab: string) => void;
}

export function AiCopilotPanel({
    filename,
    sourceCode,
    compilerResult,
    testResult,
    onApplyCodeToEditor,
    onSwitchTab,
}: AiCopilotPanelProps) {
    const toast = useToast();
    const [messages, setMessages] = useState<AiMessage[]>([
        {
            id: 'welcome',
            role: 'assistant',
            content: `👋 **Hello! I'm Gemini 3.7 Flash, your Midnight Compact AI Copilot.**

I can help you build, fix, and test Zero-Knowledge smart contracts and generate Midnight.js client SDK applications:
* 🛠️ **Diagnose & Fix** compiler errors or witness type mismatches.
* ⚡ **Generate Midnight.js TypeScript Client** connection code.
* 🧪 **Scaffold Vitest unit tests** with simulated circuit contexts.
* 🔒 **Audit ZK & Privacy constraints** for witness leaks.

Ask a question below or click one of the quick actions to get started!`,
            timestamp: new Date(),
        },
    ]);
    const [inputPrompt, setInputPrompt] = useState<string>('');
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [abortController, setAbortController] = useState<AbortController | null>(null);

    // Settings
    const [apiKey, setApiKey] = useState<string>('');
    const [selectedModel, setSelectedModel] = useState<string>('gemini-3.7-flash');
    const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
    const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load saved API key & model preferences from localStorage
    useEffect(() => {
        try {
            const savedKey = localStorage.getItem('midnight_gemini_api_key');
            const savedModel = localStorage.getItem('midnight_gemini_model');
            if (savedKey) setApiKey(savedKey);
            if (savedModel) setSelectedModel(savedModel);
        } catch {
            // Ignore localStorage errors
        }
    }, []);

    const saveApiKey = (key: string) => {
        setApiKey(key);
        try {
            if (key) {
                localStorage.setItem('midnight_gemini_api_key', key);
            } else {
                localStorage.removeItem('midnight_gemini_api_key');
            }
            toast.success('Settings Saved', 'Gemini API Key preferences updated.');
            setIsSettingsOpen(false);
        } catch {
            // Ignore
        }
    };

    const saveModel = (model: string) => {
        setSelectedModel(model);
        try {
            localStorage.setItem('midnight_gemini_model', model);
        } catch {
            // Ignore
        }
    };

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isStreaming]);

    // Send AI request (streaming)
    const handleSendAction = async (action: string = 'chat', customPrompt?: string) => {
        const textPrompt = customPrompt !== undefined ? customPrompt : inputPrompt;
        if (!textPrompt.trim() && action === 'chat') return;

        // Create user message
        const userMsgId = `user-${Date.now()}`;
        const userMsg: AiMessage = {
            id: userMsgId,
            role: 'user',
            content:
                action === 'fix_error'
                    ? '🛠️ Fix Compiler Error for this contract'
                    : action === 'generate_client'
                    ? '⚡ Generate Midnight.js TypeScript Client Adapter'
                    : action === 'generate_tests'
                    ? '🧪 Generate Vitest Unit Tests for this contract'
                    : action === 'audit_zk'
                    ? '🔒 Conduct ZK & Privacy Audit'
                    : action === 'explain'
                    ? '📖 Explain this Compact contract architecture'
                    : textPrompt,
            timestamp: new Date(),
            action,
        };

        const assistantMsgId = `assistant-${Date.now()}`;
        const assistantMsg: AiMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            action,
        };

        setMessages((prev) => [...prev, userMsg, assistantMsg]);
        setInputPrompt('');
        setIsStreaming(true);

        const controller = new AbortController();
        setAbortController(controller);

        try {
            const res = await fetch('/api/ai/compact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: textPrompt,
                    action,
                    code: sourceCode,
                    filename,
                    diagnostics: compilerResult?.diagnostics || [],
                    compilerOutput: compilerResult?.rawOutput || compilerResult?.error || '',
                    dtsContent: compilerResult?.dts || '',
                    testOutput: testResult?.rawOutput || (testResult ? JSON.stringify(testResult) : ''),
                    model: selectedModel,
                    apiKey: apiKey || undefined,
                }),
                signal: controller.signal,
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                if (res.status === 401) {
                    setMessages((prev) =>
                        prev.map((msg) =>
                            msg.id === assistantMsgId
                                ? {
                                      ...msg,
                                      content: `⚠️ **Gemini API Key Required**\n\nPlease configure your Google AI Studio API key in the [Copilot Settings](#settings) or add \`GEMINI_API_KEY=...\` to your \`.env.local\` file.\n\nGet a free API key at [Google AI Studio](https://aistudio.google.com/).`,
                                  }
                                : msg
                        )
                    );
                    setIsSettingsOpen(true);
                    return;
                }
                throw new Error(errorData.message || `API Error ${res.status}`);
            }

            const reader = res.body?.getReader();
            if (!reader) throw new Error('No response stream available');

            const decoder = new TextDecoder();
            let accumulatedContent = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMsgId ? { ...msg, content: accumulatedContent } : msg
                    )
                );
            }
        } catch (err: any) {
            if (err.name === 'AbortError') {
                // User cancelled stream
            } else {
                console.error('AI Stream Error:', err);
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === assistantMsgId
                            ? {
                                  ...msg,
                                  content: `❌ **Error**: ${err.message || 'Failed to generate response. Please check your API key and connection.'}`,
                              }
                            : msg
                    )
                );
                toast.error('AI Request Failed', err.message);
            }
        } finally {
            setIsStreaming(false);
            setAbortController(null);
        }
    };

    const handleStopStream = () => {
        if (abortController) {
            abortController.abort();
            setIsStreaming(false);
            setAbortController(null);
            toast.info('Generation Stopped', 'Response generation was cancelled.');
        }
    };

    const handleClearChat = () => {
        setMessages([
            {
                id: 'welcome-reset',
                role: 'assistant',
                content: `Chat history cleared. How can I assist you with **${filename}**?`,
                timestamp: new Date(),
            },
        ]);
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(id);
        toast.success('Copied to Clipboard', 'Code copied.');
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    // Helper to parse markdown code blocks for extraction
    const extractCodeBlocks = (text: string) => {
        const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
        const blocks: { language: string; code: string; fullMatch: string }[] = [];
        let match;
        while ((match = regex.exec(text)) !== null) {
            blocks.push({
                language: match[1] || 'text',
                code: match[2].trim(),
                fullMatch: match[0],
            });
        }
        return blocks;
    };

    // Render formatted markdown content with interactive code blocks
    const renderMessageContent = (content: string, msgId: string) => {
        const blocks = extractCodeBlocks(content);

        if (blocks.length === 0) {
            return <div className="whitespace-pre-wrap text-xs text-slate-200 leading-relaxed font-sans">{content}</div>;
        }

        // Split text by code blocks
        const parts = content.split(/```[a-zA-Z0-9_-]*\n[\s\S]*?```/g);

        return (
            <div className="space-y-3 text-xs text-slate-200 leading-relaxed">
                {parts.map((part, index) => (
                    <React.Fragment key={index}>
                        {part.trim() && (
                            <div className="whitespace-pre-wrap font-sans text-slate-200">{part.trim()}</div>
                        )}
                        {blocks[index] && (
                            <div className="rounded-xl border border-indigo-500/30 bg-midnight-950 overflow-hidden shadow-lg my-2">
                                <div className="flex items-center justify-between bg-midnight-900/90 px-3 py-1.5 border-b border-white/5 text-[11px]">
                                    <span className="font-mono text-cyan-300 font-medium">
                                        {blocks[index].language || 'code'}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                        {/* Apply to Monaco Editor Button (if compact code) */}
                                        {(blocks[index].language === 'compact' ||
                                            blocks[index].language === 'rust' ||
                                            blocks[index].code.includes('export ledger') ||
                                            blocks[index].code.includes('export circuit')) && (
                                            <button
                                                onClick={() => {
                                                    onApplyCodeToEditor(blocks[index].code);
                                                    toast.success(
                                                        'Applied to Editor',
                                                        'Contract code updated in Monaco Editor.'
                                                    );
                                                }}
                                                className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600/40 text-indigo-200 hover:bg-indigo-600 text-[10px] font-semibold border border-indigo-500/40 transition-colors"
                                                title="Replace current Monaco Editor code with this snippet"
                                            >
                                                <ArrowDownToLine className="h-3 w-3" />
                                                <span>Apply to Editor</span>
                                            </button>
                                        )}

                                        {/* Copy code button */}
                                        <button
                                            onClick={() =>
                                                copyToClipboard(blocks[index].code, `${msgId}-${index}`)
                                            }
                                            className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-midnight-800 text-slate-300 hover:text-white text-[10px] border border-white/10 transition-colors"
                                        >
                                            {copiedIndex === `${msgId}-${index}` ? (
                                                <>
                                                    <Check className="h-3 w-3 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="h-3 w-3 text-slate-400" />
                                                    <span>Copy</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <pre className="p-3 overflow-x-auto text-[11px] font-mono text-slate-300 bg-midnight-950/80 leading-snug">
                                    <code>{blocks[index].code}</code>
                                </pre>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        );
    };

    const hasCompilerError =
        compilerResult?.success === false ||
        (compilerResult?.diagnostics && compilerResult.diagnostics.length > 0);

    return (
        <div className="flex flex-col h-full bg-midnight-950/60 overflow-hidden">
            {/* Copilot Header */}
            <div className="flex items-center justify-between border-b border-white/10 bg-midnight-950/90 px-4 py-2.5">
                <div className="flex items-center space-x-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-sm shadow-indigo-500/30">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div>
                        <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-xs text-white">Gemini 3.7 Flash</span>
                            <span className="rounded-full bg-indigo-500/10 text-indigo-300 px-1.5 py-0.2 text-[10px] font-mono border border-indigo-500/30">
                                Copilot
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center space-x-1">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className={`p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors ${
                            isSettingsOpen ? 'bg-indigo-600/30 text-indigo-200' : 'hover:bg-midnight-900'
                        }`}
                        title="AI Settings & API Key"
                    >
                        <Settings className="h-4 w-4" />
                    </button>
                    <button
                        onClick={handleClearChat}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-midnight-900 transition-colors"
                        title="Clear chat history"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* API Key & Settings Drawer */}
            {isSettingsOpen && (
                <div className="border-b border-indigo-500/30 bg-midnight-900/95 p-3.5 space-y-3 animate-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
                            <Key className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Gemini API Key Configuration</span>
                        </div>
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1"
                        >
                            <span>Get free key</span>
                            <ExternalLink className="h-2.5 w-2.5" />
                        </a>
                    </div>

                    <div className="space-y-1.5">
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="AIzaSy... (Leave blank to use server GEMINI_API_KEY)"
                            className="w-full rounded-lg bg-midnight-950 px-3 py-1.5 text-xs font-mono text-cyan-300 border border-white/10 focus:border-indigo-500 focus:outline-none"
                        />
                        <p className="text-[10px] text-slate-400">
                            Keys entered here are securely saved in your local browser storage.
                        </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-2">
                            <span className="text-[11px] text-slate-400">Model:</span>
                            <select
                                value={selectedModel}
                                onChange={(e) => saveModel(e.target.value)}
                                className="rounded-lg bg-midnight-950 px-2 py-1 text-xs text-slate-200 border border-white/10 focus:outline-none"
                            >
                                <option value="gemini-3.7-flash">Gemini 3.7 Flash (Recommended)</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                            </select>
                        </div>

                        <button
                            onClick={() => saveApiKey(apiKey)}
                            className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors shadow-sm"
                        >
                            Save Settings
                        </button>
                    </div>
                </div>
            )}

            {/* Quick Action Prompt Chips */}
            <div className="border-b border-white/5 bg-midnight-900/40 p-2.5 flex flex-wrap gap-1.5">
                {hasCompilerError && (
                    <button
                        onClick={() => handleSendAction('fix_error')}
                        disabled={isStreaming}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-300 border border-rose-500/40 text-[11px] font-semibold hover:bg-rose-600/30 transition-all animate-pulse"
                    >
                        <AlertCircle className="h-3 w-3 text-rose-400" />
                        <span>Fix Compiler Error</span>
                    </button>
                )}

                <button
                    onClick={() => handleSendAction('generate_client')}
                    disabled={isStreaming}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-medium hover:bg-indigo-600/30 hover:text-white transition-colors"
                >
                    <Zap className="h-3 w-3 text-indigo-400" />
                    <span>Generate Client SDK</span>
                </button>

                <button
                    onClick={() => handleSendAction('generate_tests')}
                    disabled={isStreaming}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium hover:bg-emerald-600/30 hover:text-white transition-colors"
                >
                    <FlaskConical className="h-3 w-3 text-emerald-400" />
                    <span>Generate Tests</span>
                </button>

                <button
                    onClick={() => handleSendAction('audit_zk')}
                    disabled={isStreaming}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-medium hover:bg-cyan-600/30 hover:text-white transition-colors"
                >
                    <Shield className="h-3 w-3 text-cyan-400" />
                    <span>Audit ZK</span>
                </button>

                <button
                    onClick={() => handleSendAction('explain')}
                    disabled={isStreaming}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-midnight-800 text-slate-300 border border-white/5 text-[11px] font-medium hover:bg-midnight-700 hover:text-white transition-colors"
                >
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span>Explain</span>
                </button>
            </div>

            {/* Chat Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[250px]">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex flex-col ${
                            msg.role === 'user' ? 'items-end' : 'items-start'
                        }`}
                    >
                        <div className="flex items-center space-x-1.5 mb-1 px-1">
                            {msg.role === 'user' ? (
                                <>
                                    <span className="text-[10px] text-slate-400">You</span>
                                    <User className="h-3 w-3 text-indigo-400" />
                                </>
                            ) : (
                                <>
                                    <Bot className="h-3 w-3 text-cyan-400" />
                                    <span className="text-[10px] text-slate-400">Gemini 3.7 Flash</span>
                                </>
                            )}
                        </div>

                        <div
                            className={`rounded-2xl px-4 py-3 max-w-[95%] shadow-md ${
                                msg.role === 'user'
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tr-none'
                                    : 'bg-midnight-900/90 text-slate-200 border border-white/10 rounded-tl-none'
                            }`}
                        >
                            {msg.content ? (
                                renderMessageContent(msg.content, msg.id)
                            ) : (
                                <div className="flex items-center space-x-2 text-xs text-slate-400 py-1">
                                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                                    <span>Thinking and analyzing circuits...</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Context bar & Input Box */}
            <div className="border-t border-white/10 bg-midnight-950/90 p-3 space-y-2">
                {/* Active Context indicator */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <div className="flex items-center space-x-1.5 overflow-hidden">
                        <FileCode2 className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                        <span className="font-mono text-slate-300 truncate">{filename}</span>
                        <span>•</span>
                        <span>{sourceCode.split('\n').length} lines</span>
                    </div>

                    {hasCompilerError && (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
                            Compiler errors in context
                        </span>
                    )}
                </div>

                {/* Chat Input Bar */}
                <div className="relative flex items-center">
                    <textarea
                        value={inputPrompt}
                        onChange={(e) => setInputPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendAction('chat');
                            }
                        }}
                        placeholder="Ask Gemini about this contract or requested circuits... (Enter to send)"
                        rows={2}
                        disabled={isStreaming}
                        className="w-full resize-none rounded-xl bg-midnight-900 px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 border border-white/10 focus:border-indigo-500 focus:outline-none pr-20"
                    />

                    <div className="absolute right-2 flex items-center space-x-1.5">
                        {isStreaming ? (
                            <button
                                onClick={handleStopStream}
                                className="p-1.5 rounded-lg bg-rose-600/30 text-rose-300 border border-rose-500/40 hover:bg-rose-600 text-xs transition-colors"
                                title="Stop generation"
                            >
                                Stop
                            </button>
                        ) : (
                            <button
                                onClick={() => handleSendAction('chat')}
                                disabled={!inputPrompt.trim()}
                                className="p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100 transition-all cursor-pointer"
                                title="Send message"
                            >
                                <Send className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
