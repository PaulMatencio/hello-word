export interface TxRecord {
  id: string;
  txHash: string;
  blockHeight: number | null;
  message: string;
  timestamp: string;
  dustPaid?: string;
  durationMs?: number;
  error?: string;
}
