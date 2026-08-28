import * as fs from 'node:fs';
import * as path from 'node:path';

interface StoredData {
  states: Record<string, Record<string, any>>; // [contractAddress][stateId] => state
  signingKeys: Record<string, any>; // [contractAddress] => signingKey
}

/**
 * File-based Persistent PrivateStateProvider.
 * Implements the Midnight PrivateStateProvider interface and persists
 * contract private states and signing keys across restarts to a local JSON file.
 * 
 * Works seamlessly in Next.js without LevelDB C++ native build or file-lock conflicts.
 */
export class FilePrivateStateProvider {
  private readonly filePath: string;
  private currentContractAddress: string | null = null;
  private cache: StoredData = { states: {}, signingKeys: {} };

  constructor(options?: {
    filePath?: string;
    accountId?: string;
    privateStoragePasswordProvider?: () => string;
  }) {
    const projectRoot = process.cwd();
    this.filePath = options?.filePath || path.resolve(projectRoot, 'private-state-store.json');
    this.loadFromDisk();
  }

  private loadFromDisk(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        this.cache = {
          states: parsed.states || {},
          signingKeys: parsed.signingKeys || {},
        };
      } else {
        this.saveToDisk();
      }
    } catch {
      this.cache = { states: {}, signingKeys: {} };
    }
  }

  private saveToDisk(): void {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.cache, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to persist private state to disk:', err);
    }
  }

  setContractAddress(address: string): void {
    this.currentContractAddress = address;
  }

  async get(privateStateId: string): Promise<any | null> {
    if (!this.currentContractAddress) {
      throw new Error('Contract address not set. Call setContractAddress() before accessing private state.');
    }
    const contractStates = this.cache.states[this.currentContractAddress];
    if (!contractStates || contractStates[privateStateId] === undefined) {
      return null;
    }
    return contractStates[privateStateId];
  }

  async set(privateStateId: string, state: any): Promise<void> {
    if (!this.currentContractAddress) {
      throw new Error('Contract address not set. Call setContractAddress() before setting private state.');
    }
    if (!this.cache.states[this.currentContractAddress]) {
      this.cache.states[this.currentContractAddress] = {};
    }
    this.cache.states[this.currentContractAddress][privateStateId] = state;
    this.saveToDisk();
  }

  async remove(privateStateId: string): Promise<void> {
    if (!this.currentContractAddress) {
      throw new Error('Contract address not set. Call setContractAddress() before removing private state.');
    }
    if (this.cache.states[this.currentContractAddress]) {
      delete this.cache.states[this.currentContractAddress][privateStateId];
      this.saveToDisk();
    }
  }

  async clear(): Promise<void> {
    if (!this.currentContractAddress) {
      throw new Error('Contract address not set. Call setContractAddress() before clearing private state.');
    }
    delete this.cache.states[this.currentContractAddress];
    this.saveToDisk();
  }

  async setSigningKey(address: string, signingKey: any): Promise<void> {
    this.cache.signingKeys[address] = signingKey;
    this.saveToDisk();
  }

  async getSigningKey(address: string): Promise<any | null> {
    return this.cache.signingKeys[address] ?? null;
  }

  async removeSigningKey(address: string): Promise<void> {
    delete this.cache.signingKeys[address];
    this.saveToDisk();
  }

  async clearSigningKeys(): Promise<void> {
    this.cache.signingKeys = {};
    this.saveToDisk();
  }
}
