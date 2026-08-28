/**
 * Domain Entities: Wallet & Keys
 */

export interface SubwalletSyncProgress {
    applied: string;
    highest: string;
    percentage: number;
}

export interface SyncProgressInfo {
    isSynced: boolean;
    percentage?: number;
    highestBlock?: number;
    currentBlock?: number;
    appliedId?: string;
    highestTransactionId?: string;
    isConnected?: boolean;
    unshielded?: SubwalletSyncProgress;
    shielded?: SubwalletSyncProgress;
    dust?: SubwalletSyncProgress;
}

export interface WalletSnapshot {
    isSynced: boolean;
    syncProgress?: SyncProgressInfo;
    tNightBalance: string;
    tNightDisplay: string;
    dustBalance: string;
    unshieldedAddress: string;
    coinPublicKey: string;
    encryptionPublicKey: string;
    lastDustFee?: string;
}

export interface KeyDerivationResult {
    seed: string;
    unshieldedAddress: string;
    coinPublicKey: string;
    encryptionPublicKey: string;
}

export interface UnshieldedTransferRequest {
    seed: string;
    receiver: string;
    amount: string;
}

export interface TransferExecutionReceipt {
    txHash: string;
    dustPaid: string;
    amount: string;
    amountUnits: string;
    receiver: string;
    durationMs: number;
    network: string;
    timestamp: string;
}
