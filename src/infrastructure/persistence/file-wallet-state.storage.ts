/**
 * Persistent File Wallet State Storage
 * Persists serialized Shielded and DUST wallet state to disk atomically in wallet-serialized-state.json
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import type { IWalletStateStorage, SerializedWalletState } from '@/src/domain/ports/i-wallet-state.storage';

export class FileWalletStateStorage implements IWalletStateStorage {
    private readonly filePath: string;
    private writeLock: Promise<void> = Promise.resolve();

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
        } catch {
            return {};
        }
    }

    async loadState(walletId: string): Promise<SerializedWalletState | null> {
        const all = await this.readAll();
        return all[walletId] || null;
    }

    async saveState(walletId: string, state: SerializedWalletState): Promise<void> {
        this.writeLock = this.writeLock.then(async () => {
            try {
                const all = await this.readAll();
                all[walletId] = state;
                const tempPath = `${this.filePath}.tmp.${Date.now()}`;
                await fs.promises.writeFile(tempPath, JSON.stringify(all, null, 2), 'utf-8');
                await fs.promises.rename(tempPath, this.filePath);
            } catch (e) {
                console.warn('Failed to atomically save wallet serialized state:', e);
            }
        });
        return this.writeLock;
    }

    async clearState(walletId: string): Promise<void> {
        this.writeLock = this.writeLock.then(async () => {
            try {
                const all = await this.readAll();
                delete all[walletId];
                const tempPath = `${this.filePath}.tmp.${Date.now()}`;
                await fs.promises.writeFile(tempPath, JSON.stringify(all, null, 2), 'utf-8');
                await fs.promises.rename(tempPath, this.filePath);
            } catch (e) {
                console.warn('Failed to atomically clear wallet serialized state:', e);
            }
        });
        return this.writeLock;
    }
}
