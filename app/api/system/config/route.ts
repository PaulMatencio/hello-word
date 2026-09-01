import { NextRequest, NextResponse } from 'next/server';
import { MIDNIGHT_CONFIG } from '@/src/infrastructure/config/midnight.config';
import { STORAGE_CONFIG } from '@/src/infrastructure/config/storage.config';
import { getRedisClient } from '@/src/infrastructure/persistence/redis/redis-client.factory';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        return NextResponse.json({
            success: true,
            data: {
                prover: {
                    url: process.env.MIDNIGHT_PROOF_SERVER || MIDNIGHT_CONFIG.proofServer,
                    defaultUrl: 'http://127.0.0.1:6300',
                },
                indexer: {
                    url: process.env.MIDNIGHT_INDEXER || MIDNIGHT_CONFIG.indexer,
                    wsUrl: process.env.MIDNIGHT_INDEXER_WS || MIDNIGHT_CONFIG.indexerWS,
                    nodeRpc: process.env.MIDNIGHT_NODE_RPC || MIDNIGHT_CONFIG.nodeRpc,
                    networkId: process.env.MIDNIGHT_NETWORK_ID || MIDNIGHT_CONFIG.networkId,
                    faucet: process.env.MIDNIGHT_FAUCET || MIDNIGHT_CONFIG.faucet,
                    explorer: process.env.MIDNIGHT_EXPLORER || MIDNIGHT_CONFIG.explorer,
                },
                storage: {
                    driver: (process.env.STORAGE_DRIVER?.trim() as 'file' | 'redis-json') || STORAGE_CONFIG.driver,
                    file: {
                        deploymentPath: STORAGE_CONFIG.file.deploymentPath,
                        walletStatePath: STORAGE_CONFIG.file.walletStatePath,
                        txHistoryPath: STORAGE_CONFIG.file.txHistoryPath,
                    },
                    redis: {
                        url: STORAGE_CONFIG.redis.url,
                        keyPrefix: STORAGE_CONFIG.redis.keyPrefix,
                        hasPassword: Boolean(STORAGE_CONFIG.redis.password),
                        connectTimeoutMs: STORAGE_CONFIG.redis.connectTimeoutMs,
                    },
                },
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch config' },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, payload } = body;

        if (action === 'test_prover') {
            const url = payload?.url || MIDNIGHT_CONFIG.proofServer;
            const startTime = Date.now();
            try {
                const res = await fetch(url, {
                    method: 'GET',
                    signal: AbortSignal.timeout(4000),
                });
                const latencyMs = Date.now() - startTime;
                const isOnline = res.status === 200 || res.status === 404 || res.status === 405;
                return NextResponse.json({
                    success: true,
                    data: {
                        status: isOnline ? 'online' : 'error',
                        httpStatus: res.status,
                        latencyMs,
                        url,
                        message: isOnline
                            ? `Prover server reachable (${latencyMs}ms, HTTP ${res.status})`
                            : `Prover responded with HTTP ${res.status}`,
                    },
                });
            } catch (err: any) {
                return NextResponse.json({
                    success: true,
                    data: {
                        status: 'offline',
                        latencyMs: Date.now() - startTime,
                        url,
                        message: `Could not connect to prover at ${url}: ${err.message}`,
                    },
                });
            }
        }

        if (action === 'test_indexer') {
            const url = payload?.url || MIDNIGHT_CONFIG.indexer;
            const startTime = Date.now();
            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: '{ block { height } }' }),
                    signal: AbortSignal.timeout(6000),
                });
                const latencyMs = Date.now() - startTime;
                if (!res.ok) {
                    return NextResponse.json({
                        success: true,
                        data: {
                            status: 'error',
                            latencyMs,
                            url,
                            message: `Indexer returned HTTP ${res.status} ${res.statusText}`,
                        },
                    });
                }
                const data = await res.json();
                const height = data?.data?.block?.height;
                return NextResponse.json({
                    success: true,
                    data: {
                        status: height !== undefined ? 'online' : 'error',
                        blockHeight: height ?? null,
                        latencyMs,
                        url,
                        message:
                            height !== undefined
                                ? `Indexer online! Current block #${Number(height).toLocaleString()} (${latencyMs}ms)`
                                : 'GraphQL query succeeded but block height was not returned',
                    },
                });
            } catch (err: any) {
                return NextResponse.json({
                    success: true,
                    data: {
                        status: 'offline',
                        latencyMs: Date.now() - startTime,
                        url,
                        message: `Failed to query indexer at ${url}: ${err.message}`,
                    },
                });
            }
        }

        if (action === 'test_redis') {
            const startTime = Date.now();
            try {
                const client = await getRedisClient();
                const pingResult = await client.ping();
                const latencyMs = Date.now() - startTime;
                const info = await client.info('server').catch(() => '');
                return NextResponse.json({
                    success: true,
                    data: {
                        status: pingResult === 'PONG' ? 'online' : 'error',
                        latencyMs,
                        url: STORAGE_CONFIG.redis.url,
                        message: `Redis responded PONG in ${latencyMs}ms`,
                    },
                });
            } catch (err: any) {
                return NextResponse.json({
                    success: true,
                    data: {
                        status: 'offline',
                        latencyMs: Date.now() - startTime,
                        url: STORAGE_CONFIG.redis.url,
                        message: `Redis connection failed: ${err.message}`,
                    },
                });
            }
        }

        if (action === 'test_files') {
            const files = [
                STORAGE_CONFIG.file.deploymentPath,
                STORAGE_CONFIG.file.walletStatePath,
                STORAGE_CONFIG.file.txHistoryPath,
            ];
            const fileStatuses = files.map((file) => {
                const resolved = path.resolve(process.cwd(), file);
                const exists = fs.existsSync(resolved);
                let sizeBytes = 0;
                if (exists) {
                    try {
                        sizeBytes = fs.statSync(resolved).size;
                    } catch {}
                }
                return {
                    path: file,
                    resolvedPath: resolved,
                    exists,
                    sizeBytes,
                };
            });
            return NextResponse.json({
                success: true,
                data: {
                    status: 'online',
                    files: fileStatuses,
                    message: 'File persistence storage inspected successfully',
                },
            });
        }

        if (action === 'test_all') {
            // Run all test actions concurrently
            const [proverRes, indexerRes, redisRes, filesRes] = await Promise.allSettled([
                fetch(`${req.nextUrl.origin}/api/system/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'test_prover' }),
                }).then((r) => r.json()),
                fetch(`${req.nextUrl.origin}/api/system/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'test_indexer' }),
                }).then((r) => r.json()),
                fetch(`${req.nextUrl.origin}/api/system/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'test_redis' }),
                }).then((r) => r.json()),
                fetch(`${req.nextUrl.origin}/api/system/config`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'test_files' }),
                }).then((r) => r.json()),
            ]);

            return NextResponse.json({
                success: true,
                data: {
                    prover: proverRes.status === 'fulfilled' ? proverRes.value?.data : { status: 'offline' },
                    indexer: indexerRes.status === 'fulfilled' ? indexerRes.value?.data : { status: 'offline' },
                    redis: redisRes.status === 'fulfilled' ? redisRes.value?.data : { status: 'offline' },
                    files: filesRes.status === 'fulfilled' ? filesRes.value?.data : { status: 'offline' },
                },
            });
        }

        return NextResponse.json(
            { success: false, error: `Unknown action: ${action}` },
            { status: 400 }
        );
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Config action failed' },
            { status: 500 }
        );
    }
}
