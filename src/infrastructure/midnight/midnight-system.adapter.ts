import type { ISystemGateway } from '@/src/domain/ports/i-system.gateway';
import type { IDeploymentStorage } from '@/src/domain/ports/i-deployment.storage';
import type { SystemHealthReport } from '@/src/domain/entities/system.entity';
import { MIDNIGHT_CONFIG } from '../config/midnight.config';

export class MidnightSystemAdapter implements ISystemGateway {
    constructor(private readonly deploymentStorage: IDeploymentStorage) {}

    async getHealthReport(): Promise<SystemHealthReport> {
        let proofServerOk = false;
        let indexerOk = false;
        let currentBlockHeight: number | null = null;

        // Run checks concurrently
        const [proofResult, indexerResult] = await Promise.allSettled([
            fetch(MIDNIGHT_CONFIG.proofServer, {
                method: 'GET',
                signal: AbortSignal.timeout(3000),
            }),
            fetch(MIDNIGHT_CONFIG.indexer, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: '{ block { height } }' }),
                signal: AbortSignal.timeout(6000),
            }),
        ]);

        if (proofResult.status === 'fulfilled' && proofResult.value) {
            const status = proofResult.value.status;
            if (status === 200 || status === 404 || status === 405) {
                proofServerOk = true;
            }
        }

        if (indexerResult.status === 'fulfilled' && indexerResult.value?.ok) {
            try {
                const data = await indexerResult.value.json();
                if (data?.data?.block?.height !== undefined) {
                    indexerOk = true;
                    currentBlockHeight = Number(data.data.block.height);
                }
            } catch {
                indexerOk = false;
            }
        }

        const deployment = await this.deploymentStorage.getDeployment();

        return {
            proofServer: {
                url: MIDNIGHT_CONFIG.proofServer,
                status: proofServerOk ? 'online' : 'offline',
            },
            indexer: {
                url: MIDNIGHT_CONFIG.indexer,
                status: indexerOk ? 'online' : 'offline',
                blockHeight: currentBlockHeight,
            },
            network: MIDNIGHT_CONFIG.networkId,
            deployment,
            faucetUrl: MIDNIGHT_CONFIG.faucet,
        };
    }
}
