/**
 * RedisJSON Transaction History Storage Adapter
 * Persists and retrieves the list of TxRecord objects using Redis Stack JSON documents.
 */

import type { TxRecord } from '@/src/types/tx';
import { STORAGE_CONFIG } from '../../config/storage.config';
import { getRedisClient } from './redis-client.factory';

export class RedisTransactionHistoryStorage {
    private readonly key: string;

    constructor(customKey?: string) {
        this.key = customKey || `${STORAGE_CONFIG.redis.keyPrefix}tx-history`;
    }

    async storeTxHash(hash: string): Promise<void> {
        const minimal: TxRecord = {
            id: `persisted-${Date.now()}`,
            txHash: hash,
            blockHeight: null,
            message: '',
            timestamp: new Date().toISOString(),
        };
        await this.storeTxRecord(minimal);
    }

    async storeTxRecord(record: TxRecord): Promise<void> {
        try {
            const records = await this.getTxRecords();
            if (!records.find((r) => r.txHash === record.txHash)) {
                records.unshift(record);
                const client = await getRedisClient();
                await client.json.set(this.key, '$', records as any);
            }
        } catch (err) {
            console.error('[RedisTransactionHistoryStorage] Failed to store record:', err);
        }
    }

    async getTxRecords(): Promise<TxRecord[]> {
        try {
            const client = await getRedisClient();
            const data = await client.json.get(this.key);
            return Array.isArray(data) ? (data as unknown as TxRecord[]) : [];
        } catch (err) {
            console.error('[RedisTransactionHistoryStorage] Failed to get records:', err);
            return [];
        }
    }

    async clear(): Promise<void> {
        try {
            const client = await getRedisClient();
            await client.json.set(this.key, '$', [] as any);
        } catch (err) {
            console.error('[RedisTransactionHistoryStorage] Failed to clear records:', err);
        }
    }
}
