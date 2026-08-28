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

        // Check Proof Server
        try {
            const proofRes = await fetch(MIDNIGHT_CONFIG.proofServer, {
                method: 'GET',
                signal: AbortSignal.timeout(3000),
            }).catch(() => null);
            if (proofRes && (proofRes.status === 200 || proofRes.status === 404 || proofRes.status === 405)) {
                proofServerOk = true;
            }
        } catch {
            proofServerOk = false;
        }

        // Check Indexer GraphQL
        try {
            const indexerRes = await fetch(MIDNIGHT_CONFIG.indexer, {
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
