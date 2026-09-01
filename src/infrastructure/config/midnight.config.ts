/**
 * Midnight Preprod Environment Configuration
 */

export const MIDNIGHT_CONFIG = {
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    nodeRpc: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    networkId: 'preprod' as const,
    faucet: 'https://faucet.preprod.midnight.network',
    explorer: process.env.NEXT_PUBLIC_EXPLORER_URL || 'https://explorer.1am.xyz',
    privateStatePassword: process.env.PRIVATE_STATE_PASSWORD?.trim() || '',
};

