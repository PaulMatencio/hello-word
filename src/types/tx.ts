export interface TxRecord {
  id: string;
  txHash: string;
  blockHeight: number | null;
  message: string;
  timestamp: string;
  dustPaid?: string;
  durationMs?: number;
  error?: string;
  contractAddress?: string;
  contractNickname?: string;
  contractType?: string;
  circuitName?: string;
  txType?: 'contract_call' | 'contract_deploy' | 'token_transfer';
}
