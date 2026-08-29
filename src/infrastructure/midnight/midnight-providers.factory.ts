import * as path from 'node:path';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { FilePrivateStateProvider } from '@/src/lib/file-private-state-provider';
import { MIDNIGHT_CONFIG } from '../config/midnight.config';

// Ensure WebSocket is globally available for GraphQL subscriptions
if (typeof (globalThis as any).WebSocket === 'undefined') {
    (globalThis as any).WebSocket = WebSocket;
}

export interface ProviderOptions {
    privateStatePassword?: string;
    zkConfigPath?: string;
}

export function createProviders(walletCtx: any, options?: ProviderOptions) {
    const projectRoot = process.cwd();
    const zkConfigPath = options?.zkConfigPath || path.resolve(projectRoot, 'contracts', 'managed', 'hello-world');
    const password = options?.privateStatePassword?.trim() || MIDNIGHT_CONFIG.privateStatePassword;

    const walletProvider = {
        getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
        getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
        async balanceTx(tx: any, ttl?: Date) {
            const preState: any = await Rx.firstValueFrom(walletCtx.wallet.state()).catch(() => null);
            const preDust = BigInt(preState?.dust?.balance?.(new Date()) ?? 0);

            const recipe = await walletCtx.wallet.balanceUnboundTransaction(
                tx,
                { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
                { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
            );
            const finalized = await walletCtx.wallet.finalizeRecipe(recipe);

            try {
                const fee = await walletCtx.wallet.calculateTransactionFee(finalized);
                if (fee && typeof fee === 'bigint' && fee > 0n) {
                    walletCtx.lastDustFee = fee;
                }
            } catch {
                try {
                    const postState: any = await Rx.firstValueFrom(walletCtx.wallet.state()).catch(() => null);
                    const postDust = BigInt(postState?.dust?.balance?.(new Date()) ?? 0);
                    if (preDust > postDust) {
                        walletCtx.lastDustFee = preDust - postDust;
                    }
                } catch {
                    // Fallback
                }
            }

            return finalized;
        },
        submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
    };

    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

    // Persistent file-based private state provider
    const privateStateProvider = new FilePrivateStateProvider({
        accountId,
        privateStoragePasswordProvider: () => password,
    });

    return {
        privateStateProvider,
        publicDataProvider: indexerPublicDataProvider(MIDNIGHT_CONFIG.indexer, MIDNIGHT_CONFIG.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(MIDNIGHT_CONFIG.proofServer, zkConfigProvider),
        walletProvider,
        midnightProvider: walletProvider,
    };
}
