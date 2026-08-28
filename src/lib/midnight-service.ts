/**
 * Midnight Service Facade
 * Provides backward-compatible entrypoints delegating directly to Clean Architecture Use Cases.
 */

import { container } from '@/src/infrastructure/di/container';
import { createProviders as createProvidersInternal } from '@/src/infrastructure/midnight/midnight-providers.factory';

export const CONFIG = {
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    nodeRpc: 'https://rpc.preprod.midnight.network',
    proofServer: 'http://127.0.0.1:6300',
    networkId: 'preprod' as const,
    faucet: 'https://faucet.preprod.midnight.network',
};

export async function getOrCreateWallet(seed: string) {
    return container.walletGateway.getOrCreateWalletContext(seed);
}

export async function getContractArtifacts() {
    return (container.contractGateway as any).getContractArtifacts();
}

export async function createProviders(walletCtx: any) {
    return createProvidersInternal(walletCtx);
}

export function getDefaultDeployment() {
    return container.deploymentStorage.getDeployment();
}

export function saveDeployment(contractAddress: string, seed: string) {
    container.deploymentStorage.saveDeployment({
        contractAddress,
        deployerSeed: seed,
        deployedAt: new Date().toISOString(),
    });
}

export async function getWalletStatus(seed: string) {
    return container.getWalletStatusUseCase.execute({ seed });
}

export async function registerForDust(seed: string) {
    return container.registerDustUseCase.execute({ seed });
}

export async function storeContractMessage(seed: string, message: string, contractAddress?: string) {
    return container.storeMessageUseCase.execute({ seed, message, contractAddress });
}

export async function deployNewContract(seed: string) {
    return container.deployContractUseCase.execute({ seed });
}

export async function getContractState(contractAddress?: string) {
    return container.getContractStateUseCase.execute({ contractAddress });
}

export async function sendUnshieldedTNight(seed: string, receiver: string, amount: string) {
    return container.sendUnshieldedTNightUseCase.execute({ seed, receiver, amount });
}

export async function getSystemHealth() {
    return container.getSystemHealthUseCase.execute();
}

export async function deriveKeys(seed: string) {
    return container.deriveKeysUseCase.execute({ seed });
}

export async function deriveUnshieldedAddressFromSeed(seed: string, _network?: string) {
    const result = await container.deriveKeysUseCase.execute({ seed });
    return result.unshieldedAddress;
}