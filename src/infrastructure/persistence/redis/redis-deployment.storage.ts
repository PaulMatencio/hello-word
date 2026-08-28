/**
 * RedisJSON Deployment Storage Adapter
 * Persists and retrieves contract deployment records using Redis Stack JSON documents.
 */

import type { IDeploymentStorage } from '@/src/domain/ports/i-deployment.storage';
import type { ContractDeploymentRecord } from '@/src/domain/entities/contract.entity';
import { STORAGE_CONFIG } from '../../config/storage.config';
import { getRedisClient } from './redis-client.factory';

export class RedisDeploymentStorage implements IDeploymentStorage {
    private readonly key: string;

    constructor(customKey?: string) {
        this.key = customKey || `${STORAGE_CONFIG.redis.keyPrefix}deployment`;
    }

    async getDeployment(): Promise<ContractDeploymentRecord | null> {
        try {
            const client = await getRedisClient();
            const record = await client.json.get(this.key);
            if (!record || typeof record !== 'object') {
                return null;
            }
            return record as unknown as ContractDeploymentRecord;
        } catch (err) {
            console.error('[RedisDeploymentStorage] Failed to get deployment:', err);
            return null;
        }
    }

    async saveDeployment(record: ContractDeploymentRecord): Promise<void> {
        try {
            const client = await getRedisClient();
            await client.json.set(this.key, '$', record as any);
        } catch (err) {
            console.error('[RedisDeploymentStorage] Failed to save deployment:', err);
        }
    }
}
