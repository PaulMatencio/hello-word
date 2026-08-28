/**
 * Port: IWalletStateStorage
 * Defines the contract for persisting and restoring serialized subwallet state (Shielded & DUST).
 */

export interface SerializedWalletState {
    shielded?: string;
    dust?: string;
    updatedAt: string;
}

export interface IWalletStateStorage {
    loadState(walletId: string): Promise<SerializedWalletState | null>;
    saveState(walletId: string, state: SerializedWalletState): Promise<void>;
    clearState(walletId: string): Promise<void>;
}
