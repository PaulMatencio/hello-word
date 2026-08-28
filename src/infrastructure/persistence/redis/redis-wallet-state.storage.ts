/**
 * RedisJSON Wallet State Storage Adapter
 * Persists serialized Shielded and DUST wallet state to Redis Stack using native JSON documents.
 */

import type { IWalletStateStorage, SerializedWalletState } from '@/src/domain/ports/i-wallet-state.storage';
import { STORAGE_CONFIG } from '../../config/storage.config';
import { getRedisClient } from './redis-client.factory';

export class RedisWalletStateStorage implements IWalletStateStorage {
    private readonly keyPrefix: string;

    constructor(customKeyPrefix?: string) {
        this.keyPrefix = customKeyPrefix || `${STORAGE_CONFIG.redis.keyPrefix}wallet:state:`;
    }

    private getKey(walletId: string): string {
        return `${this.keyPrefix}${walletId}`;
    }

    async loadState(walletId: string): Promise<SerializedWalletState | null> {
        try {
            const client = await getRedisClient();
            const record = await client.json.get(this.getKey(walletId));
            if (!record || typeof record !== 'object') {
                return null;
            }
            return record as unknown as SerializedWalletState;
        } catch (err) {
            console.error(`[RedisWalletStateStorage] Failed to load state for ${walletId}:`, err);
            return null;
        }
    }

    async saveState(walletId: string, state: SerializedWalletState): Promise<void> {
        try {
            const client = await getRedisClient();
            await client.json.set(this.getKey(walletId), '$', state as any);
        } catch (err) {
            console.error(`[RedisWalletStateStorage] Failed to save state for ${walletId}:`, err);
        }
    }

    async clearState(walletId: string): Promise<void> {
        try {
            const client = await getRedisClient();
            await client.del(this.getKey(walletId));
        } catch (err) {
            console.error(`[RedisWalletStateStorage] Failed to clear state for ${walletId}:`, err);
        }
    }
}
