/**
 * Persistent File Wallet State Storage
 * Persists serialized Shielded and DUST wallet state to disk in wallet-serialized-state.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IWalletStateStorage, SerializedWalletState } from '@/src/domain/ports/i-wallet-state.storage';

export class FileWalletStateStorage implements IWalletStateStorage {
    private readonly filePath: string;

    constructor(filePath?: string) {
        this.filePath = filePath || path.resolve(process.cwd(), 'wallet-serialized-state.json');
    }

    private async readAll(): Promise<Record<string, SerializedWalletState>> {
        try {
            if (!fs.existsSync(this.filePath)) {
                return {};
            }
            const data = await fs.promises.readFile(this.filePath, 'utf-8');
            const parsed = JSON.parse(data);
            return typeof parsed === 'object' && parsed !== null ? parsed : {};
        } catch (e) {
            console.warn('Failed to read wallet-serialized-state.json:', e);
            return {};
        }
    }

    async loadState(walletId: string): Promise<SerializedWalletState | null> {
        const all = await this.readAll();
        return all[walletId] || null;
    }

    async saveState(walletId: string, state: SerializedWalletState): Promise<void> {
        try {
            const all = await this.readAll();
            all[walletId] = state;
            await fs.promises.writeFile(this.filePath, JSON.stringify(all, null, 2), 'utf-8');
        } catch (e) {
            console.warn('Failed to save wallet serialized state:', e);
        }
    }

    async clearState(walletId: string): Promise<void> {
        try {
            const all = await this.readAll();
            delete all[walletId];
            await fs.promises.writeFile(this.filePath, JSON.stringify(all, null, 2), 'utf-8');
        } catch (e) {
            console.warn('Failed to clear wallet serialized state:', e);
        }
    }
}
