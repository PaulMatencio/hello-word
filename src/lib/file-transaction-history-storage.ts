import * as fs from 'node:fs';
import * as path from 'node:path';
import type { TxRecord } from '@/src/types/tx';

/**
 * Simple file‑based TransactionHistoryStorage.
 * Stores an array of TxRecord objects in a JSON file located at the project root.
 */
export class FileTransactionHistoryStorage {
  private readonly filePath: string;

  constructor() {
    // Resolve relative to the project root (process.cwd())
    this.filePath = path.resolve(process.cwd(), 'tx-history.json');
    // Ensure the file exists with an empty array if missing
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  /** Store a new transaction hash as a minimal TxRecord */
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

  /** Store a full TxRecord */
  async storeTxRecord(record: TxRecord): Promise<void> {
    const records = await this.getTxRecords();
    if (!records.find((r) => r.txHash === record.txHash)) {
      records.unshift(record);
      await fs.promises.writeFile(this.filePath, JSON.stringify(records, null, 2));
    }
  }

  /** Retrieve all stored TxRecord objects */
  async getTxRecords(): Promise<TxRecord[]> {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  /** Clear the transaction history file */
  async clear(): Promise<void> {
    await fs.promises.writeFile(this.filePath, JSON.stringify([], null, 2));
  }
}
