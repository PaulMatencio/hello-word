import { NextResponse } from 'next/server';
import { MIDNIGHT_CONFIG } from '@/src/infrastructure/config/midnight.config';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET() {
  const results: Record<string, any> = {
    networkId: MIDNIGHT_CONFIG.networkId,
    timestamp: new Date().toISOString(),
    services: {},
  };

  // 1. Node RPC Check
  const startNode = Date.now();
  try {
    const res = await fetch(MIDNIGHT_CONFIG.nodeRpc, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'system_health',
        params: [],
      }),
      signal: AbortSignal.timeout(4000),
    });
    const latency = Date.now() - startNode;
    if (res.ok) {
      const data = await res.json();
      results.services.node = {
        name: 'Midnight Node RPC',
        url: MIDNIGHT_CONFIG.nodeRpc,
        status: 'online',
        latencyMs: latency,
        data: data.result || 'Connected',
      };
    } else {
      results.services.node = {
        name: 'Midnight Node RPC',
        url: MIDNIGHT_CONFIG.nodeRpc,
        status: 'degraded',
        latencyMs: latency,
        error: `HTTP ${res.status}: ${res.statusText}`,
      };
    }
  } catch (err: any) {
    results.services.node = {
      name: 'Midnight Node RPC',
      url: MIDNIGHT_CONFIG.nodeRpc,
      status: 'offline',
      latencyMs: Date.now() - startNode,
      error: err.message || 'Connection failed',
    };
  }

  // 2. Indexer GraphQL Check
  const startIndexer = Date.now();
  try {
    const res = await fetch(MIDNIGHT_CONFIG.indexer, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: '{ __schema { queryType { name } } }',
      }),
      signal: AbortSignal.timeout(4000),
    });
    const latency = Date.now() - startIndexer;
    if (res.ok) {
      results.services.indexer = {
        name: 'Midnight Indexer',
        url: MIDNIGHT_CONFIG.indexer,
        status: 'online',
        latencyMs: latency,
        websocketUrl: MIDNIGHT_CONFIG.indexerWS,
      };
    } else {
      results.services.indexer = {
        name: 'Midnight Indexer',
        url: MIDNIGHT_CONFIG.indexer,
        status: 'degraded',
        latencyMs: latency,
        error: `HTTP ${res.status}`,
      };
    }
  } catch (err: any) {
    results.services.indexer = {
      name: 'Midnight Indexer',
      url: MIDNIGHT_CONFIG.indexer,
      status: 'offline',
      latencyMs: Date.now() - startIndexer,
      error: err.message,
    };
  }

  // 3. Proof Server Check
  const startProof = Date.now();
  try {
    const res = await fetch(`${MIDNIGHT_CONFIG.proofServer}/ready`, {
      signal: AbortSignal.timeout(2000),
    });
    const latency = Date.now() - startProof;
    if (res.ok) {
      results.services.proofServer = {
        name: 'Midnight Proof Server',
        url: MIDNIGHT_CONFIG.proofServer,
        status: 'online',
        latencyMs: latency,
      };
    } else {
      results.services.proofServer = {
        name: 'Midnight Proof Server',
        url: MIDNIGHT_CONFIG.proofServer,
        status: 'degraded',
        latencyMs: latency,
        error: `HTTP ${res.status}`,
      };
    }
  } catch (err: any) {
    results.services.proofServer = {
      name: 'Midnight Proof Server',
      url: MIDNIGHT_CONFIG.proofServer,
      status: 'offline',
      latencyMs: Date.now() - startProof,
      error: err.message,
      note: 'Self-hosted proof server is offline. Browser-connected Lace wallets delegate proving automatically.',
    };
  }

  // 4. Compact CLI Check
  try {
    const { stdout } = await execAsync('compact --version');
    results.services.compactCli = {
      name: 'Compact Compiler CLI',
      status: 'online',
      version: stdout.trim(),
    };
  } catch (err: any) {
    results.services.compactCli = {
      name: 'Compact Compiler CLI',
      status: 'offline',
      error: 'compact executable not found in PATH',
    };
  }

  return NextResponse.json({
    success: true,
    diagnostics: results,
  });
}
