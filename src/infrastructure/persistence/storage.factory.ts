/**
 * Storage Services Factory
 * Resolves the active persistence implementations based on STORAGE_CONFIG.driver.
 */

import type { IDeploymentStorage } from '@/src/domain/ports/i-deployment.storage';
import type { IWalletStateStorage } from '@/src/domain/ports/i-wallet-state.storage';
import { STORAGE_CONFIG } from '../config/storage.config';

import { FileDeploymentStorage } from './file-deployment.storage';
import { FileWalletStateStorage } from './file-wallet-state.storage';
import { FileTransactionHistoryStorage } from '@/src/lib/file-transaction-history-storage';

import { RedisDeploymentStorage } from './redis/redis-deployment.storage';
import { RedisWalletStateStorage } from './redis/redis-wallet-state.storage';
import { RedisTransactionHistoryStorage } from './redis/redis-tx-history.storage';

export interface StorageServices {
    deploymentStorage: IDeploymentStorage;
    walletStateStorage: IWalletStateStorage;
    txHistoryStorage: FileTransactionHistoryStorage | RedisTransactionHistoryStorage;
    activeDriver: string;
}

export function createStorageServices(): StorageServices {
    const isRedis = STORAGE_CONFIG.driver === 'redis-json';

    if (isRedis) {
        console.log(`[Storage Factory] Initializing RedisJSON persistence (${STORAGE_CONFIG.redis.url})`);
        return {
            deploymentStorage: new RedisDeploymentStorage(),
            walletStateStorage: new RedisWalletStateStorage(),
            txHistoryStorage: new RedisTransactionHistoryStorage(),
            activeDriver: 'redis-json',
        };
    }

    return {
        deploymentStorage: new FileDeploymentStorage(STORAGE_CONFIG.file.deploymentPath),
        walletStateStorage: new FileWalletStateStorage(STORAGE_CONFIG.file.walletStatePath),
        txHistoryStorage: new FileTransactionHistoryStorage(),
        activeDriver: 'file',
    };
}
