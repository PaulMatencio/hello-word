import * as fs from 'node:fs';
import * as path from 'node:path';
import { pathToFileURL } from 'node:url';
import { findDeployedContract, deployContract } from '@midnight-ntwrk/midnight-js-contracts';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import { CompiledContract } from '@midnight-ntwrk/midnight-js-protocol/compact-js';
import type { IContractGateway } from '@/src/domain/ports/i-contract.gateway';
import type { IWalletGateway } from '@/src/domain/ports/i-wallet.gateway';
import type { IDeploymentStorage } from '@/src/domain/ports/i-deployment.storage';
import type {
    TransactionExecutionReceipt,
    DeploymentExecutionReceipt,
    ContractMessageSnapshot,
} from '@/src/domain/entities/contract.entity';
import {
    WalletNotSyncedError,
    InsufficientDustError,
    ContractNotFoundError,
    InvalidInputError,
} from '@/src/domain/errors/domain-errors';
import { MIDNIGHT_CONFIG } from '../config/midnight.config';
import { createProviders } from './midnight-providers.factory';
import * as HelloWorldContract from '@/contracts/managed/hello-world/contract/index.js';

import type { FileTransactionHistoryStorage } from '@/src/lib/file-transaction-history-storage';

export class MidnightContractAdapter implements IContractGateway {
    private compiledContractCache: any = null;

    constructor(
        private readonly walletGateway: IWalletGateway,
        private readonly deploymentStorage: IDeploymentStorage,
        private readonly txHistoryStorage?: FileTransactionHistoryStorage,
    ) {}

    async getContractArtifacts() {
        if (this.compiledContractCache) {
            return this.compiledContractCache;
        }

        const HelloWorld = (HelloWorldContract as any).Contract || (HelloWorldContract as any).default?.Contract || HelloWorldContract;
        const zkConfigPath = path.resolve(process.cwd(), 'contracts', 'managed', 'hello-world');
        const compiledContract = CompiledContract.make('hello-world', HelloWorld).pipe(
            CompiledContract.withVacantWitnesses,
            CompiledContract.withCompiledFileAssets(zkConfigPath),
        );

        this.compiledContractCache = { HelloWorld, compiledContract };
        return this.compiledContractCache;
    }

    async storeMessage(seed: string, message: string, contractAddress?: string): Promise<TransactionExecutionReceipt> {
        if (!message || message.trim().length === 0) {
            throw new InvalidInputError('Message cannot be empty.');
        }

        const targetAddress = contractAddress || this.deploymentStorage.getDeployment()?.contractAddress;
        if (!targetAddress) {
            throw new ContractNotFoundError();
        }

        const status = await this.walletGateway.getWalletStatus(seed);
        if (!status.isSynced) {
            throw new WalletNotSyncedError(status.syncProgress?.percentage);
        }

        const currentDust = BigInt(status.dustBalance || '0');
        if (currentDust === 0n) {
            throw new InsufficientDustError();
        }

        const { compiledContract } = await this.getContractArtifacts();
        const walletCtx = await this.walletGateway.getOrCreateWalletContext(seed);
        await walletCtx.wallet.waitForSyncedState();

        const providers = createProviders(walletCtx);

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

        const receipt: TransactionExecutionReceipt = {
            success: true,
            message: message.trim(),
            contractAddress: targetAddress,
            txHash: tx.public.txHash,
            blockHeight: tx.public.blockHeight,
            dustPaid,
            durationMs,
            timestamp: new Date().toISOString(),
        };

        if (this.txHistoryStorage) {
            try {
                await this.txHistoryStorage.storeTxRecord({
                    id: `tx-${Date.now()}`,
                    txHash: tx.public.txHash,
                    blockHeight: tx.public.blockHeight,
                    message: message.trim(),
                    timestamp: receipt.timestamp,
                    dustPaid,
                    durationMs,
                });
            } catch (e) {
                console.warn('Failed to persist tx record:', e);
            }
        }

        return receipt;
    }

    async deployContract(seed: string): Promise<DeploymentExecutionReceipt> {
        const status = await this.walletGateway.getWalletStatus(seed);
        if (!status.isSynced) {
            throw new WalletNotSyncedError(status.syncProgress?.percentage);
        }

        const currentDust = BigInt(status.dustBalance || '0');
        if (currentDust === 0n) {
            throw new InsufficientDustError();
        }

        const { compiledContract } = await this.getContractArtifacts();
        const walletCtx = await this.walletGateway.getOrCreateWalletContext(seed);
        await walletCtx.wallet.waitForSyncedState();

        const providers = createProviders(walletCtx);

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

        this.deploymentStorage.saveDeployment({
            contractAddress,
            deployerSeed: seed.trim(),
            deployedAt: new Date().toISOString(),
        });

        const receipt: DeploymentExecutionReceipt = {
            success: true,
            contractAddress,
            dustPaid,
            durationMs,
            network: MIDNIGHT_CONFIG.networkId,
            deployedAt: new Date().toISOString(),
        };

        if (this.txHistoryStorage) {
            try {
                await this.txHistoryStorage.storeTxRecord({
                    id: `deploy-${Date.now()}`,
                    txHash: contractAddress,
                    blockHeight: null,
                    message: `Contract Deployed: ${contractAddress.slice(0, 10)}...`,
                    timestamp: receipt.deployedAt,
                    dustPaid,
                    durationMs,
                });
            } catch (e) {
                console.warn('Failed to persist deploy tx record:', e);
            }
        }

        return receipt;
    }

    async getContractState(contractAddress?: string): Promise<ContractMessageSnapshot> {
        const targetAddress = contractAddress || this.deploymentStorage.getDeployment()?.contractAddress;
        if (!targetAddress) {
            throw new ContractNotFoundError();
        }

        const { HelloWorld } = await this.getContractArtifacts();
        const publicDataProvider = indexerPublicDataProvider(MIDNIGHT_CONFIG.indexer, MIDNIGHT_CONFIG.indexerWS);
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

        const ledgerFn = (HelloWorldContract as any).ledger || (HelloWorldContract as any).default?.ledger || (HelloWorld as any).ledger;
        let message = '';
        if (ledgerFn) {
            try {
                const ledgerState = ledgerFn(state.data);
                message = ledgerState?.message || '';
            } catch (e) {
                console.warn('Error extracting ledger message:', e);
            }
        }

        return {
            contractAddress: targetAddress,
            found: true,
            message,
            raw: state,
            lastChecked: new Date().toISOString(),
        };
    }
}
