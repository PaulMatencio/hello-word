/**
 * Midnight Network Service Layer
 * Encapsulates wallet management, ZK proof generation, and smart contract interactions.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import * as Rx from 'rxjs';

// Midnight SDK imports
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider';
import { NodeZkConfigProvider } from '@midnight-ntwrk/midnight-js-node-zk-config-provider';
import { setNetworkId, getNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import * as ledger from '@midnight-ntwrk/midnight-js-protocol/ledger';
import { unshieldedToken } from '@midnight-ntwrk/midnight-js-protocol/ledger';
import {
    WalletFacade,
    DustWallet,
    HDWallet,
    Roles,
    ShieldedWallet,
    UnshieldedWallet,
    createKeystore,
    NoOpTransactionHistoryStorage,
    PublicKey,
} from '@midnight-ntwrk/wallet-sdk';

// Polyfill WebSocket for Midnight GraphQL subscriptions in Node.js
if (typeof globalThis.WebSocket === 'undefined' || !(globalThis as any)._wsPolyfilled) {
    // @ts-expect-error WebSocket assignment
    globalThis.WebSocket = WebSocket;
    (globalThis as any)._wsPolyfilled = true;
}

// Set network to preprod
setNetworkId('preprod');

export const CONFIG = {
    indexer: 'https://indexer.preprod.midnight.network/api/v4/graphql',
    indexerWS: 'wss://indexer.preprod.midnight.network/api/v4/graphql/ws',
    node: 'https://rpc.preprod.midnight.network',
    proofServer: process.env.PROOF_SERVER_URL || 'http://127.0.0.1:6300',
    faucet: 'https://midnight-tmnight-preprod.nethermind.dev/',
};

const PRIVATE_STATE_PASSWORD = process.env.PRIVATE_STATE_PASSWORD?.trim() || 'Hello-World-Lesson-Password-1';

// Resolve project root & contract paths
const projectRoot = process.cwd();
const zkConfigPath = path.resolve(projectRoot, 'contracts', 'managed', 'hello-world');

// @ts-ignore
import * as HelloWorldContractModule from '../../contracts/managed/hello-world/contract/index.js';

let compiledContractCache: any = null;

async function getContractArtifacts() {
    if (!compiledContractCache) {
        compiledContractCache = CompiledContract.make('hello-world', (HelloWorldContractModule as any).Contract).pipe(
            CompiledContract.withVacantWitnesses,
            CompiledContract.withCompiledFileAssets(zkConfigPath),
        );
    }
    return {
        compiledContract: compiledContractCache,
        HelloWorld: HelloWorldContractModule,
    };
}

// Wallet cache to avoid re-syncing from scratch on every request
interface CachedWalletContext {
    wallet: any;
    shieldedSecretKeys: any;
    dustSecretKey: any;
    unshieldedKeystore: any;
    seed: string;
    lastActive: number;
}

const walletCache = new Map<string, CachedWalletContext>();

export function deriveKeys(seed: string) {
    const cleanSeed = seed.trim();
    if (!/^[0-9a-fA-F]{64}$/.test(cleanSeed)) {
        throw new Error('Seed must be a valid 64-character hexadecimal string.');
    }
    const hdWallet = HDWallet.fromSeed(Buffer.from(cleanSeed, 'hex'));
    if (hdWallet.type !== 'seedOk') throw new Error('Invalid seed format or entropy');
    const result = hdWallet.hdWallet.selectAccount(0).selectRoles([Roles.Zswap, Roles.NightExternal, Roles.Dust]).deriveKeysAt(0);
    if (result.type !== 'keysDerived') throw new Error('Key derivation failed');
    hdWallet.hdWallet.clear();
    return result.keys;
}

export async function getOrCreateWallet(seed: string): Promise<CachedWalletContext> {
    const cleanSeed = seed.trim();
    const existing = walletCache.get(cleanSeed);
    if (existing) {
        existing.lastActive = Date.now();
        return existing;
    }

    const keys = deriveKeys(cleanSeed);
    const networkId = getNetworkId();
    const shieldedSecretKeys = ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);
    const dustSecretKey = ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);
    const unshieldedKeystore = createKeystore(keys[Roles.NightExternal], networkId);

    const walletConfig = {
        networkId,
        indexerClientConnection: { indexerHttpUrl: CONFIG.indexer, indexerWsUrl: CONFIG.indexerWS },
        provingServerUrl: new URL(CONFIG.proofServer),
        relayURL: new URL(CONFIG.node.replace(/^http/, 'ws')),
        txHistoryStorage: new NoOpTransactionHistoryStorage(),
        costParameters: { additionalFeeOverhead: 300_000_000_000_000n, feeBlocksMargin: 5 },
    };

    const wallet = await WalletFacade.init({
        configuration: walletConfig,
        shielded: (cfg: any) => ShieldedWallet(cfg).startWithSecretKeys(shieldedSecretKeys),
        unshielded: (cfg: any) => UnshieldedWallet(cfg).startWithPublicKey(PublicKey.fromKeyStore(unshieldedKeystore)),
        dust: (cfg: any) => DustWallet(cfg).startWithSecretKey(dustSecretKey, ledger.LedgerParameters.initialParameters().dust),
    });

    await wallet.start(shieldedSecretKeys, dustSecretKey);

    const ctx: CachedWalletContext = {
        wallet,
        shieldedSecretKeys,
        dustSecretKey,
        unshieldedKeystore,
        seed: cleanSeed,
        lastActive: Date.now(),
    };

    walletCache.set(cleanSeed, ctx);
    return ctx;
}

export async function createProviders(walletCtx: CachedWalletContext) {
    const walletProvider = {
        getCoinPublicKey: () => walletCtx.shieldedSecretKeys.coinPublicKey,
        getEncryptionPublicKey: () => walletCtx.shieldedSecretKeys.encryptionPublicKey,
        async balanceTx(tx: any, ttl?: Date) {
            const recipe = await walletCtx.wallet.balanceUnboundTransaction(
                tx,
                { shieldedSecretKeys: walletCtx.shieldedSecretKeys, dustSecretKey: walletCtx.dustSecretKey },
                { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) },
            );
            return walletCtx.wallet.finalizeRecipe(recipe);
        },
        submitTx: (tx: any) => walletCtx.wallet.submitTransaction(tx) as any,
    };

    const zkConfigProvider = new NodeZkConfigProvider(zkConfigPath);
    const accountId = walletCtx.unshieldedKeystore.getBech32Address().toString();

    return {
        privateStateProvider: levelPrivateStateProvider({
            privateStateStoreName: 'hello-world-state',
            accountId,
            privateStoragePasswordProvider: () => PRIVATE_STATE_PASSWORD,
        }),
        publicDataProvider: indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS),
        zkConfigProvider,
        proofProvider: httpClientProofProvider(CONFIG.proofServer, zkConfigProvider),
        walletProvider,
        midnightProvider: walletProvider,
    };
}

export function getDefaultDeployment() {
    const deploymentPath = path.resolve(projectRoot, 'deployment.json');
    if (fs.existsSync(deploymentPath)) {
        try {
            return JSON.parse(fs.readFileSync(deploymentPath, 'utf-8'));
        } catch {
            return null;
        }
    }
    return null;
}

export function saveDeployment(contractAddress: string, seed: string) {
    const deploymentPath = path.resolve(projectRoot, 'deployment.json');
    const deploymentInfo = {
        contractAddress,
        seed,
        network: 'preprod',
        deployedAt: new Date().toISOString(),
    };
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    return deploymentInfo;
}

/**
 * Reads public on-chain message state directly from Indexer
 */
export async function getContractState(contractAddress?: string) {
    const targetAddress = contractAddress || getDefaultDeployment()?.contractAddress;
    if (!targetAddress) {
        throw new Error('No contract address specified and no deployment.json found.');
    }

    const { HelloWorld } = await getContractArtifacts();
    const publicDataProvider = indexerPublicDataProvider(CONFIG.indexer, CONFIG.indexerWS);
    const state = await publicDataProvider.queryContractState(targetAddress);

    if (!state) {
        return {
            contractAddress: targetAddress,
            found: false,
            message: '',
            raw: null,
            lastChecked: new Date().toISOString(),
        };
    }

    const ledgerState = HelloWorld.ledger(state.data);
    return {
        contractAddress: targetAddress,
        found: true,
        message: ledgerState.message || '',
        raw: state,
        lastChecked: new Date().toISOString(),
    };
}

/**
 * Gets wallet details: Bech32 address, tNIGHT balance, DUST balance, and sync state
 */
export async function getWalletStatus(seed: string) {
    const walletCtx = await getOrCreateWallet(seed);
    const address = walletCtx.unshieldedKeystore.getBech32Address().toString();

    // Fast status check from current observable state
    const state = await Rx.firstValueFrom(
        walletCtx.wallet.state().pipe(
            Rx.timeout({ each: 10000, with: () => walletCtx.wallet.state() }),
        )
    ).catch(() => null);

    const isSynced = (state as any)?.isSynced ?? false;
    const tNightBalance = state ? ((state as any).unshielded.balances[unshieldedToken().raw] ?? 0n).toString() : '0';
    const dustBalance = state ? (state as any).dust.balance(new Date()).toString() : '0';

    return {
        address,
        isSynced,
        tNightBalance,
        dustBalance,
        network: 'preprod',
        faucetUrl: CONFIG.faucet,
    };
}

/**
 * Waits for wallet to sync and registers NIGHT UTXOs for DUST generation
 */
export async function registerForDust(seed: string) {
    const walletCtx = await getOrCreateWallet(seed);
    await walletCtx.wallet.waitForSyncedState();

    const dustState: any = await Rx.firstValueFrom(walletCtx.wallet.state().pipe(Rx.filter((s: any) => s.isSynced)));
    const currentDust = dustState.dust.balance(new Date());

    if (currentDust > 0n) {
        return {
            success: true,
            alreadyRegistered: true,
            dustBalance: currentDust.toString(),
            message: 'DUST is already active and available for transactions.',
        };
    }

    const nightUtxos = dustState.unshielded.availableCoins.filter((c: any) => !c.meta?.registeredForDustGeneration);
    if (nightUtxos.length === 0) {
        throw new Error('No unshielded tNIGHT UTXOs available to register. Please request funds from the Nethermind faucet first.');
    }

    const recipe = await walletCtx.wallet.registerNightUtxosForDustGeneration(
        nightUtxos,
        walletCtx.unshieldedKeystore.getPublicKey(),
        (payload: any) => walletCtx.unshieldedKeystore.signData(payload),
    );
    const finalized = await walletCtx.wallet.finalizeRecipe(recipe);
    await walletCtx.wallet.submitTransaction(finalized);

    return {
        success: true,
        alreadyRegistered: false,
        message: 'Successfully registered tNIGHT coins for DUST generation. DUST balance will begin accruing.',
    };
}

/**
 * Stores a message to the deployed Hello World contract
 */
export async function storeContractMessage(seed: string, message: string, contractAddress?: string) {
    if (!message || message.trim().length === 0) {
        throw new Error('Message cannot be empty.');
    }

    const targetAddress = contractAddress || getDefaultDeployment()?.contractAddress;
    if (!targetAddress) {
        throw new Error('No contract address specified and no deployment.json found.');
    }

    const { compiledContract } = await getContractArtifacts();
    const walletCtx = await getOrCreateWallet(seed);

    // Ensure wallet is synced
    await walletCtx.wallet.waitForSyncedState();

    const providers = await createProviders(walletCtx);

    const contract = await findDeployedContract(providers as any, {
        contractAddress: targetAddress,
        compiledContract: compiledContract as any,
        privateStateId: 'helloWorldState',
        initialPrivateState: {},
    });

    const startTime = Date.now();
    const tx = await (contract as any).callTx.storeMessage(message.trim());
    const durationMs = Date.now() - startTime;

    return {
        success: true,
        message: message.trim(),
        contractAddress: targetAddress,
        txHash: tx.public.txHash,
        blockHeight: tx.public.blockHeight,
        durationMs,
        timestamp: new Date().toISOString(),
    };
}

/**
 * Deploys a new Hello World contract instance on Midnight Preprod
 */
export async function deployNewContract(seed: string) {
    const { compiledContract } = await getContractArtifacts();
    const walletCtx = await getOrCreateWallet(seed);

    await walletCtx.wallet.waitForSyncedState();
    const providers = await createProviders(walletCtx);

    const startTime = Date.now();
    const deployed = await deployContract(providers as any, {
        compiledContract: compiledContract as any,
        args: [],
        privateStateId: 'helloWorldState',
        initialPrivateState: {},
    });

    const contractAddress = deployed.deployTxData.public.contractAddress;
    const durationMs = Date.now() - startTime;

    saveDeployment(contractAddress, seed);

    return {
        success: true,
        contractAddress,
        durationMs,
        network: 'preprod',
        deployedAt: new Date().toISOString(),
    };
}

/**
 * Checks system health: Proof Server, Indexer GraphQL, and Local Deployment
 */
export async function getSystemHealth() {
    let proofServerOk = false;
    let indexerOk = false;
    let currentBlockHeight: number | null = null;

    // Check Proof Server
    try {
        const proofRes = await fetch(CONFIG.proofServer, { method: 'GET', signal: AbortSignal.timeout(3000) }).catch(() => null);
        if (proofRes && (proofRes.status === 200 || proofRes.status === 404 || proofRes.status === 405)) {
            proofServerOk = true;
        }
    } catch {
        proofServerOk = false;
    }

    // Check Indexer GraphQL
    try {
        const indexerRes = await fetch(CONFIG.indexer, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: '{ block(offset: { height: 1 }) { height } }' }),
            signal: AbortSignal.timeout(5000),
        });
        if (indexerRes.ok) {
            const data = await indexerRes.json();
            if (data?.data?.block?.height) {
                indexerOk = true;
                currentBlockHeight = data.data.block.height;
            }
        }
    } catch {
        indexerOk = false;
    }

    const deployment = getDefaultDeployment();

    return {
        proofServer: {
            url: CONFIG.proofServer,
            status: proofServerOk ? 'online' : 'offline',
        },
        indexer: {
            url: CONFIG.indexer,
            status: indexerOk ? 'online' : 'offline',
            blockHeight: currentBlockHeight,
        },
        network: 'preprod',
        deployment,
        faucetUrl: CONFIG.faucet,
    };
}
