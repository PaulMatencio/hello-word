/**
 * Midnight Network Service Layer
 * Encapsulates wallet management, ZK proof generation, and smart contract interactions.
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { WebSocket } from 'ws';
import { FileTransactionHistoryStorage } from './file-transaction-history-storage';
import * as Rx from 'rxjs';

// Midnight SDK imports
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
// import { levelPrivateStateProvider } from '@midnight-ntwrk/midnight-js-level-private-state-provider'; // Disabled due to native build issue
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

import {
    UnshieldedAddress,
    MidnightBech32m,
    mainnet
} from '@midnight-ntwrk/wallet-sdk-address-format';
import { signatureVerifyingKey, addressFromKey } from '@midnight-ntwrk/ledger-v7';


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
// Simple JSON cache for last known balances (persisted across restarts)
const WALLET_CACHE_PATH = path.resolve(projectRoot, 'wallet-cache.json');
function loadWalletCache() {
    try {
        const raw = fs.readFileSync(WALLET_CACHE_PATH, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}
function saveWalletCache(cache: Record<string, any>) {
    try {
        fs.writeFileSync(WALLET_CACHE_PATH, JSON.stringify(cache, null, 2));
    } catch { }
}

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

// Wallet cache stored on globalThis to survive Next.js Fast Refresh & dev recompiles
interface CachedWalletContext {
    wallet: any;
    shieldedSecretKeys: any;
    dustSecretKey: any;
    unshieldedKeystore: any;
    seed: string;
    lastActive: number;
    lastKnownNightBalance?: string;
    lastKnownDustBalance?: string;
    lastDustFee?: bigint;
}

const globalForMidnight = globalThis as unknown as {
    __midnightWalletCache?: Map<string, CachedWalletContext>;
};

const walletCache = globalForMidnight.__midnightWalletCache ?? new Map<string, CachedWalletContext>();
if (process.env.NODE_ENV !== 'production') globalForMidnight.__midnightWalletCache = walletCache;

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
        // Hydrate cached balances from persisted file if they are missing
        const persisted = loadWalletCache();
        if (persisted.dustBalance && !existing.lastKnownDustBalance) {
            existing.lastKnownDustBalance = persisted.dustBalance;
        }
        if (persisted.nightBalance && !existing.lastKnownNightBalance) {
            existing.lastKnownNightBalance = persisted.nightBalance;
        }
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
        txHistoryStorage: new FileTransactionHistoryStorage(),
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

    // Load any persisted balances for a fresh wallet
    const persisted = loadWalletCache();
    if (persisted.dustBalance) ctx.lastKnownDustBalance = persisted.dustBalance;
    if (persisted.nightBalance) ctx.lastKnownNightBalance = persisted.nightBalance;

    walletCache.set(cleanSeed, ctx);
    return ctx;
}

export async function createProviders(walletCtx: CachedWalletContext) {
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

    // Lazy-load private state provider to avoid native build issues
    let privateStateProvider;
    try {
        const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
        privateStateProvider = levelPrivateStateProvider({
            privateStateStoreName: 'hello-world-state',
            accountId,
            privateStoragePasswordProvider: () => PRIVATE_STATE_PASSWORD,
        });
    } catch {
        console.warn('levelPrivateStateProvider unavailable, using dummy provider');
        privateStateProvider = () => ({});
    }

    // Return the assembled providers object
    return {
        privateStateProvider,
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
    let state = await Rx.firstValueFrom(
        walletCtx.wallet.state().pipe(
            Rx.timeout({ each: 10000, with: () => walletCtx.wallet.state() }),
        )
    ).catch(() => null);

    // If state is freshly starting (0 balance and 0 progress), wait up to 1.5s for initial WebSocket snapshot
    if (state && (!(state as any).unshielded?.balances || Object.keys((state as any).unshielded.balances).length === 0) && !(state as any).isSynced) {
        state = await Rx.firstValueFrom(
            walletCtx.wallet.state().pipe(
                Rx.filter((s: any) => (s.unshielded?.balances && Object.keys(s.unshielded.balances).length > 0) || (s.unshielded?.progress?.appliedId && BigInt(s.unshielded.progress.appliedId) > 0n) || s.isSynced),
                Rx.timeout({ each: 1500, with: () => walletCtx.wallet.state() }),
            )
        ).catch(() => state);
    }

    const isSynced = (state as any)?.isSynced ?? false;
    let tNightBalance = state ? ((state as any).unshielded?.balances?.[unshieldedToken().raw] ?? 0n).toString() : '0';
    let dustBalance = state ? ((state as any).dust?.balance?.(new Date()) ?? 0n).toString() : '0';

    if (tNightBalance !== '0') {
        walletCtx.lastKnownNightBalance = tNightBalance;
    } else if (walletCtx.lastKnownNightBalance && !isSynced) {
        tNightBalance = walletCtx.lastKnownNightBalance;
    }

    if (dustBalance !== '0') {
        walletCtx.lastKnownDustBalance = dustBalance;
    } else if (walletCtx.lastKnownDustBalance && !isSynced) {
        dustBalance = walletCtx.lastKnownDustBalance;
    }

    // Persist the latest balances to the cache file
    saveWalletCache({
        dustBalance: walletCtx.lastKnownDustBalance,
        nightBalance: walletCtx.lastKnownNightBalance,
    });

    const unshieldedProgress = (state as any)?.unshielded?.progress;
    const shieldedProgress = (state as any)?.shielded?.progress;
    const dustProgress = (state as any)?.dust?.progress;

    const unshieldedApplied = unshieldedProgress?.appliedId ? BigInt(unshieldedProgress.appliedId.toString()) : 0n;
    const unshieldedHighest = unshieldedProgress?.highestTransactionId ? BigInt(unshieldedProgress.highestTransactionId.toString()) : 0n;
    const isUnshieldedStrictlyComplete = typeof unshieldedProgress?.isStrictlyComplete === 'function' ? unshieldedProgress.isStrictlyComplete() : false;

    const shieldedApplied = (shieldedProgress?.appliedIndex ?? shieldedProgress?.appliedId) ? BigInt((shieldedProgress?.appliedIndex ?? shieldedProgress?.appliedId).toString()) : 0n;
    const shieldedHighest = (shieldedProgress?.highestRelevantIndex ?? shieldedProgress?.highestIndex ?? shieldedProgress?.highestRelevantWalletIndex ?? shieldedProgress?.highestTransactionId) ? BigInt((shieldedProgress?.highestRelevantIndex ?? shieldedProgress?.highestIndex ?? shieldedProgress?.highestRelevantWalletIndex ?? shieldedProgress?.highestTransactionId).toString()) : 0n;
    const isShieldedStrictlyComplete = typeof shieldedProgress?.isStrictlyComplete === 'function' ? shieldedProgress.isStrictlyComplete() : false;

    const dustApplied = (dustProgress?.appliedIndex ?? dustProgress?.appliedId) ? BigInt((dustProgress?.appliedIndex ?? dustProgress?.appliedId).toString()) : 0n;
    const dustHighest = (dustProgress?.highestRelevantIndex ?? dustProgress?.highestIndex ?? dustProgress?.highestRelevantWalletIndex ?? dustProgress?.highestTransactionId) ? BigInt((dustProgress?.highestRelevantIndex ?? dustProgress?.highestIndex ?? dustProgress?.highestRelevantWalletIndex ?? dustProgress?.highestTransactionId).toString()) : 0n;
    const isDustStrictlyComplete = typeof dustProgress?.isStrictlyComplete === 'function' ? dustProgress.isStrictlyComplete() : false;

    const isConnected = unshieldedProgress?.isConnected ?? false;

    // Calculate individual percentages
    const pUnshielded = isUnshieldedStrictlyComplete ? 100 : (unshieldedHighest > 0n ? Math.min(100, Math.round((Number(unshieldedApplied) / Number(unshieldedHighest)) * 100)) : 0);
    const pShielded = isShieldedStrictlyComplete ? 100 : (shieldedHighest > 0n ? Math.min(100, Math.round((Number(shieldedApplied) / Number(shieldedHighest)) * 100)) : 0);
    const pDust = isDustStrictlyComplete ? 100 : (dustHighest > 0n ? Math.min(100, Math.round((Number(dustApplied) / Number(dustHighest)) * 100)) : 0);

    let overallPercentage = Math.floor((pUnshielded + pShielded + pDust) / 3);
    if (isSynced || (isUnshieldedStrictlyComplete && isShieldedStrictlyComplete && isDustStrictlyComplete)) {
        overallPercentage = 100;
    } else if (overallPercentage >= 100 && !isSynced) {
        overallPercentage = 99; // Cap at 99% until isSynced is strictly true
    }

    return {
        address,
        isSynced,
        tNightBalance,
        dustBalance,
        network: 'preprod',
        faucetUrl: CONFIG.faucet,
        syncProgress: {
            appliedId: unshieldedApplied.toString(),
            highestTransactionId: unshieldedHighest.toString(),
            isConnected,
            percentage: overallPercentage,
            unshielded: {
                applied: unshieldedApplied.toString(),
                highest: unshieldedHighest.toString(),
                percentage: pUnshielded,
            },
            shielded: {
                applied: shieldedApplied.toString(),
                highest: shieldedHighest.toString(),
                percentage: pShielded,
            },
            dust: {
                applied: dustApplied.toString(),
                highest: dustHighest.toString(),
                percentage: pDust,
            },
        },
    };
}

/**
 * Waits for wallet to sync and registers NIGHT UTXOs for DUST generation
 */
export async function registerForDust(seed: string) {
    const walletCtx = await getOrCreateWallet(seed);
    // Ensure wallet is synced before registering for DUST generation
    await walletCtx.wallet.waitForSyncedState();

    // Wait for unshielded available coins (does not require DUST historical indexer scan to finish)
    let state: any = await Rx.firstValueFrom(
        walletCtx.wallet.state().pipe(
            Rx.filter((s: any) => (s.unshielded?.availableCoins && s.unshielded.availableCoins.length > 0) || s.isSynced),
            Rx.timeout({ each: 10000, with: () => walletCtx.wallet.state() }),
        )
    ).catch(() => null);

    if (!state || !state.unshielded?.availableCoins || state.unshielded.availableCoins.length === 0) {
        throw new Error('No unshielded tNIGHT coins detected yet. Please ensure your wallet has funds from the Nethermind faucet.');
    }

    const currentDust = state.dust?.balance?.(new Date()) ?? 0n;
    if (currentDust > 0n) {
        return {
            success: true,
            alreadyRegistered: true,
            dustBalance: currentDust.toString(),
            message: 'DUST is already active and available for transactions.',
        };
    }

    const nightUtxos = state.unshielded.availableCoins.filter((c: any) => !c.meta?.registeredForDustGeneration);
    if (nightUtxos.length === 0) {
        return {
            success: true,
            alreadyRegistered: true,
            message: 'All available tNIGHT UTXOs are already registered for DUST generation. DUST generation is pending epoch distribution.',
        };
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
    const dustPaid = walletCtx.lastDustFee ? walletCtx.lastDustFee.toString() : '0';

    return {
        success: true,
        message: message.trim(),
        contractAddress: targetAddress,
        txHash: tx.public.txHash,
        blockHeight: tx.public.blockHeight,
        dustPaid,
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
    // Ensure wallet is synced before creating a deployment transaction
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
    const dustPaid = walletCtx.lastDustFee ? walletCtx.lastDustFee.toString() : '0';

    saveDeployment(contractAddress, seed);

    return {
        success: true,
        contractAddress,
        dustPaid,
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

/**
 * Sends unshielded tNIGHT tokens to a specified address.
 * This is a placeholder implementation; replace with actual transfer logic using the Midnight SDK.
 */
export async function sendUnshieldedTNight(seed: string, receiver: string, amount: string) {
    // Ensure wallet is initialized
    const walletCtx = await getOrCreateWallet(seed);
    const wallet = walletCtx.wallet;
    if (!wallet) {
        throw new Error('Wallet not initialized');
    }

    if (!receiver) {
        throw new Error('Receiver address is required');
    }
    const amtNum = Number(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
        throw new Error('Amount must be a positive number');
    }
    // Convert to base units (6 decimals)
    const amountUnits = BigInt(Math.floor(amtNum * 1_000_000));

    // Ensure wallet is synced
    await wallet.waitForSyncedState();

    // Check balance
    const status = await getWalletStatus(seed);
    const balance = BigInt(status.tNightBalance);
    if (amountUnits > balance) {
        throw new Error(`Insufficient tNIGHT balance (Available: ${status.tNightBalance}, Required: ${amountUnits})`);
    }

    // Decode the receiver address (supports Bech32m address or 64-char hex)
    const networkId = getNetworkId();
    let receiverAddress: UnshieldedAddress;
    try {
        receiverAddress = MidnightBech32m.parse(receiver.trim()).decode(UnshieldedAddress, networkId);
    } catch {
        if (/^[0-9a-fA-F]{64}$/.test(receiver.trim())) {
            receiverAddress = new UnshieldedAddress(Buffer.from(receiver.trim(), 'hex'));
        } else {
            throw new Error(`Invalid receiver unshielded address for network '${networkId}': ${receiver}`);
        }
    }

    // Create unshielded transfer transaction recipe via WalletFacade
    const recipe = await wallet.transferTransaction(
        [
            {
                type: 'unshielded',
                outputs: [
                    {
                        type: unshieldedToken().raw,
                        receiverAddress,
                        amount: amountUnits,
                    },
                ],
            },
        ],
        {
            shieldedSecretKeys: walletCtx.shieldedSecretKeys,
            dustSecretKey: walletCtx.dustSecretKey,
        },
        {
            ttl: new Date(Date.now() + 30 * 60 * 1000),
            payFees: true,
        },
    );

    // Sign the transfer recipe with the unshielded keystore
    const signedRecipe = await wallet.signRecipe(
        recipe,
        (payload: Uint8Array) => walletCtx.unshieldedKeystore.signData(payload),
    );

    // Finalize recipe (generate ZK proofs & bind) and submit to the Midnight network
    const startTime = Date.now();
    const finalized = await wallet.finalizeRecipe(signedRecipe);
    const txId = await wallet.submitTransaction(finalized);
    const durationMs = Date.now() - startTime;

    let dustPaid = '0';
    try {
        const fee = await wallet.calculateTransactionFee(finalized);
        if (fee && typeof fee === 'bigint' && fee > 0n) {
            dustPaid = fee.toString();
        }
    } catch {
        dustPaid = walletCtx.lastDustFee ? walletCtx.lastDustFee.toString() : '0';
    }

    return {
        txHash: txId,
        dustPaid,
        amount,
        amountUnits: amountUnits.toString(),
        receiver: receiver.trim(),
        durationMs,
        network: networkId,
        timestamp: new Date().toISOString(),
    };
}



export function deriveUnshieldedAddressFromSeed(seed: string, network: 'mainnet' | 'preprod' | 'preview' = 'preprod') {
    // --- NEW: Derive the unshielded address ---
    // 1. Get the public key from the private key
    const publicKey = signatureVerifyingKey(seed);

    // 2. Derive the 32-byte address from the public key
    const addressHex = addressFromKey(publicKey);

    // 3. Create an UnshieldedAddress object
    const unshieldedAddress = new UnshieldedAddress(Buffer.from(addressHex, 'hex'));

    // 4. Encode it as a Bech32m string
    // Use 'mainnet' for mainnet, or 'preprod' / 'preview' for testnets
    if (network === 'mainnet') {
        return MidnightBech32m.encode('mainnet', unshieldedAddress).toString();
    } else if (network === 'preprod') {
        return MidnightBech32m.encode('preprod', unshieldedAddress).toString();
    } else if (network === 'preview') {
        return MidnightBech32m.encode('preview', unshieldedAddress).toString();
    } else {
        throw new Error('Invalid network');
    }

}