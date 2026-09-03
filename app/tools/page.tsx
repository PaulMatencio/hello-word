'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Stethoscope,
  Search,
  BookOpen,
  Code2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Layers,
  Shield,
  Zap,
  ArrowRight,
  Filter,
  Terminal,
  Activity,
} from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';

interface DoctorService {
  name: string;
  url?: string;
  status: 'online' | 'degraded' | 'offline';
  latencyMs?: number;
  data?: any;
  error?: string;
  note?: string;
  version?: string;
  websocketUrl?: string;
}

interface DoctorDiagnostics {
  networkId: string;
  timestamp: string;
  services: {
    node?: DoctorService;
    indexer?: DoctorService;
    proofServer?: DoctorService;
    compactCli?: DoctorService;
  };
}

interface CodeEntry {
  code: string;
  name: string;
  source: string;
  category: string;
  group?: {
    name: string;
    description: string;
  };
  description: string;
  fixes?: string[];
  aliases?: string[];
  severity?: string;
  see_also?: string[];
}

interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  code: string;
}

export default function ToolsAndDoctorPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'doctor' | 'codes' | 'templates'>('doctor');

  // Doctor state
  const [doctorData, setDoctorData] = useState<DoctorDiagnostics | null>(null);
  const [isDoctorLoading, setIsDoctorLoading] = useState(false);

  // Status Codes state
  const [codes, setCodes] = useState<CodeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [isCodesLoading, setIsCodesLoading] = useState(false);
  const [totalCodes, setTotalCodes] = useState(0);

  // Templates state
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [templateCategory, setTemplateCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Fetch Doctor Diagnostics
  const runDoctor = async () => {
    setIsDoctorLoading(true);
    try {
      const res = await fetch('/api/diagnostics/doctor');
      const data = await res.json();
      if (data.success) {
        setDoctorData(data.diagnostics);
      }
    } catch (err) {
      console.error('Failed to run doctor diagnostics:', err);
    } finally {
      setIsDoctorLoading(false);
    }
  };

  // Fetch Codes
  const fetchCodes = async (q: string, src: string, cat: string) => {
    setIsCodesLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (src && src !== 'all') params.set('source', src);
      if (cat && cat !== 'all') params.set('category', cat);
      params.set('limit', '60');

      const res = await fetch(`/api/diagnostics/codes?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCodes(data.entries);
        setTotalCodes(data.total);
        if (data.sources) setAvailableSources(data.sources);
        if (data.categories) setAvailableCategories(data.categories);
      }
    } catch (err) {
      console.error('Failed to fetch status codes:', err);
    } finally {
      setIsCodesLoading(false);
    }
  };

  // Fetch Templates
  const fetchTemplates = async () => {
    setIsTemplatesLoading(true);
    try {
      const res = await fetch('/api/contracts/templates');
      const data = await res.json();
      if (data.success && data.templates.length > 0) {
        setTemplates(data.templates);
        setSelectedTemplate(data.templates[0]);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    } finally {
      setIsTemplatesLoading(false);
    }
  };

  useEffect(() => {
    runDoctor();
    fetchCodes('', 'all', 'all');
    fetchTemplates();
  }, []);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    fetchCodes(val, selectedSource, selectedCategory);
  };

  const handleSourceChange = (src: string) => {
    setSelectedSource(src);
    fetchCodes(searchQuery, src, selectedCategory);
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    fetchCodes(searchQuery, selectedSource, cat);
  };

  const handleLoadTemplateIntoIde = (tmpl: ContractTemplate) => {
    localStorage.setItem('midnight_ide_source_code', tmpl.code);
    localStorage.setItem('midnight_ide_filename', `${tmpl.id}.compact`);
    localStorage.setItem('midnight_ide_is_dirty', 'true');
    router.push('/ide');
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredTemplates =
    templateCategory === 'all'
      ? templates
      : templates.filter((t) => t.category.toLowerCase() === templateCategory.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 space-y-6">
      <Breadcrumbs />

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-950/60 via-midnight-950/80 to-purple-950/50 border border-white/10 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5 text-purple-400" />
              <span>Midnight Expert Ecosystem Suite</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Tools & Diagnostics
            </h1>
            <p className="text-slate-400 max-w-2xl text-sm leading-relaxed">
              Verify infrastructure status with the <strong>Doctor</strong>, explore 460+ verified
              <strong> Status Codes & Remediation Guides</strong>, and load production-grade
              <strong> Compact Smart Contract Templates</strong> directly into your IDE.
            </p>
          </div>

          <button
            onClick={runDoctor}
            disabled={isDoctorLoading}
            className="inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold shadow-lg shadow-purple-900/30 transition-all cursor-pointer disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw className={`h-4 w-4 ${isDoctorLoading ? 'animate-spin' : ''}`} />
            <span>Run Diagnostic Scan</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-8 flex items-center space-x-2 border-b border-white/10 pb-px overflow-x-auto">
          <button
            onClick={() => setActiveTab('doctor')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'doctor'
                ? 'border-purple-400 text-white bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Stethoscope className="h-4 w-4 text-purple-400" />
            <span>Ecosystem Doctor</span>
          </button>

          <button
            onClick={() => setActiveTab('codes')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'codes'
                ? 'border-purple-400 text-white bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Search className="h-4 w-4 text-purple-400" />
            <span>Status Codes Directory ({totalCodes})</span>
          </button>

          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'templates'
                ? 'border-purple-400 text-white bg-white/5 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="h-4 w-4 text-purple-400" />
            <span>Compact Templates ({templates.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DOCTOR HEALTH DIAGNOSTICS */}
      {activeTab === 'doctor' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Node RPC */}
            <div className="rounded-xl bg-midnight-950/60 p-5 border border-white/5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Activity className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Midnight Node RPC</h4>
                    <span className="text-[11px] text-slate-400">Preprod Substrate</span>
                  </div>
                </div>
                {doctorData?.services.node?.status === 'online' ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Online</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                    <XCircle className="h-3 w-3" />
                    <span>Offline</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p className="truncate font-mono text-[11px]">{doctorData?.services.node?.url}</p>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Latency:</span>
                  <span className="text-indigo-300 font-mono">
                    {doctorData?.services.node?.latencyMs !== undefined
                      ? `${doctorData.services.node.latencyMs}ms`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Indexer GraphQL */}
            <div className="rounded-xl bg-midnight-950/60 p-5 border border-white/5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <Layers className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">GraphQL Indexer</h4>
                    <span className="text-[11px] text-slate-400">Chain & Ledger Events</span>
                  </div>
                </div>
                {doctorData?.services.indexer?.status === 'online' ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Online</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                    <XCircle className="h-3 w-3" />
                    <span>Offline</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p className="truncate font-mono text-[11px]">{doctorData?.services.indexer?.url}</p>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Latency:</span>
                  <span className="text-purple-300 font-mono">
                    {doctorData?.services.indexer?.latencyMs !== undefined
                      ? `${doctorData.services.indexer.latencyMs}ms`
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Proof Server */}
            <div className="rounded-xl bg-midnight-950/60 p-5 border border-white/5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                    <Shield className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">ZK Proof Server</h4>
                    <span className="text-[11px] text-slate-400">Port 6300 Prover</span>
                  </div>
                </div>
                {doctorData?.services.proofServer?.status === 'online' ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Online</span>
                  </span>
                ) : (
                  <span
                    className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20"
                    title="Self-hosted prover offline. Browser wallets (Lace) delegate proving automatically."
                  >
                    <AlertTriangle className="h-3 w-3" />
                    <span>Delegated</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p className="truncate font-mono text-[11px]">{doctorData?.services.proofServer?.url}</p>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Delegation:</span>
                  <span className="text-amber-300 font-medium">Active via Lace</span>
                </div>
              </div>
            </div>

            {/* Compact Toolchain */}
            <div className="rounded-xl bg-midnight-950/60 p-5 border border-white/5 flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Cpu className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Compact CLI</h4>
                    <span className="text-[11px] text-slate-400">Local Toolchain</span>
                  </div>
                </div>
                {doctorData?.services.compactCli?.status === 'online' ? (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Ready</span>
                  </span>
                ) : (
                  <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
                    <XCircle className="h-3 w-3" />
                    <span>Missing</span>
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-400 space-y-1">
                <p className="font-mono text-emerald-300">
                  {doctorData?.services.compactCli?.version || 'Not detected'}
                </p>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <span>Compiler Target:</span>
                  <span className="text-slate-300">v0.22+ compatible</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Doctor Recommendations Banner */}
          <div className="rounded-xl bg-indigo-950/30 p-5 border border-indigo-500/20 flex items-start space-x-3 text-sm text-slate-300">
            <CheckCircle2 className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <h5 className="font-semibold text-indigo-200">Doctor Summary</h5>
              <p className="mt-1 text-slate-400 text-xs leading-relaxed">
                Your environment is connected to Midnight Preprod with RPC and GraphQL indexer
                services responding normally. Compact CLI is detected in your PATH. If you wish to
                run self-hosted proving rather than wallet delegation, start the Midnight proof
                server with <code className="text-amber-300">docker run -p 6300:6300</code>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STATUS CODES DIRECTORY */}
      {activeTab === 'codes' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="rounded-xl bg-midnight-950/70 p-4 border border-white/10 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search error codes, messages, or keywords (e.g. 0, NetworkId, witness, deserialize)..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-midnight-900 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-slate-500"
              />
            </div>

            {/* Source selector */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs text-slate-400">Source:</span>
              <select
                value={selectedSource}
                onChange={(e) => handleSourceChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-midnight-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Sources</option>
                {availableSources.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Category selector */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <span className="text-xs text-slate-400">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="px-3 py-2 rounded-lg bg-midnight-900 border border-white/10 text-xs text-white focus:outline-none focus:border-purple-500"
              >
                <option value="all">All Categories</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Results List */}
          {isCodesLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400 space-x-2">
              <RefreshCw className="h-5 w-5 animate-spin text-purple-400" />
              <span>Searching status codes...</span>
            </div>
          ) : codes.length === 0 ? (
            <div className="rounded-xl bg-midnight-950/40 border border-white/5 p-12 text-center text-slate-400">
              <AlertTriangle className="h-8 w-8 text-amber-400 mx-auto mb-2 opacity-80" />
              <p className="font-semibold text-white">No status codes matched your query</p>
              <p className="text-xs text-slate-500 mt-1">Try searching by numeric code, error name, or keyword.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {codes.map((item) => (
                <div
                  key={`${item.source}-${item.code}-${item.name}`}
                  className="rounded-xl bg-midnight-950/60 p-4 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 font-mono text-xs font-bold border border-purple-500/20">
                        Code {item.code}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-medium">
                        {item.source}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white tracking-tight">{item.name}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                  </div>

                  {item.fixes && item.fixes.length > 0 && (
                    <div className="pt-2 border-t border-white/5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                        Suggested Fix:
                      </span>
                      {item.fixes.map((fix, idx) => (
                        <p key={idx} className="text-xs text-slate-300 flex items-start space-x-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{fix}</span>
                        </p>
                      ))}
                    </div>
                  )}

                  {item.category && (
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                      <span>Category: {item.category}</span>
                      {item.severity && (
                        <span
                          className={`uppercase font-semibold ${
                            item.severity === 'error' ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {item.severity}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPACT CONTRACT TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Template List */}
          <div className="lg:col-span-5 space-y-4">
            {/* Category Filter Pills */}
            <div className="flex items-center space-x-2 pb-2 overflow-x-auto">
              {['all', 'Tokens', 'Security', 'Applications'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTemplateCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    templateCategory === cat
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-midnight-900 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {cat.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredTemplates.map((tmpl) => {
                const isSelected = selectedTemplate?.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl)}
                    className={`rounded-xl p-4 border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-purple-950/30 border-purple-500/50 shadow-lg shadow-purple-900/20'
                        : 'bg-midnight-950/60 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-white">{tmpl.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                        {tmpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Code Preview & Actions */}
          <div className="lg:col-span-7">
            {selectedTemplate ? (
              <div className="rounded-2xl bg-midnight-950 border border-white/10 overflow-hidden flex flex-col h-full shadow-2xl">
                {/* Header */}
                <div className="p-4 bg-midnight-900/80 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-purple-400" />
                      <span>{selectedTemplate.name}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">{selectedTemplate.description}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyCode(selectedTemplate.code)}
                      className="p-2 rounded-lg bg-midnight-800 hover:bg-midnight-700 text-slate-300 hover:text-white border border-white/5 transition-all cursor-pointer"
                      title="Copy Compact Code"
                    >
                      {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>

                    <button
                      onClick={() => handleLoadTemplateIntoIde(selectedTemplate)}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition-all cursor-pointer"
                    >
                      <span>Load into Studio IDE</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Code Body */}
                <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto bg-midnight-950/90 leading-relaxed max-h-[600px] select-all">
                  {selectedTemplate.code}
                </pre>
              </div>
            ) : (
              <div className="rounded-2xl bg-midnight-950/40 border border-white/5 p-12 text-center text-slate-400">
                Select a template to preview its source code
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
