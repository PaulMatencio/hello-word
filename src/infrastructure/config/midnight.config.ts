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
    privateStatePassword: 'hello-world-private-state-pwd',
};
