/**
 * Storage Infrastructure Configuration
 * Governs the active persistence driver (file vs redis-json) and connection parameters.
 */

export type StorageDriver = 'file' | 'redis-json';

export interface StorageConfig {
    driver: StorageDriver;
    file: {
        deploymentPath: string;
        walletStatePath: string;
        txHistoryPath: string;
    };
    redis: {
        url: string;
        password?: string;
        keyPrefix: string;
        connectTimeoutMs: number;
    };
}

export const STORAGE_CONFIG: StorageConfig = {
    // Active persistence driver: 'file' | 'redis-json'
    driver: (process.env.STORAGE_DRIVER?.trim() as StorageDriver) || 'file',

    file: {
        deploymentPath: process.env.DEPLOYMENT_FILE_PATH?.trim() || 'deployment.json',
        walletStatePath: process.env.WALLET_STATE_FILE_PATH?.trim() || 'wallet-serialized-state.json',
        txHistoryPath: process.env.TX_HISTORY_FILE_PATH?.trim() || 'tx-history.json',
    },

    redis: {
        url: process.env.REDIS_URL?.trim() || 'redis://127.0.0.1:6379',
        password: process.env.REDIS_PASSWORD?.trim() || undefined,
        keyPrefix: process.env.REDIS_KEY_PREFIX?.trim() || 'midnight:',
        connectTimeoutMs: 5000,
    },
};
