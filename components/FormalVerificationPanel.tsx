'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  Terminal,
  Cpu,
  Lock,
  Binary,
  Layers,
  Scale,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import type { FormalVerificationReport, VerificationProperty } from '@/app/api/compiler/verify/route';

interface FormalVerificationPanelProps {
  sourceCode: string;
  filename: string;
  isVerifying: boolean;
  onRunVerification: () => void;
  report: FormalVerificationReport | null;
}

export const FormalVerificationPanel: React.FC<FormalVerificationPanelProps> = ({
  sourceCode,
  filename,
  isVerifying,
  onRunVerification,
  report,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredProperties = report?.properties.filter((prop) => {
    if (selectedCategory === 'all') return true;
    return prop.category === selectedCategory;
  }) || [];

  return (
    <div className="flex flex-col h-full space-y-4 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 text-xs">
      {/* Top Banner & Trigger */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-5 w-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Compact Formal Verification (SMT / Z3)</h3>
            <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30 font-mono">
              v0.23+ Engine
            </span>
          </div>
          <p className="text-slate-400 text-[11px]">
            Mathematically proves Zero-Knowledge non-leakage, circuit constraint completeness, and inductive ledger safety.
          </p>
        </div>

        <button
          onClick={onRunVerification}
          disabled={isVerifying || !sourceCode}
          className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-cyan-950/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed shrink-0"
        >
          {isVerifying ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              <span>Solving SMT Formulas...</span>
            </>
          ) : (
            <>
              <Scale className="h-3.5 w-3.5" />
              <span>Run Formal Verification</span>
            </>
          )}
        </button>
      </div>

      {/* Summary Score Card */}
      {report && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="glass-panel p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Properties</span>
            <p className="text-xl font-bold text-white font-mono">{report.summary.totalProperties}</p>
            <span className="text-[10px] text-slate-500">Theorems evaluated</span>
          </div>

          <div className="glass-panel p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-400">Proven Satisfied</span>
            <p className="text-xl font-bold text-emerald-400 font-mono">{report.summary.proven}</p>
            <span className="text-[10px] text-slate-500">100% Mathematical Proof</span>
          </div>

          <div className="glass-panel p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-400">Warnings</span>
            <p className="text-xl font-bold text-amber-400 font-mono">{report.summary.warnings}</p>
            <span className="text-[10px] text-slate-500">Underconstrained paths</span>
          </div>

          <div className="glass-panel p-3 space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-400">Verification Status</span>
            <p className="text-sm font-bold text-cyan-300 font-mono truncate">
              {report.status === 'FULLY_PROVEN' ? '✓ FULLY PROVEN' : report.status}
            </p>
            <span className="text-[10px] text-slate-500">SMT-LIB2 / Z3 Soundness</span>
          </div>
        </div>
      )}

      {/* Invariant Filter Tabs */}
      {report && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {[
            { id: 'all', label: 'All Theorems' },
            { id: 'confidentiality', label: 'ZK Confidentiality' },
            { id: 'soundness', label: 'Circuit Soundness' },
            { id: 'invariants', label: 'Ledger Invariants' },
            { id: 'arithmetic', label: 'Arithmetic Bounds' },
            { id: 'access_control', label: 'Authorization' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-inner'
                  : 'bg-midnight-900 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Verified Properties List */}
      {report ? (
        <div className="space-y-3">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="glass-panel p-4 rounded-xl border border-white/10 space-y-2.5 hover:border-cyan-500/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-2">
                  {prop.status === 'PROVEN' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  ) : prop.status === 'WARNING' ? (
                    <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  )}
                  <span className="font-bold text-white text-xs">{prop.title}</span>
                  <span className="font-mono text-[10px] text-slate-400 bg-midnight-950 px-1.5 py-0.5 rounded border border-white/5">
                    {prop.id}
                  </span>
                </div>

                <span
                  className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold font-mono ${
                    prop.status === 'PROVEN'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  <span>{prop.status}</span>
                </span>
              </div>

              <p className="text-slate-300 text-[11px] leading-relaxed">{prop.description}</p>

              {/* Mathematical Formal Statement */}
              <div className="p-2.5 rounded-lg bg-midnight-950/90 border border-white/5 font-mono text-[11px] text-cyan-300 flex items-center justify-between">
                <span>{prop.formalStatement}</span>
                <span className="text-[10px] text-slate-500 font-sans">{prop.solver}</span>
              </div>

              {/* Details & Counter-examples */}
              <div className="text-[11px] text-slate-400 flex items-center space-x-1">
                <span>•</span>
                <span>{prop.details}</span>
              </div>
            </div>
          ))}

          {/* SMT-LIB2 Code Viewer */}
          {report.smtLib2Code && (
            <div className="rounded-xl bg-midnight-900 border border-white/10 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 flex items-center gap-1.5 text-xs">
                  <Binary className="h-4 w-4 text-purple-400" />
                  <span>Generated SMT-LIB2 Formal Proof Specification</span>
                </span>
                <button
                  onClick={() => copyToClipboard(report.smtLib2Code, 'smt-code')}
                  className="inline-flex items-center space-x-1 text-slate-400 hover:text-white text-[11px] p-1"
                  title="Copy SMT-LIB2 formulas"
                >
                  {copiedKey === 'smt-code' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedKey === 'smt-code' ? 'Copied' : 'Copy SMT-LIB2'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-lg bg-midnight-950 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-48 scrollbar-thin scrollbar-thumb-white/10">
                {report.smtLib2Code}
              </pre>
            </div>
          )}
        </div>
      ) : (
        /* Empty State before running verification */
        <div className="glass-panel p-8 text-center space-y-4 my-auto">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/20">
            <Scale className="h-6 w-6 text-cyan-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No Formal Verification Run Yet</h4>
            <p className="text-slate-400 text-xs max-w-md mx-auto">
              Click &quot;Run Formal Verification&quot; to evaluate your Compact contract against ZK confidentiality, circuit completeness, and inductive safety theorems.
            </p>
          </div>
          <button
            onClick={onRunVerification}
            disabled={isVerifying || !sourceCode}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-300" />
            <span>Verify {filename}</span>
          </button>
        </div>
      )}
    </div>
  );
};
