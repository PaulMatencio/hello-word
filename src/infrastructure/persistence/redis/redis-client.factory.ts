/**
 * Redis Client Singleton Factory
 * Manages resilient connection lifecycle to Redis Stack for JSON & KV operations.
 */

import { createClient, type RedisClientType } from 'redis';
import { STORAGE_CONFIG } from '../../config/storage.config';

let clientInstance: RedisClientType | null = null;
let connectingPromise: Promise<RedisClientType> | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
    if (clientInstance && clientInstance.isOpen) {
        return clientInstance;
    }

    if (connectingPromise) {
        return connectingPromise;
    }

    connectingPromise = (async () => {
        const client = createClient({
            url: STORAGE_CONFIG.redis.url,
            password: STORAGE_CONFIG.redis.password,
            socket: {
                connectTimeout: STORAGE_CONFIG.redis.connectTimeoutMs,
                reconnectStrategy: (retries: number) => {
                    if (retries > 5) {
                        console.warn(`[Redis] Exceeded max connection retries (${retries}).`);
                        return new Error('Redis connection failed');
                    }
                    return Math.min(retries * 500, 3000);
                },
            },
        }) as RedisClientType;

        client.on('error', (err) => {
            console.error('[Redis Client Error]:', err.message || err);
        });

        client.on('connect', () => {
            console.log(`[Redis] Connected to ${STORAGE_CONFIG.redis.url}`);
        });

        await client.connect();
        clientInstance = client;
        connectingPromise = null;
        return client;
    })().catch((err) => {
        connectingPromise = null;
        console.error('[Redis] Failed to connect:', err.message || err);
        throw err;
    });

    return connectingPromise;
}

export async function closeRedisClient(): Promise<void> {
    if (clientInstance && clientInstance.isOpen) {
        await clientInstance.quit();
        clientInstance = null;
    }
}
